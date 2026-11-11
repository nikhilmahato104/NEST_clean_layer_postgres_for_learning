const fs = require('fs');
const { Client } = require('pg');

// Applies ONE migration file to the database in the given .env file.
// Usage: node apply_sql.js migrations/<yyyymmddHHMMSS_name>.sql [.env-file] [--dry-run]
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const nonFlagArgs = args.filter((a) => !a.startsWith('--'));

let envFile = '.env.dev';
let sqlFile = null;

for (const arg of nonFlagArgs) {
  if (arg.endsWith('.sql')) {
    sqlFile = arg;
  } else if (arg.startsWith('.env') || arg.includes('env')) {
    envFile = arg;
  }
}

if (!sqlFile) {
  console.error('Usage: node apply_sql.js migrations/<file>.sql [.env-file] [--dry-run]');
  process.exit(1);
}

require('dotenv').config({ path: envFile });

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(`DATABASE_URL not found in ${envFile}`);
    process.exit(1);
  }

  const maskedUrl = connectionString.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:******@');
  console.log(`🔌 Connecting to database: ${maskedUrl}`);

  if (isDryRun) {
    console.log(`🔍 DRY-RUN MODE: No migration will be executed.`);
    console.log(`📄 Target migration file: ${sqlFile}`);
    return;
  }

  // SSL settings come from the connection string (Neon needs sslmode=verify-full).
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log(`Reading SQL from ${sqlFile}...`);
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Applying SQL migration...');
    await client.query(sql);

    console.log('✅ Migration applied successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
