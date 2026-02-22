import { query } from './src/db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'src/db/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Running migration: ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    await query(sql);
    console.log(`  ✓ ${file} done`);
  }

  console.log('\nAll migrations complete!');
  process.exit(0);
}

runMigration().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
