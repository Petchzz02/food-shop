const mysql = require('mysql2/promise');

async function run() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'food_shop'
    });

    const [rows] = await pool.execute('SELECT id, total, status, userId, guestName, guestPhone FROM `Order` ORDER BY id DESC LIMIT 5');
    console.log("Recent Orders:");
    console.table(rows);

    const [users] = await pool.execute('SELECT id, name, role FROM User WHERE name = ?', ['test01']);
    console.log("\nUser Detail:");
    console.table(users);

    process.exit();
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
