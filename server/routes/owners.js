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
    // Get owner info
    const ownerResult = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Owners WHERE OwnerID = @id');
    
    if (ownerResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    const owner = ownerResult.recordset[0];

    // Get all dogs for this owner - SIMPLE QUERY, no joins needed
    const dogsResult = await req.db.request()
      .input('ownerId', sql.Int, req.params.id)
      .query(`
        SELECT 
          DogID,
          DogName,
          Breed,
          Color,
          Gender,
          DateOfBirth,
          IsSpayedNeutered,
          IsNuisance
        FROM Dogs
        WHERE OwnerID = @ownerId
      `);

    // Add dogs array to owner object
    owner.dogs = dogsResult.recordset;
    owner.dogCount = dogsResult.recordset.length;

    console.log(`Owner ${owner.OwnerID} has ${owner.dogCount} dogs`); // Debug log

    res.json(owner);
  } catch (err) {
    console.error('Error fetching owner:', err);
    res.status(500).json({ error: err.message });
  }
});


// Get owner with their dogs
router.get('/:id/dogs', async (req, res) => {
  try {
    // First, get the owner info
    const ownerResult = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Owners WHERE OwnerID = @id');
    
    if (ownerResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    const owner = ownerResult.recordset[0];

    // Get dogs with all their tags
    const dogsResult = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          d.DogID,
          d.DogName,
          d.Breed,
          d.Roll,
          d.Color,
          d.DateOfBirth,
          d.Gender,
          d.IsSpayedNeutered,
          d.IsNuisance,
          t.TagNumber
        FROM Dogs d
        LEFT JOIN Licenses l ON d.DogID = l.DogID AND l.Status = 'Active'
        LEFT JOIN Tags t ON l.TagID = t.TagID
        WHERE d.OwnerID = @id
        ORDER BY d.DogName, t.TagNumber
      `);

    // Group tags by dog (in case a dog has multiple tags)
    const dogsMap = new Map();
    
    dogsResult.recordset.forEach(row => {
      if (!dogsMap.has(row.DogID)) {
        dogsMap.set(row.DogID, {
          DogID: row.DogID,
          DogName: row.DogName,
          Roll: row.Roll,
          Breed: row.Breed,
          Color: row.Color,
          DateOfBirth: row.DateOfBirth,
          Gender: row.Gender,
          IsSpayedNeutered: row.IsSpayedNeutered,
          IsNuisance: row.IsNuisance,
          TagNumber: row.TagNumber, // First/primary tag
          tags: [] // Array of all tags
        });
      }
      
      // Add tag to the tags array if it exists
      if (row.TagNumber) {
        const dog = dogsMap.get(row.DogID);
        if (!dog.tags.includes(row.TagNumber)) {
          dog.tags.push(row.TagNumber);
        }
      }
    });

    // Convert map to array
    const dogs = Array.from(dogsMap.values());

    // Format response
    const response = {
      ...owner,
      dogs: dogs
    };

    res.json(response);
  } catch (err) {
    console.error('Error in GET /:id/dogs:', err);
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
      phone1,
      phone2,
      address,
      city,
      province,
      postalCode
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
      .input('phone1', sql.NVarChar, phone1 || null)
      .input('phone2', sql.NVarChar, phone2 || null)
      .input('address', sql.NVarChar, address || null)
      .input('city', sql.NVarChar, city || null)
      .input('province', sql.NVarChar, province || null)
      .input('postalCode', sql.NVarChar, postalCode || null)
      .query(`
        INSERT INTO Owners 
        (FirstName, LastName, Email, Phone1, Phone2, Address, City, Province, PostalCode)
        OUTPUT INSERTED.OwnerID, INSERTED.FirstName, INSERTED.LastName, INSERTED.Email
        VALUES (@firstName, @lastName, @email, @phone1, @phone2, @address, @city, @province, @postalCode)
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
      phone1,
      phone2,
      address,
      city,
      province,
      postalCode
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
      .input('phone1', sql.NVarChar, phone1)
      .input('phone2', sql.NVarChar, phone2)
      .input('address', sql.NVarChar, address)
      .input('city', sql.NVarChar, city)
      .input('province', sql.NVarChar, province)
      .input('postalCode', sql.NVarChar, postalCode)
      .query(`
        UPDATE Owners 
        SET FirstName = @firstName,
            LastName = @lastName,
            Email = @email,
            Phone1 = @phone1,
            Phone2 = @phone2,
            Address = @address,
            City = @city,
            Province = @province,
            PostalCode = @postalCode,
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