const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all dogs
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          d.*,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1,
          o.Phone2
        FROM Dogs d
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        ORDER BY d.DogName
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dog by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          d.*,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1,
          o.Phone2,
          o.Address,
          o.City,
          o.Province,
          o.PostalCode
        FROM Dogs d
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        WHERE d.DogID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dogs by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT * FROM Dogs 
        WHERE OwnerID = @ownerId
        ORDER BY DogName
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new dog
router.post('/', async (req, res) => {
  try {
    const {
      ownerId,
      dogName,
      roll,
      breed,
      color,
      dateOfBirth,
      gender,
      isSpayedNeutered,
      isNuisance
    } = req.body;

    console.log('Received dog creation request:', req.body);

    // Validate required fields
    if (!ownerId || !dogName) {
      return res.status(400).json({ 
        error: 'Owner ID and dog name are required' 
      });
    }

    // Check if owner exists
    const checkOwner = await req.db.request()
      .input('ownerId', sql.Int, ownerId)
      .query('SELECT OwnerID FROM Owners WHERE OwnerID = @ownerId');

    if (checkOwner.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    const result = await req.db.request()
      .input('ownerId', sql.Int, ownerId)
      .input('dogName', sql.NVarChar, dogName)
      .input('roll', sql.NVarChar, roll || null)
      .input('breed', sql.NVarChar, breed || null)
      .input('color', sql.NVarChar, color || null)
      .input('dateOfBirth', sql.Date, dateOfBirth || null)
      .input('gender', sql.NVarChar, gender || null)
      .input('isSpayedNeutered', sql.Bit, isSpayedNeutered || 0)
      .input('isNuisance', sql.Bit, isNuisance || 0)
      .query(`
        INSERT INTO Dogs 
        (OwnerID, DogName, Roll, Breed, Color, DateOfBirth, Gender, IsSpayedNeutered, IsNuisance)
        OUTPUT INSERTED.DogID, INSERTED.DogName, INSERTED.Roll
        VALUES (@ownerId, @dogName, @roll, @breed, @color, @dateOfBirth, @gender, @isSpayedNeutered, @isNuisance)
      `);

    console.log('Dog created:', result.recordset[0]);

    res.status(201).json({
      dogId: result.recordset[0].DogID,
      message: 'Dog registered successfully',
      dog: result.recordset[0]
    });
  } catch (err) {
    console.error('Error creating dog:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update dog
router.put('/:id', async (req, res) => {
  try {
    const {
      dogName,
      roll,
      breed,
      color,
      dateOfBirth,
      gender,
      isSpayedNeutered,
      isNuisance
    } = req.body;

    console.log('Received dog update request:', req.params.id, req.body);

    // Check if dog exists
    const checkDog = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DogID FROM Dogs WHERE DogID = @id');

    if (checkDog.recordset.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('dogName', sql.NVarChar, dogName)
      .input('roll', sql.NVarChar, roll)
      .input('breed', sql.NVarChar, breed)
      .input('color', sql.NVarChar, color)
      .input('dateOfBirth', sql.Date, dateOfBirth)
      .input('gender', sql.NVarChar, gender)
      .input('isSpayedNeutered', sql.Bit, isSpayedNeutered)
      .input('isNuisance', sql.Bit, isNuisance)
      .query(`
        UPDATE Dogs 
        SET DogName = @dogName,
            Roll = @roll,
            Breed = @breed,
            Color = @color,
            DateOfBirth = @dateOfBirth,
            Gender = @gender,
            IsSpayedNeutered = @isSpayedNeutered,
            IsNuisance = @isNuisance,
            UpdatedAt = GETDATE()
        WHERE DogID = @id
      `);

    console.log('Dog updated successfully');

    res.json({ message: 'Dog updated successfully' });
  } catch (err) {
    console.error('Error updating dog:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete dog
router.delete('/:id', async (req, res) => {
  try {
    // Check if dog exists
    const checkDog = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DogID FROM Dogs WHERE DogID = @id');

    if (checkDog.recordset.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Check if dog has active licenses
    const activeLicenses = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT COUNT(*) as count 
        FROM Licenses 
        WHERE DogID = @id AND Status = 'Active'
      `);

    if (activeLicenses.recordset[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete dog with active licenses. Please expire or revoke licenses first.' 
      });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Dogs WHERE DogID = @id');
    
    res.json({ message: 'Dog deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;