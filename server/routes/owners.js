// server/routes/owners.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all owners
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query('SELECT * FROM Owners ORDER BY LastName, FirstName');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get owner by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Owners WHERE OwnerID = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get owner with their dogs
router.get('/:id/dogs', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          o.*,
          d.DogID,
          d.DogName,
          d.Breed,
          d.Color,
          d.DateOfBirth,
          d.Gender,
          d.IsSpayedNeutered,
          d.MicrochipNumber
        FROM Owners o
        LEFT JOIN Dogs d ON o.OwnerID = d.OwnerID
        WHERE o.OwnerID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Format response to group dogs under owner
    const owner = {
      OwnerID: result.recordset[0].OwnerID,
      FirstName: result.recordset[0].FirstName,
      LastName: result.recordset[0].LastName,
      Email: result.recordset[0].Email,
      Phone: result.recordset[0].Phone,
      Address: result.recordset[0].Address,
      City: result.recordset[0].City,
      State: result.recordset[0].State,
      ZipCode: result.recordset[0].ZipCode,
      CreatedAt: result.recordset[0].CreatedAt,
      UpdatedAt: result.recordset[0].UpdatedAt,
      dogs: result.recordset
        .filter(row => row.DogID !== null)
        .map(row => ({
          DogID: row.DogID,
          DogName: row.DogName,
          Breed: row.Breed,
          Color: row.Color,
          DateOfBirth: row.DateOfBirth,
          Gender: row.Gender,
          IsSpayedNeutered: row.IsSpayedNeutered,
          MicrochipNumber: row.MicrochipNumber
        }))
    };

    res.json(owner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search owners by name or email
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = `%${req.params.term}%`;
    const result = await req.db.request()
      .input('term', sql.NVarChar, searchTerm)
      .query(`
        SELECT * FROM Owners 
        WHERE FirstName LIKE @term 
        OR LastName LIKE @term 
        OR Email LIKE @term
        OR Phone LIKE @term
        ORDER BY LastName, FirstName
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new owner
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        error: 'First name, last name, and email are required' 
      });
    }

    // Check if email already exists
    const checkEmail = await req.db.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT OwnerID FROM Owners WHERE Email = @email');

    if (checkEmail.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'An owner with this email already exists' 
      });
    }

    const result = await req.db.request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone || null)
      .input('address', sql.NVarChar, address || null)
      .input('city', sql.NVarChar, city || null)
      .input('state', sql.NVarChar, state || null)
      .input('zipCode', sql.NVarChar, zipCode || null)
      .query(`
        INSERT INTO Owners 
        (FirstName, LastName, Email, Phone, Address, City, State, ZipCode)
        OUTPUT INSERTED.OwnerID, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email
        VALUES (@firstName, @lastName, @email, @phone, @address, @city, @state, @zipCode)
      `);

    res.status(201).json({
      ownerId: result.recordset[0].OwnerID,
      message: 'Owner created successfully',
      owner: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update owner
router.put('/:id', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode
    } = req.body;

    // Check if owner exists
    const checkOwner = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OwnerID FROM Owners WHERE OwnerID = @id');

    if (checkOwner.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Check if email is being changed to one that already exists
    if (email) {
      const checkEmail = await req.db.request()
        .input('email', sql.NVarChar, email)
        .input('id', sql.Int, req.params.id)
        .query('SELECT OwnerID FROM Owners WHERE Email = @email AND OwnerID != @id');

      if (checkEmail.recordset.length > 0) {
        return res.status(409).json({ 
          error: 'An owner with this email already exists' 
        });
      }
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('address', sql.NVarChar, address)
      .input('city', sql.NVarChar, city)
      .input('state', sql.NVarChar, state)
      .input('zipCode', sql.NVarChar, zipCode)
      .query(`
        UPDATE Owners 
        SET FirstName = @firstName,
            LastName = @lastName,
            Email = @email,
            Phone = @phone,
            Address = @address,
            City = @city,
            State = @state,
            ZipCode = @zipCode,
            UpdatedAt = GETDATE()
        WHERE OwnerID = @id
      `);

    res.json({ message: 'Owner updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete owner (will cascade delete dogs and licenses)
router.delete('/:id', async (req, res) => {
  try {
    // Check if owner exists
    const checkOwner = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OwnerID FROM Owners WHERE OwnerID = @id');

    if (checkOwner.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Check if owner has active licenses
    const activeLicenses = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT COUNT(*) as count 
        FROM Licenses l
        INNER JOIN Dogs d ON l.DogID = d.DogID
        WHERE d.OwnerID = @id AND l.Status = 'Active'
      `);

    if (activeLicenses.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete owner with active licenses. Please expire or revoke licenses first.' 
      });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Owners WHERE OwnerID = @id');
    
    res.json({ message: 'Owner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get owner statistics
router.get('/:id/statistics', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          COUNT(DISTINCT d.DogID) as TotalDogs,
          COUNT(DISTINCT l.LicenseID) as TotalLicenses,
          SUM(CASE WHEN l.Status = 'Active' THEN 1 ELSE 0 END) as ActiveLicenses,
          SUM(CASE WHEN l.Status = 'Expired' THEN 1 ELSE 0 END) as ExpiredLicenses,
          SUM(l.Fee) as TotalFeespaid
        FROM Owners o
        LEFT JOIN Dogs d ON o.OwnerID = d.OwnerID
        LEFT JOIN Licenses l ON d.DogID = l.DogID
        WHERE o.OwnerID = @id
        GROUP BY o.OwnerID
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;