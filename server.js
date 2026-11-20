const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sql, poolPromise } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());


const candidateFolders = [
    __dirname,                                   
    path.join(__dirname, 'public'),
    path.join(__dirname, 'rendezvous-website'),
    path.join(__dirname, 'frontend'),
    path.join(__dirname, '..','..', 'rendezvous-website-simplified')
    
];

let staticFolder = null;
for (const folder of candidateFolders) {
    if (fs.existsSync(path.join(folder, 'staff-reservation.html'))) {
        staticFolder = folder;
        break;
    }
}

if (staticFolder === null) {
    console.error('❌ Could not find staff-reservations.html in any of these folders:');
    candidateFolders.forEach((f) => console.error('   -', f));
    console.error('   Move your HTML/CSS/JS files into one of the folders above, or add the correct path to candidateFolders in server.js.');
} else {
    console.log('✅ Serving front-end files from:', staticFolder);
}

app.use(express.static(staticFolder || __dirname));


// 1. LOGIN API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('SELECT user_id, first_name, last_name, role FROM [user] WHERE email = @email AND password = @password');

        if (result.recordset.length > 0) {
            res.json({ success: true, user: result.recordset[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. REGISTER API
app.post('/api/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('first_name', sql.VarChar, first_name)
            .input('last_name', sql.VarChar, last_name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .input('phone', sql.VarChar, phone)
            .query("INSERT INTO [user] (first_name, last_name, email, password, phone, role) VALUES (@first_name, @last_name, @email, @password, @phone, 'student')");

        res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. GET MENU API
app.get('/api/menu', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT m.item_id, m.item_name, m.description, m.price, c.category_name, s.quantity_available
            FROM menu_item m
            JOIN category c ON m.category_id = c.category_id
            LEFT JOIN stock s ON m.item_id = s.item_id
            WHERE m.availability = 1
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. RESERVATIONS API (CUSTOMER CREATE)
app.post('/api/reservations/sync', async (req, res) => {
    try {
        const { email, reservation_date, reservation_time, party_size } = req.body;

        if (!email || !reservation_date || !reservation_time || !party_size) {
            return res.status(400).json({
                success: false,
                message: 'Email, date, time and party size are required'
            });
        }

        const pool = await poolPromise;

        const userResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT user_id
                FROM [user]
                WHERE email = @email
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found in database'
            });
        }

        const userId = userResult.recordset[0].user_id;

        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('reservation_date', sql.Date, reservation_date)
            .input('reservation_time', sql.VarChar, reservation_time)
            .input('party_size', sql.Int, party_size)
            .query(`
                INSERT INTO reservation
                (user_id, reservation_date, reservation_time, party_size, status)
                VALUES
                (@user_id, @reservation_date, @reservation_time, @party_size, 'Pending')
            `);

        res.json({
            success: true,
            message: 'Reservation saved to database'
        });

    } catch (err) {
        console.error('Database reservation sync error:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 5. ADMIN ORDERS API
app.get('/api/admin/orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT o.order_id, u.first_name, u.last_name, m.item_name, oi.quantity, oi.unit_price,
       o.order_status, o.order_date, o.pickup_date, o.pickup_time, o.total_amount
            FROM [order] o
            LEFT JOIN [user] u ON o.user_id = u.user_id
            JOIN order_item oi ON o.order_id = oi.order_id
            JOIN menu_item m ON oi.item_id = m.item_id
            ORDER BY o.order_date DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. ADMIN RESERVATIONS GET API
app.get('/api/admin/reservations', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.reservation_id, u.first_name, u.last_name, r.reservation_date,
                   r.reservation_time, r.party_size, r.table_number, r.status
            FROM reservation r
            LEFT JOIN [user] u ON r.user_id = u.user_id
            ORDER BY r.reservation_date DESC, r.reservation_time DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. ADMIN RESERVATIONS UPDATE STATUS API
app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, status)
            .query(`
                UPDATE [order]
                SET order_status = @status
                WHERE order_id = @id
            `);

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });

    } catch (err) {
        console.error('Error updating order status:', err);

        res.status(500).json({
            success: false,
            message: 'Failed to update order status'
        });
    }
});

app.put('/api/admin/reservations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, status)
            .query('UPDATE reservation SET status = @status WHERE reservation_id = @id');

        res.json({ success: true, message: 'Reservation status updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/save-reservation', async (req, res) => {
    console.log("SAVE RESERVATION ROUTE WAS CALLED");

    try {
        const {
            customer_email,
            reservation_date,
            reservation_time,
            guests
        } = req.body;

        if (!reservation_date || !reservation_time || !guests) {
            return res.status(400).json({
                success: false,
                message: 'Missing reservation details'
            });
        }

        const pool = await poolPromise;

        let userId = null;

        if (customer_email) {
            const userResult = await pool.request()
                .input('email', sql.VarChar, customer_email)
                .query('SELECT user_id FROM [user] WHERE email = @email');

            if (userResult.recordset.length > 0) {
                userId = userResult.recordset[0].user_id;
            }
        }

        await pool.request()
            .input('user_id', sql.Int, userId)
            .input('reservation_date', sql.Date, reservation_date)
            .input('reservation_time', sql.VarChar, reservation_time)
            .input('party_size', sql.Int, Number(guests))
            .input('table_number' , sql.Int, 1)
            .query(`
                INSERT INTO reservation
                (user_id, reservation_date, reservation_time, party_size, table_number, status)
                VALUES
                (@user_id, @reservation_date, @reservation_time, @party_size, @table_number, 'Pending')
            `);

        res.json({
            success: true,
            message: 'Reservation saved to SQL Server'
        });

    } catch (err) {
        console.error('SQL reservation save failed:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// 7. SAVE ORDER TO SQL SERVER
app.post('/api/save-order', async (req, res) => {
    try {
        const {
            customer_email,
            pickup_date,
            pickup_time,
            items,
            total_amount
        } = req.body;

        if (!customer_email || !pickup_date || !pickup_time || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing order details'
            });
        }

        const pool = await poolPromise;

        const userResult = await pool.request()
            .input('email', sql.VarChar, customer_email)
            .query(`
                SELECT user_id
                FROM [user]
                WHERE email = @email
            `);

        if (userResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found in database'
            });
        }

        const userId = userResult.recordset[0].user_id;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            const orderResult = await new sql.Request(transaction)
                .input('user_id', sql.Int, userId)
                .input('pickup_date', sql.Date, pickup_date)
                .input('pickup_time', sql.VarChar, pickup_time)
                .input('total_amount', sql.Decimal(10, 2), Number(total_amount))
                .query(`
                    INSERT INTO [order]
                    (user_id, order_date,pickup_date, pickup_time, order_status, total_amount)
                    OUTPUT INSERTED.order_id
                    VALUES
                    (@user_id, GETDATE(),@pickup_date, @pickup_time, 'Pending', @total_amount)
                `);

            const orderId = orderResult.recordset[0].order_id;

            for (var i = 0; i < items.length; i++) {
                await new sql.Request(transaction)
                    .input('order_id', sql.Int, orderId)
                    .input('item_id', sql.Int, items[i].id)
                    .input('quantity', sql.Int, items[i].quantity)
                    .input('unit_price', sql.Decimal(10, 2), Number(items[i].price))
                    .query(`
                        INSERT INTO order_item
                        (order_id, item_id, quantity, unit_price)
                        VALUES
                        (@order_id, @item_id, @quantity, @unit_price)
                    `);
            }

            await transaction.commit();

            res.json({
                success: true,
                message: 'Order saved to SQL Server',
                order_id: orderId
            });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (err) {
        console.error('SQL order save failed:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// CUSTOMER ORDERS
app.get('/api/customer/orders/:email', async (req, res) => {
    try {
        const email = req.params.email;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT 
                    o.order_id,
                    o.pickup_date,
                    o.pickup_time,
                    o.order_status,
                    o.total_amount,
                    m.item_name,
                    oi.quantity
                FROM [order] o
                JOIN [user] u ON o.user_id = u.user_id
                JOIN order_item oi ON o.order_id = oi.order_id
                JOIN menu_item m ON oi.item_id = m.item_id
                WHERE u.email = @email
                ORDER BY o.order_date DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        console.error('Could not load customer orders:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


// CUSTOMER RESERVATIONS
app.get('/api/customer/reservations/:email', async (req, res) => {
    try {
        const email = req.params.email;

        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`
                SELECT
                    r.reservation_id,
                    r.reservation_date,
                    r.reservation_time,
                    r.party_size,
                    r.status
                FROM reservation r
                JOIN [user] u ON r.user_id = u.user_id
                WHERE u.email = @email
                ORDER BY r.reservation_date DESC, r.reservation_time DESC
            `);

        res.json(result.recordset);

    } catch (err) {
        console.error('Could not load customer reservations:', err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));