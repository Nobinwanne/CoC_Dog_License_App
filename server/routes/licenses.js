// server/routes/licenses.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all licenses with details
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query('SELECT * FROM vw_LicenseDetails ORDER BY ExpirationDate DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get license by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM vw_LicenseDetails WHERE LicenseID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'License not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search licenses by owner name or license number
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = `%${req.params.term}%`;
    const result = await req.db.request()
      .input('term', sql.NVarChar, searchTerm)
      .query(`
        SELECT * FROM vw_LicenseDetails 
        WHERE FirstName LIKE @term 
        OR LastName LIKE @term 
        OR LicenseNumber LIKE @term
        OR Email LIKE @term
        ORDER BY ExpirationDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get expiring licenses (within next 30 days)
router.get('/status/expiring', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT * FROM vw_LicenseDetails 
        WHERE Status = 'Active' 
        AND ExpirationDate BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
        ORDER BY ExpirationDate ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new license
router.post('/', async (req, res) => {
  try {
    const {
      dogId,
      licenseNumber,
      issueDate,
      expirationDate,
      licenseType,
      fee,
      rabiesVaccinationDate,
      rabiesVaccinationExpiration,
      veterinarianName
    } = req.body;

    const result = await req.db.request()
      .input('dogId', sql.Int, dogId)
      .input('licenseNumber', sql.NVarChar, licenseNumber)
      .input('issueDate', sql.Date, issueDate)
      .input('expirationDate', sql.Date, expirationDate)
      .input('licenseType', sql.NVarChar, licenseType)
      .input('fee', sql.Decimal(10, 2), fee)
      .input('rabiesVaccinationDate', sql.Date, rabiesVaccinationDate)
      .input('rabiesVaccinationExpiration', sql.Date, rabiesVaccinationExpiration)
      .input('veterinarianName', sql.NVarChar, veterinarianName)
      .query(`
        INSERT INTO Licenses 
        (DogID, LicenseNumber, IssueDate, ExpirationDate, LicenseType, Fee, 
         RabiesVaccinationDate, RabiesVaccinationExpiration, VeterinarianName)
        OUTPUT INSERTED.LicenseID
        VALUES (@dogId, @licenseNumber, @issueDate, @expirationDate, @licenseType, @fee,
                @rabiesVaccinationDate, @rabiesVaccinationExpiration, @veterinarianName)
      `);

    res.status(201).json({ 
      licenseId: result.recordset[0].LicenseID,
      message: 'License created successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update license
router.put('/:id', async (req, res) => {
  try {
    const {
      expirationDate,
      status,
      rabiesVaccinationDate,
      rabiesVaccinationExpiration,
      veterinarianName
    } = req.body;

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('expirationDate', sql.Date, expirationDate)
      .input('status', sql.NVarChar, status)
      .input('rabiesVaccinationDate', sql.Date, rabiesVaccinationDate)
      .input('rabiesVaccinationExpiration', sql.Date, rabiesVaccinationExpiration)
      .input('veterinarianName', sql.NVarChar, veterinarianName)
      .query(`
        UPDATE Licenses 
        SET ExpirationDate = @expirationDate,
            Status = @status,
            RabiesVaccinationDate = @rabiesVaccinationDate,
            RabiesVaccinationExpiration = @rabiesVaccinationExpiration,
            VeterinarianName = @veterinarianName,
            UpdatedAt = GETDATE()
        WHERE LicenseID = @id
      `);

    res.json({ message: 'License updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Renew license
router.post('/:id/renew', async (req, res) => {
  try {
    const { expirationDate, fee } = req.body;

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('expirationDate', sql.Date, expirationDate)
      .query(`
        UPDATE Licenses 
        SET ExpirationDate = @expirationDate,
            Status = 'Active',
            UpdatedAt = GETDATE()
        WHERE LicenseID = @id
      `);

    res.json({ message: 'License renewed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete license
router.delete('/:id', async (req, res) => {
  try {
    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Licenses WHERE LicenseID = @id');
    
    res.json({ message: 'License deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;