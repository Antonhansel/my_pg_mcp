# Query Safety Features

This MCP server includes several safety mechanisms to prevent LLMs from overwhelming your database with dangerous or resource-intensive queries.

## 🛡️ Safety Mechanisms

### 1. Row Limiting
- **Default limit**: 1,000 rows per query
- **Automatic enforcement**: SELECT queries without LIMIT clauses get one added automatically
- **Limit capping**: If a query requests more than the maximum, it's reduced to the maximum
- **User feedback**: Results include a warning when the limit is hit

### 2. Query Pattern Blocking
The following dangerous patterns are blocked:
- `SELECT *` without WHERE/LIMIT clauses (automatically gets LIMIT added)
- DELETE statements
- INSERT statements  
- UPDATE statements
- DROP statements
- CREATE statements
- ALTER statements
- TRUNCATE statements

### 3. Query Timeouts
- **Default timeout**: 30 seconds
- **Database-level enforcement**: Uses PostgreSQL's `statement_timeout`
- **Prevents**: Long-running queries from blocking resources

### 4. Query Length Limits
- **Default limit**: 10,000 characters
- **Prevents**: Extremely complex or malicious queries

## ⚙️ Configuration

### Environment Variables
You can override the default limits using environment variables:

```bash
export MCP_MAX_ROWS=500           # Maximum rows to return
export MCP_TIMEOUT_MS=15000       # Query timeout in milliseconds  
export MCP_MAX_QUERY_LENGTH=5000  # Maximum query length
```

### Code Configuration
Edit `src/server/queryConfig.ts` to change defaults:

```typescript
export const QUERY_LIMITS = {
  MAX_ROWS: 1000,           // Maximum rows to return
  TIMEOUT_MS: 30000,        // 30 second timeout
  MAX_QUERY_LENGTH: 10000,  // Maximum query length
};
```

## 📊 Examples

### Safe Queries (Allowed)
```sql
-- These queries are allowed and will work normally
SELECT id, name FROM users WHERE active = true LIMIT 50;
SELECT COUNT(*) FROM orders;
SELECT * FROM products WHERE category = 'electronics' LIMIT 10;
```

### Automatically Limited Queries
```sql
-- This query gets automatically limited
SELECT * FROM users;
-- Becomes: SELECT * FROM users LIMIT 1000;

-- This query gets its limit reduced
SELECT * FROM orders LIMIT 5000;
-- Becomes: SELECT * FROM orders LIMIT 1000;
```

### Blocked Queries
```sql
-- These queries are blocked for safety
DELETE FROM users WHERE id = 1;
DROP TABLE sensitive_data;
UPDATE users SET password = 'hacked';
```

## 🔍 Monitoring

The server logs when queries are modified:
```
Query modified for safety: SELECT * FROM users -> SELECT * FROM users LIMIT 1000
```

## 🚨 When Limits Are Hit

When a query hits the row limit, users see:
```json
[
  {"id": 1, "name": "John"},
  {"id": 2, "name": "Jane"},
  ...
]

⚠️  Results limited to 1000 rows. Use LIMIT clause for different limits.
```

## 🔧 Advanced Configuration

### Custom Dangerous Patterns
Add custom patterns to `DANGEROUS_PATTERNS` in `queryConfig.ts`:

```typescript
export const DANGEROUS_PATTERNS = [
  // ... existing patterns ...
  /EXPLAIN\s+ANALYZE/i,  // Block EXPLAIN ANALYZE for performance
  /pg_sleep/i,           // Block sleep functions
];
```

### Per-Table Limits
For more sophisticated limiting, you could extend the system to have per-table limits:

```typescript
const TABLE_LIMITS = {
  'large_table': 100,
  'medium_table': 500,
  'small_table': 1000,
};
```

## 🎯 Best Practices

1. **Start conservative**: Begin with low limits and increase as needed
2. **Monitor usage**: Watch logs for frequently modified queries
3. **Educate users**: Let LLM users know about the limits
4. **Test thoroughly**: Verify limits work with your specific database schema
5. **Consider indexing**: Ensure your database has proper indexes for common query patterns

## 🔄 Read-Only Enforcement

All queries run in read-only transactions:
- `BEGIN TRANSACTION READ ONLY`
- Automatic `ROLLBACK` after each query
- Prevents accidental data modification even if dangerous patterns slip through 