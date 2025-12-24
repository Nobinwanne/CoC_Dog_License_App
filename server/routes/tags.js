// server/routes/tags.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');


// Get all tags
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          tagID,
          tagNumber,
          PurchaseDate,
          PurchaseYear,
          Status
        FROM Tags
        ORDER BY tagNumber
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create new tag
router.post('/', async (req, res) => {
  try {
    const { tagNumber, purchaseDate, status, notes } = req.body;

     console.log('Received tag creation request:', req.body);

    // Validate
    if (!tagNumber || !purchaseDate) {
      return res.status(400).json({ 
        error: 'Tag number and purchase date are required' 
      });
    }

    const result = await req.db.request()
      .input('tagNumber', sql.NVarChar, tagNumber)
      .input('purchaseDate', sql.Date, purchaseDate)
      .input('status', sql.NVarChar, status || 'Available')
      .input('notes', sql.NVarChar, notes || null)
      .query(`
        INSERT INTO Tags (TagNumber, PurchaseDate, Status, Notes)
        OUTPUT INSERTED.TagID, INSERTED.TagNumber, INSERTED.PurchaseDate
        VALUES (@tagNumber, @purchaseDate, @status, @notes)
      `);

       console.log('Tag created:', result.recordset[0]);

    res.status(201).json({
      tagId: result.recordset[0].TagID,
      tagNumber: result.recordset[0].TagNumber,
      message: 'Tag created successfully',
      tag: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;