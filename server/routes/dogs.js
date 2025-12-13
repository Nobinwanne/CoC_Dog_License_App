const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all dogs
// router.get('/', async (req, res) => {
//   try {
//     const result = await req.db.request()
//       .query(`
//         SELECT 
//           d.DogID,
//           d.OwnerID,
//           d.DogName,
//           d.Breed,
//           d.Color,
//           d.DateOfBirth,
//           d.Gender,
//           d.IsSpayedNeutered,
//           d.IsNuisance,
//           o.FirstName as OwnerFirstName,
//           o.LastName as OwnerLastName,
//           o.Email as OwnerEmail,
//           o.Phone1 as OwnerPhone,
//           o.Phone2 as OwnerAlternativePhone
//         FROM Dogs d
//         INNER JOIN Owners o ON d.OwnerID = o.OwnerID
//         GROUP BY 
//           d.DogID,
//           d.OwnerID,
//           d.DogName,
//           d.Breed,
//           d.Color,
//           d.DateOfBirth,
//           d.Gender,
//           d.IsSpayedNeutered,
//           d.IsNuisance,
//           o.FirstName,
//           o.LastName,
//           o.Email,
//           o.Phone1,
//           o.Phone2
//         ORDER BY d.DogName
//       `);
//     res.json(result.recordset);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          d.DogID,
          d.OwnerID,
          d.DogName,
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

module.exports = router;