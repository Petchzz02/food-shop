import mysql from 'mysql2/promise'

async function run() {
    const pool = mysql.createPool('mysql://root:@localhost:3306/food_shop')
    try {
        await pool.execute('ALTER TABLE `Order` ADD COLUMN guestName VARCHAR(100), ADD COLUMN guestPhone VARCHAR(20), ADD COLUMN guestAddress TEXT')
        console.log('Columns added successfully')
    } catch (err: any) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist')
        } else {
            console.error(err)
        }
    }
    process.exit(0)
}

run()
