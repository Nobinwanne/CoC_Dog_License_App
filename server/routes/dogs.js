const express = require('express');
const router = express.Router();
const sql = require('mssql');


// Get all dogs
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          d.DogID,
          d.OwnerID,
          d.DogName,
          d.Roll,
          d.Breed,
          d.Color,
          d.DateOfBirth,
          d.Gender,
          d.IsSpayedNeutered,
          d.IsNuisance,
          (SELECT FirstName FROM Owners WHERE OwnerID = d.OwnerID) as OwnerFirstName,
          (SELECT LastName FROM Owners WHERE OwnerID = d.OwnerID) as OwnerLastName,
          (SELECT Email FROM Owners WHERE OwnerID = d.OwnerID) as OwnerEmail,
          (SELECT Phone1 FROM Owners WHERE OwnerID = d.OwnerID) as OwnerPhone,
          (SELECT Phone2 FROM Owners WHERE OwnerID = d.OwnerID) as OwnerAlternativePhone
        FROM Dogs d
        ORDER BY d.DogName
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new dog
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
      .input('breed', sql.NVarChar, breed || null)
      .input('roll', sql.NVarChar, roll || null)
      .input('color', sql.NVarChar, color || null)
      .input('dateOfBirth', sql.Date, dateOfBirth || null)
      .input('gender', sql.NVarChar, gender || null)
      .input('isSpayedNeutered', sql.Bit, isSpayedNeutered || 0)
      .input('isNuisance', sql.Bit, isNuisance || 0)
      .query(`
        INSERT INTO Dogs 
        (OwnerID, DogName, Roll, Breed, Color, DateOfBirth, Gender, IsSpayedNeutered, IsNuisance)
        OUTPUT 
        INSERTED.DogID, 
        INSERTED.DogName, 
        INSERTED.Roll, 
        INSERTED.Breed,
        INSERTED.Color, 
        INSERTED.DateOfBirth, 
        INSERTED.IsSpayedNeutered,
        INSERTED.IsNuisance
        VALUES (@ownerId, @dogName, @breed, @Roll, @color, @dateOfBirth, @gender, @isSpayedNeutered, @isNuisance)
      `);

    res.status(201).json({
      dogId: result.recordset[0].DogID,
      message: 'Dog registered successfully',
      dog: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;