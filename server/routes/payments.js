// server/routes/payments.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          p.*,
          l.LicenseNumber,
          d.DogName,
          o.FirstName as OwnerFirstName,
          o.LastName as OwnerLastName,
          o.Email as OwnerEmail
        FROM Payments p
        INNER JOIN Licenses l ON p.LicenseID = l.LicenseID
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        ORDER BY p.PaymentDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          p.*,
          l.LicenseNumber,
          l.LicenseType,
          d.DogName,
          d.Breed,
          o.FirstName as OwnerFirstName,
          o.LastName as OwnerLastName,
          o.Email as OwnerEmail,
          o.Phone as OwnerPhone
        FROM Payments p
        INNER JOIN Licenses l ON p.LicenseID = l.LicenseID
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        WHERE p.PaymentID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payments by license ID
router.get('/license/:licenseId', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('licenseId', sql.Int, req.params.licenseId)
      .query(`
        SELECT p.*
        FROM Payments p
        WHERE p.LicenseID = @licenseId
        ORDER BY p.PaymentDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payments by date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('startDate', sql.Date, req.params.startDate)
      .input('endDate', sql.Date, req.params.endDate)
      .query(`
        SELECT 
          p.*,
          l.LicenseNumber,
          d.DogName,
          o.FirstName as OwnerFirstName,
          o.LastName as OwnerLastName
        FROM Payments p
        INNER JOIN Licenses l ON p.LicenseID = l.LicenseID
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        WHERE CAST(p.PaymentDate AS DATE) BETWEEN @startDate AND @endDate
        ORDER BY p.PaymentDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payments by owner
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const result = await req.db.request()
      .input('ownerId', sql.Int, req.params.ownerId)
      .query(`
        SELECT 
          p.*,
          l.LicenseNumber,
          d.DogName
        FROM Payments p
        INNER JOIN Licenses l ON p.LicenseID = l.LicenseID
        INNER JOIN Dogs d ON l.DogID = d.DogID
        WHERE d.OwnerID = @ownerId
        ORDER BY p.PaymentDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create payment record
router.post('/', async (req, res) => {
  try {
    const {
      licenseId,
      amount,
      paymentMethod,
      transactionId,
      status
    } = req.body;

    // Validate required fields
    if (!licenseId || !amount) {
      return res.status(400).json({ 
        error: 'License ID and amount are required' 
      });
    }

    // Check if license exists
    const checkLicense = await req.db.request()
      .input('licenseId', sql.Int, licenseId)
      .query('SELECT LicenseID, Fee FROM Licenses WHERE LicenseID = @licenseId');

    if (checkLicense.recordset.length === 0) {
      return res.status(404).json({ error: 'License not found' });
    }

    // Validate payment amount matches license fee
    const licenseFee = checkLicense.recordset[0].Fee;
    if (Math.abs(amount - licenseFee) > 0.01) {
      return res.status(400).json({ 
        error: `Payment amount ($${amount}) does not match license fee ($${licenseFee})` 
      });
    }

    const result = await req.db.request()
      .input('licenseId', sql.Int, licenseId)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .input('transactionId', sql.NVarChar, transactionId || null)
      .input('status', sql.NVarChar, status || 'Completed')
      .query(`
        INSERT INTO Payments 
        (LicenseID, Amount, PaymentMethod, TransactionID, Status, PaymentDate)
        OUTPUT INSERTED.PaymentID, INSERTED.Amount, INSERTED.Status, INSERTED.PaymentDate
        VALUES (@licenseId, @amount, @paymentMethod, @transactionId, @status, GETDATE())
      `);

    res.status(201).json({
      paymentId: result.recordset[0].PaymentID,
      message: 'Payment recorded successfully',
      payment: result.recordset[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment status
router.put('/:id', async (req, res) => {
  try {
    const { status, transactionId } = req.body;

    // Check if payment exists
    const checkPayment = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentID FROM Payments WHERE PaymentID = @id');

    if (checkPayment.recordset.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.NVarChar, status)
      .input('transactionId', sql.NVarChar, transactionId)
      .query(`
        UPDATE Payments 
        SET Status = @status,
            TransactionID = ISNULL(@transactionId, TransactionID)
        WHERE PaymentID = @id
      `);

    res.json({ message: 'Payment status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete payment (use with caution)
router.delete('/:id', async (req, res) => {
  try {
    // Check if payment exists
    const checkPayment = await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentID FROM Payments WHERE PaymentID = @id');

    if (checkPayment.recordset.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await req.db.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Payments WHERE PaymentID = @id');
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment statistics
router.get('/statistics/summary', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          COUNT(*) as TotalPayments,
          SUM(Amount) as TotalRevenue,
          AVG(Amount) as AveragePayment,
          SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) as CompletedPayments,
          SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as PendingPayments,
          SUM(CASE WHEN Status = 'Failed' THEN 1 ELSE 0 END) as FailedPayments,
          SUM(CASE WHEN Status = 'Completed' THEN Amount ELSE 0 END) as CompletedRevenue,
          SUM(CASE WHEN Status = 'Pending' THEN Amount ELSE 0 END) as PendingRevenue
        FROM Payments
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get revenue by payment method
router.get('/statistics/by-method', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          ISNULL(PaymentMethod, 'Unknown') as PaymentMethod,
          COUNT(*) as TransactionCount,
          SUM(Amount) as TotalAmount,
          AVG(Amount) as AverageAmount
        FROM Payments
        WHERE Status = 'Completed'
        GROUP BY PaymentMethod
        ORDER BY TotalAmount DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get revenue by date (last 30 days)
router.get('/statistics/daily-revenue', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          CAST(PaymentDate AS DATE) as Date,
          COUNT(*) as TransactionCount,
          SUM(Amount) as TotalRevenue
        FROM Payments
        WHERE Status = 'Completed'
        AND PaymentDate >= DATEADD(day, -30, GETDATE())
        GROUP BY CAST(PaymentDate AS DATE)
        ORDER BY Date DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get monthly revenue summary
router.get('/statistics/monthly-revenue', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          YEAR(PaymentDate) as Year,
          MONTH(PaymentDate) as Month,
          DATENAME(month, PaymentDate) as MonthName,
          COUNT(*) as TransactionCount,
          SUM(Amount) as TotalRevenue,
          AVG(Amount) as AveragePayment
        FROM Payments
        WHERE Status = 'Completed'
        GROUP BY YEAR(PaymentDate), MONTH(PaymentDate), DATENAME(month, PaymentDate)
        ORDER BY Year DESC, Month DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending payments
router.get('/status/pending', async (req, res) => {
  try {
    const result = await req.db.request()
      .query(`
        SELECT 
          p.*,
          l.LicenseNumber,
          d.DogName,
          o.FirstName as OwnerFirstName,
          o.LastName as OwnerLastName,
          o.Email as OwnerEmail,
          o.Phone as OwnerPhone
        FROM Payments p
        INNER JOIN Licenses l ON p.LicenseID = l.LicenseID
        INNER JOIN Dogs d ON l.DogID = d.DogID
        INNER JOIN Owners o ON d.OwnerID = o.OwnerID
        WHERE p.Status = 'Pending'
        ORDER BY p.PaymentDate DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process bulk payment
router.post('/bulk', async (req, res) => {
  try {
    const { payments } = req.body;

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ error: 'Payments array is required' });
    }

    const results = [];
    const errors = [];

    // Process each payment
    for (const payment of payments) {
      try {
        const result = await req.db.request()
          .input('licenseId', sql.Int, payment.licenseId)
          .input('amount', sql.Decimal(10, 2), payment.amount)
          .input('paymentMethod', sql.NVarChar, payment.paymentMethod || null)
          .input('transactionId', sql.NVarChar, payment.transactionId || null)
          .input('status', sql.NVarChar, payment.status || 'Completed')
          .query(`
            INSERT INTO Payments 
            (LicenseID, Amount, PaymentMethod, TransactionID, Status, PaymentDate)
            OUTPUT INSERTED.PaymentID
            VALUES (@licenseId, @amount, @paymentMethod, @transactionId, @status, GETDATE())
          `);
        
        results.push({
          licenseId: payment.licenseId,
          paymentId: result.recordset[0].PaymentID,
          success: true
        });
      } catch (err) {
        errors.push({
          licenseId: payment.licenseId,
          error: err.message
        });
      }
    }

    res.json({
      message: 'Bulk payment processing completed',
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;