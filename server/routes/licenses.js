// server/routes/licenses.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');


// IMPORTANT: Update your backend GET license query to include the new payment columns

// In your licenses.js file, update the GET all licenses query to include:
// - PaymentMethod
// - TransactionID
// - PaymentStatus
// - Notes
// - LicenseType
// - TagNumber (from joining the Tags table)

// Example query (update your existing GET '/' route):

router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          l.LicenseID,
          l.DogID,
          l.LicenseNumber,
          l.IssueDate,
          l.IssueYear,
          l.LicenseType,
          l.Fee,
          l.Status,
          l.PaymentMethod,
          l.TransactionID,
          l.PaymentStatus,
          l.Notes,
          l.CreatedAt,
          l.UpdatedAt,
          d.DogName,
          d.Breed,
          d.Color,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1 as Phone,
          t.TagNumber
        FROM Licenses l
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        LEFT JOIN Tags t ON l.TagID = t.TagID
        ORDER BY l.CreatedAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Also update the GET '/:id' route to include these columns
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          l.*,
          d.DogName,
          d.Breed,
          d.Color,
          o.FirstName,
          o.LastName,
          o.Email,
          o.Phone1 as Phone,
          t.TagNumber
        FROM Licenses l
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        LEFT JOIN Tags t ON l.TagID = t.TagID
        WHERE l.LicenseID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'License not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all licenses with details
// router.get('/', async (req, res) => {
//   try {
//     const result = await req.db.request()
//       .query('SELECT * FROM vw_LicenseDetails');
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Get license by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const result = await req.db.request()
//       .input('id', sql.Int, req.params.id)
//       .query('SELECT * FROM vw_LicenseDetails WHERE LicenseID = @id');
    
//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: 'License not found' });
//     }
//     res.json(result.recordset[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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
      tagId,
      licenseNumber,
      issueDate,
      issueYear,
      licenseType,
      fee,
      status,
      paymentMethod,
      transactionId,
      paymentStatus,
      notes
    } = req.body;

    console.log('Received license creation request:', req.body);

    // Validate required fields
    if (!dogId || !tagId || !licenseNumber || !issueYear || !licenseType) {
      return res.status(400).json({ 
        error: 'Dog ID, Tag ID, License Number, Issue Year, and License Type are required' 
      });
    }

    // Check if dog exists
    const checkDog = await req.db.request()
      .input('dogId', sql.Int, dogId)
      .query('SELECT DogID FROM Dogs WHERE DogID = @dogId');

    if (checkDog.recordset.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    // Check if tag exists, if not create it
    const checkTag = await req.db.request()
      .input('tagNumber', sql.NVarChar, tagId)
      .query('SELECT TagID FROM Tags WHERE TagNumber = @tagNumber');

    let actualTagId;
    const purchaseDate = issueDate || new Date().toISOString().split('T')[0];

    if (checkTag.recordset.length === 0) {
      // Tag doesn't exist, create it
      console.log('Tag not found, creating new tag:', tagId);
      
      const createTag = await req.db.request()
        .input('tagNumber', sql.NVarChar, tagId)
        .input('status', sql.NVarChar, 'Issued')
        .input('purchaseDate', sql.Date, purchaseDate)
        .query(`
          INSERT INTO Tags (TagNumber, Status, PurchaseDate)
          OUTPUT INSERTED.TagID
          VALUES (@tagNumber, @status, @purchaseDate)
        `);
      
      actualTagId = createTag.recordset[0].TagID;
      console.log('New tag created with ID:', actualTagId);
    } else {
      // Tag exists, check if it's already in use
      actualTagId = checkTag.recordset[0].TagID;
      
      const tagInUse = await req.db.request()
        .input('tagId', sql.Int, actualTagId)
        .query('SELECT LicenseID FROM Licenses WHERE TagID = @tagId AND Status = \'Active\'');
      
      if (tagInUse.recordset.length > 0) {
        return res.status(400).json({ 
          error: 'This tag is already in use by an active license' 
        });
      }
    }

    // Create the license - EXACT column names from your database
    const result = await req.db.request()
      .input('dogId', sql.Int, dogId)
      .input('tagId', sql.Int, actualTagId)
      .input('licenseNumber', sql.NVarChar, licenseNumber)
      .input('issueDate', sql.Date, issueDate || new Date())
      .input('issueYear', sql.NVarChar, issueYear)
      .input('licenseType', sql.NVarChar, licenseType)
      .input('fee', sql.Decimal(10, 2), fee || 0)
      .input('status', sql.NVarChar, status || 'Active')
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .input('transactionId', sql.NVarChar, transactionId || null)
      .input('paymentStatus', sql.NVarChar, paymentStatus || 'Completed')
      .input('notes', sql.NVarChar, notes || null)
      .query(`
        INSERT INTO Licenses 
        (DogID, TagID, LicenseNumber, IssueDate, IssueYear, LicenseType, Fee, Status, PaymentMethod, TransactionID, PaymentStatus, Notes)
        OUTPUT INSERTED.LicenseID, INSERTED.LicenseNumber
        VALUES (@dogId, @tagId, @licenseNumber, @issueDate, @issueYear, @licenseType, @fee, @status, @paymentMethod, @transactionId, @paymentStatus, @notes)
      `);

    console.log('License created:', result.recordset[0]);

    res.status(201).json({ 
      licenseId: result.recordset[0].LicenseID,
      message: 'License created successfully',
      license: result.recordset[0]
    });
  } catch (err) {
    console.error('Error creating license:', err);
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