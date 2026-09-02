# Database Migrations

This folder contains database migration scripts for the local SQLite database.

## What are Migrations?

Migrations are versioned database schema changes that allow you to:

- Add new columns to existing tables
- Create new tables
- Modify constraints
- Add indexes
- Update data structures

## How Migrations Work

1. **Automatic Execution**: Migrations run automatically when the app starts
2. **One-Time Only**: Each migration runs only once and is tracked in the `migrations` table
3. **Order Matters**: Migrations are numbered and run in sequence (001, 002, 003, etc.)
4. **Idempotent**: Safe to run multiple times - checks if already applied

## Migration Files

None yet — the template ships with an empty `migrations` array.

**Your initial schema does not belong here.** Put it in `tables/*.table.js`,
which runs on every startup with `CREATE TABLE IF NOT EXISTS`. Reach for a
migration only when you need to change a schema that is already installed on
someone's device and cannot be recreated from scratch.

Document each migration you add in this section — number, date, purpose and
the exact columns or tables it touches.

## Creating a New Migration

### Step 1: Create Migration File

Create a new file: `00X_migration_name.js`

```javascript
import db from "../db";

export const migrateSomething = () => {
  console.log("[Migration] Starting something migration...");

  try {
    // Check if already applied
    const checkColumn = (table, column) => {
      const result = db.queryFirst(
        `SELECT COUNT(*) as count FROM pragma_table_info('${table}') WHERE name='${column}'`,
      );
      return result.count > 0;
    };

    // Add your changes
    if (!checkColumn("tablename", "newcolumn")) {
      db.execSync(`ALTER TABLE tablename ADD COLUMN newcolumn TEXT`);
      console.log("[Migration] ✓ Column added");
    }

    console.log("[Migration] ✅ Migration completed!");
    return true;
  } catch (error) {
    console.error("[Migration] ❌ Error:", error);
    throw error;
  }
};
```

### Step 2: Register Migration

Add to `index.js`:

```javascript
import { migrateSomething } from "./00X_migration_name";

const migrations = [
  {
    name: "001_void_refund_schema",
    description: "Add void and refund support",
    run: migrateVoidRefundSchema,
  },
  {
    name: "00X_migration_name",
    description: "Description of what this does",
    run: migrateSomething,
  },
];
```

### Step 3: Test

1. Start the app
2. Check console for migration logs
3. Verify changes in database

## Migration Best Practices

### ✅ DO:

- Check if changes already exist before applying
- Use descriptive migration names
- Add console logs for progress tracking
- Handle errors gracefully
- Test on a copy of production data first
- Document what the migration does

### ❌ DON'T:

- Delete or modify existing migrations
- Drop tables with user data
- Make destructive changes without backups
- Skip error handling
- Forget to update the migrations array

## SQLite Limitations

SQLite has limited `ALTER TABLE` support:

- ✅ Can ADD COLUMN
- ✅ Can RENAME COLUMN (SQLite 3.25.0+)
- ✅ Can RENAME TABLE
- ❌ Cannot DROP COLUMN (need to recreate table)
- ❌ Cannot MODIFY COLUMN (need to recreate table)
- ❌ Cannot ADD/DROP constraints (need to recreate table)

### Workaround for Unsupported Operations

To drop a column or modify constraints:

```javascript
// 1. Create new table with desired schema
db.execSync(`CREATE TABLE new_table (...)`);

// 2. Copy data from old table
db.execSync(`INSERT INTO new_table SELECT ... FROM old_table`);

// 3. Drop old table
db.execSync(`DROP TABLE old_table`);

// 4. Rename new table
db.execSync(`ALTER TABLE new_table RENAME TO old_table`);
```

## Checking Migration Status

### View Applied Migrations

```javascript
import { getAppliedMigrations } from "./store/database/migrations";

const applied = getAppliedMigrations();
console.log(applied);
```

### View Pending Migrations

```javascript
import { getPendingMigrations } from "./store/database/migrations";

const pending = getPendingMigrations();
console.log(pending);
```

### Manually Run Migrations

```javascript
import { runMigrations } from "./store/database/migrations";

runMigrations();
```

## Rollback (Development Only)

Some migrations include rollback functions for development/testing:

```javascript
import { rollbackVoidRefundSchema } from "./001_void_refund_schema";

// WARNING: This will drop tables/columns!
rollbackVoidRefundSchema();
```

⚠️ **Never run rollback in production!**

## Migration Tracking Table

Migrations are tracked in the `migrations` table:

```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  appliedAt TEXT DEFAULT (datetime('now'))
);
```

Query to see applied migrations:

```sql
SELECT * FROM migrations ORDER BY appliedAt ASC;
```

## Troubleshooting

### Migration Failed

1. Check console logs for error details
2. Verify database file is not corrupted
3. Check if migration was partially applied
4. Restore from backup if needed
5. Fix the migration code
6. Delete the migration entry from `migrations` table
7. Run again

### Migration Already Applied

If you need to re-run a migration:

```sql
DELETE FROM migrations WHERE name = '001_void_refund_schema';
```

Then restart the app.

### Database Locked

If you get "database is locked" errors:

1. Close all database connections
2. Restart the app
3. Check for long-running transactions

## Production Deployment

### Before Deploying:

1. ✅ Test migration on development database
2. ✅ Test migration on copy of production database
3. ✅ Backup production database
4. ✅ Review migration code
5. ✅ Test rollback procedure (if available)
6. ✅ Plan for downtime (if needed)

### During Deployment:

1. Stop the app (if needed)
2. Backup database
3. Deploy new code
4. Start app (migration runs automatically)
5. Verify migration success in logs
6. Test app functionality
7. Monitor for errors

### After Deployment:

1. Verify all migrations applied
2. Check database integrity
3. Test affected features
4. Monitor app performance
5. Keep backup for 30 days

## Example Migration Scenarios

### Adding a Column

```javascript
db.execSync(`ALTER TABLE products ADD COLUMN barcode TEXT`);
```

### Creating a Table

```javascript
db.execSync(`
  CREATE TABLE IF NOT EXISTS product_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    productId INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);
```

### Creating an Index

```javascript
db.execSync(`
  CREATE INDEX IF NOT EXISTS idx_products_barcode 
  ON products(barcode)
`);
```

### Updating Data

```javascript
db.execSync(`
  UPDATE products 
  SET status = 'active' 
  WHERE status IS NULL
`);
```

## Need Help?

- Check existing migrations for examples
- Review SQLite documentation
- Test on development database first
- Ask team for code review

---

**Remember:** Migrations are permanent changes. Always test thoroughly before deploying to production!
