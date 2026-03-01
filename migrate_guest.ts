import mysql from 'mysql2/promise'

async function run() {
    try {
        const pool = mysql.createPool('mysql://root:@localhost:3306/food_shop')
        console.log('Connected to DB');

        try {
            await pool.execute('ALTER TABLE `Order` ADD COLUMN guestName VARCHAR(100)');
            console.log('guestName added');
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('guestName error:', e.message);
            else console.log('guestName exists');
        }

        try {
            await pool.execute('ALTER TABLE `Order` ADD COLUMN guestPhone VARCHAR(20)');
            console.log('guestPhone added');
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('guestPhone error:', e.message);
            else console.log('guestPhone exists');
        }

        try {
            await pool.execute('ALTER TABLE `Order` ADD COLUMN guestAddress TEXT');
            console.log('guestAddress added');
        } catch (e: any) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('guestAddress error:', e.message);
            else console.log('guestAddress exists');
        }

        process.exit(0);
    } catch (err: any) {
        console.error('Connection error:', err.message);
        process.exit(1);
    }
}

run()
