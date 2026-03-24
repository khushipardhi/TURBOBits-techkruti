/**
 * Standalone DB debug script
 * Run: node test-db.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  console.log('\n🔍 === FoodLink Database Debug Tool ===\n');

  // 1. Print env vars (masked password)
  console.log('📋 Environment Variables:');
  console.log(`   DB_HOST     = ${process.env.DB_HOST}`);
  console.log(`   DB_PORT     = ${process.env.DB_PORT}`);
  console.log(`   DB_USER     = ${process.env.DB_USER}`);
  console.log(`   DB_PASSWORD = ${'*'.repeat((process.env.DB_PASSWORD || '').length)}`);
  console.log(`   DB_NAME     = ${process.env.DB_NAME}`);
  console.log(`   DB_SSL      = ${process.env.DB_SSL}`);
  console.log('');

  let conn;
  try {
    // 2. Test raw connection (no database selected)
    console.log('🔌 Step 1: Testing raw connection (no database)...');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    const [pingResult] = await conn.execute('SELECT 1 AS connected');
    console.log('   ✅ Raw connection successful:', pingResult[0]);
    await conn.end();

    // 3. List all databases
    console.log('\n📂 Step 2: Listing all databases...');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    const [dbs] = await conn.execute('SHOW DATABASES');
    console.log('   Available databases:');
    dbs.forEach(db => console.log(`     - ${db.Database}`));
    await conn.end();

    // 4. Connect to specific database
    console.log(`\n🗄️  Step 3: Connecting to database "${process.env.DB_NAME}"...`);
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    console.log(`   ✅ Connected to "${process.env.DB_NAME}"`);

    // 5. Show tables
    console.log('\n📋 Step 4: Checking tables...');
    const [tables] = await conn.execute('SHOW TABLES');
    if (tables.length === 0) {
      console.log('   ⚠️  NO TABLES FOUND! You need to run the CREATE TABLE queries.');
      console.log('   👉 Open database_schema.md and run the SQL in MySQL Workbench');
    } else {
      const colName = Object.keys(tables[0])[0];
      console.log(`   Found ${tables.length} table(s):`);
      tables.forEach(t => console.log(`     - ${t[colName]}`));
    }

    // 6. Check each required table
    const requiredTables = ['users', 'donors', 'receivers', 'delivery_partners', 'food_listings', 'food_requests', 'deliveries', 'trust_logs'];
    console.log('\n🔍 Step 5: Verifying required tables...');
    for (const table of requiredTables) {
      try {
        const [rows] = await conn.execute(`SELECT COUNT(*) AS count FROM ${table}`);
        console.log(`   ✅ ${table.padEnd(20)} — ${rows[0].count} row(s)`);
      } catch (err) {
        console.log(`   ❌ ${table.padEnd(20)} — MISSING! Error: ${err.message}`);
      }
    }

    // 7. Test INSERT into users
    console.log('\n🧪 Step 6: Testing INSERT capability...');
    try {
      const [result] = await conn.execute(
        `INSERT INTO users (role, name, phone, email, password_hash, address, trust_score)
         VALUES ('ADMIN', 'Test Admin', '0000000000', 'test@debug.com', 'hash123', 'Debug Address', 5.00)`
      );
      console.log(`   ✅ INSERT successful! user_id = ${result.insertId}`);

      // Cleanup
      await conn.execute('DELETE FROM users WHERE phone = ?', ['0000000000']);
      console.log('   🧹 Cleaned up test row');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('   ⚠️  Duplicate entry — test user already exists (thats okay)');
      } else {
        console.log(`   ❌ INSERT failed: ${err.message}`);
      }
    }

    await conn.end();

    console.log('\n✅ === All checks complete! ===\n');

  } catch (err) {
    console.error(`\n❌ FATAL ERROR: ${err.message}`);
    console.error('   Full error:', err.code || err.errno || '');
    if (conn) await conn.end().catch(() => {});
    process.exit(1);
  }
})();
