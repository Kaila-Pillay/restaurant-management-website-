const sql = require('mssql/msnodesqlv8');

// Explicit connection configuration pointing to the modern ODBC 18 driver
const config = {
    connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=RendezvousDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server (RendezvousDB) successfully!');
        return pool;
    })
    .catch(err => {
        console.log('Driver 18 failed, trying ODBC Driver 17 fallback...');
        const fallbackConfig = {
            connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=RendezvousDB;Trusted_Connection=yes;TrustServerCertificate=yes;'
        };
        return new sql.ConnectionPool(fallbackConfig).connect()
            .then(pool => {
                console.log('Connected to SQL Server via ODBC Driver 17!');
                return pool;
            })
            .catch(finalErr => console.error('Database connection failed completely: ', finalErr));
    });

module.exports = { sql, poolPromise };