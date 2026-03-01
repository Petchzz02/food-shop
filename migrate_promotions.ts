import mysql from 'mysql2/promise'

async function run() {
    try {
        const pool = mysql.createPool('mysql://root:@localhost:3306/food_shop')
        console.log('Connected to DB');

        await pool.execute(`
      CREATE TABLE IF NOT EXISTS Promotion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl VARCHAR(500),
        isActive BOOLEAN DEFAULT true,
        createdAt DATETIME DEFAULT NOW()
      );
    `);

        console.log('Promotion table created successfully');
        process.exit(0);
    } catch (err: any) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

run()
