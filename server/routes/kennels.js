// server/routes/kennels.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all kennel licenses
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          k.*,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1 as Phone
        FROM Kennels k
        INNER JOIN Owners o ON k.OwnerID = o.OwnerID
        ORDER BY k.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get kennel license by ID with all covered dogs
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          k.*,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1 as Phone,
          o.Address,
          o.City,
          o.Province,
          o.PostalCode
        FROM Kennels k
        INNER JOIN Owners o ON k.OwnerID = o.OwnerID
        WHERE k.KennelID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Kennel license not found' });
    }

    const kennel = result.recordset[0];

    // Get all dogs for this owner
    const dogsResult = await req.db.request()
      .input('ownerId', sql.Int, kennel.OwnerID)
      .query(`
        SELECT 
          d.DogID,
          d.DogName,
          d.Breed,
          d.Color,
          d.Gender,
          t.TagNumber
        FROM Dogs d
        LEFT JOIN Licenses l ON d.DogID = l.DogID
        LEFT JOIN Tags t ON l.TagID = t.TagID
        WHERE d.OwnerID = @ownerId
      `);

    kennel.dogs = dogsResult.recordset;
    
    res.json(kennel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get kennels by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT * FROM Kennels 
        WHERE OwnerID = @ownerId
        ORDER BY CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if owner is eligible for kennel license (3+ dogs)
router.get('/check-eligibility/:ownerId', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT COUNT(*) as DogCount
        FROM Dogs
        WHERE OwnerID = @ownerId
      `);
    
    const dogCount = result.recordset[0].DogCount;
    const isEligible = dogCount >= 3;

    res.json({ 
      eligible: isEligible, 
      dogCount: dogCount,
      minimumRequired: 3
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new kennel license
router.post('/', async (req, res) => {
  try {
    const {
      ownerId,
      kennelLicenseNumber,
      issueDate,
      issueYear,
      fee,
      paymentMethod,
      transactionId,
      paymentStatus,
      notes
    } = req.body;

    console.log('Received kennel license creation request:', req.body);

    // Validate required fields
    if (!ownerId || !kennelLicenseNumber || !issueYear) {
      return res.status(400).json({ 
        error: 'Owner ID, Kennel License Number, and Issue Year are required' 
      });
    }

    // Check if owner exists
    const checkOwner = await req.db.request()
      .input('ownerId', sql.Int, ownerId)
      .query('SELECT OwnerID FROM Owners WHERE OwnerID = @ownerId');

    if (checkOwner.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Check if owner has at least 3 dogs
    const dogCount = await req.db.request()
      .input('ownerId', sql.Int, ownerId)
      .query('SELECT COUNT(*) as DogCount FROM Dogs WHERE OwnerID = @ownerId');

    const numberOfDogs = dogCount.recordset[0].DogCount;

    if (numberOfDogs < 3) {
      return res.status(400).json({ 
        error: `Owner must have at least 3 dogs for a kennel license. This owner has ${numberOfDogs} dog(s).` 
      });
    }

    // Check if kennel license number already exists
    const checkLicenseNumber = await req.db.request()
      .input('kennelLicenseNumber', sql.NVarChar, kennelLicenseNumber)
      .query('SELECT KennelID FROM Kennels WHERE KennelLicenseNumber = @kennelLicenseNumber');

    if (checkLicenseNumber.recordset.length > 0) {
      return res.status(409).json({ 
        error: 'This kennel license number already exists' 
      });
    }

    // Create the kennel license
    const result = await req.db.request()
      .input('ownerId', sql.Int, ownerId)
      .input('kennelLicenseNumber', sql.NVarChar, kennelLicenseNumber)
      .input('issueDate', sql.Date, issueDate || new Date())
      .input('issueYear', sql.NVarChar, issueYear)
      .input('fee', sql.Decimal(10, 2), fee || 100.00)
      .input('status', sql.NVarChar, 'Active')
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .input('transactionId', sql.NVarChar, transactionId || null)
      .input('paymentStatus', sql.NVarChar, paymentStatus || 'Completed')
      .input('notes', sql.NVarChar, notes || null)
      .input('numberOfDogs', sql.Int, numberOfDogs)
      .query(`
        INSERT INTO Kennels 
        (OwnerID, KennelLicenseNumber, IssueDate, IssueYear, Fee, Status, PaymentMethod, TransactionID, PaymentStatus, Notes, NumberOfDogs)
        OUTPUT INSERTED.KennelID, INSERTED.KennelLicenseNumber
        VALUES (@ownerId, @kennelLicenseNumber, @issueDate, @issueYear, @fee, @status, @paymentMethod, @transactionId, @paymentStatus, @notes, @numberOfDogs)
      `);

    console.log('Kennel license created:', result.recordset[0]);

    res.status(201).json({ 
      kennelId: result.recordset[0].KennelID,
      message: 'Kennel license created successfully',
      kennel: result.recordset[0]
    });
  } catch (err) {
    console.error('Error creating kennel license:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update kennel license
router.put('/:id', async (req, res) => {
  try {
    const { status, notes, paymentStatus } = req.body;

    const checkKennel = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT KennelID FROM Kennels WHERE KennelID = @id');

    if (checkKennel.recordset.length === 0) {
      return res.status(404).json({ error: 'Kennel license not found' });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar, status)
      .input('notes', sql.NVarChar, notes)
      .input('paymentStatus', sql.NVarChar, paymentStatus)
      .query(`
        UPDATE Kennels 
        SET Status = COALESCE(@status, Status),
            Notes = COALESCE(@notes, Notes),
            PaymentStatus = COALESCE(@paymentStatus, PaymentStatus)
        WHERE KennelID = @id
      `);

    res.json({ message: 'Kennel license updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete kennel license
router.delete('/:id', async (req, res) => {
  try {
    const checkKennel = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT KennelID FROM Kennels WHERE KennelID = @id');

    if (checkKennel.recordset.length === 0) {
      return res.status(404).json({ error: 'Kennel license not found' });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Kennels WHERE KennelID = @id');
    
    res.json({ message: 'Kennel license deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;