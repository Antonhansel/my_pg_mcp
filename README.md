# PostgreSQL MCP Server

A Model Context Protocol (MCP) server that provides safe, read-only access to PostgreSQL databases for Large Language Models (LLMs). This server enables LLMs to query your PostgreSQL database while maintaining strict safety controls to prevent data modification or resource exhaustion.

## 🚀 Features

- **Safe Database Access**: Read-only queries with automatic safety controls
- **Query Limiting**: Automatic row limits and query timeouts
- **Resource Discovery**: Browse database tables and schemas
- **Security First**: Blocks dangerous SQL patterns and enforces transaction safety
- **Easy Integration**: Works with Claude Desktop and other MCP-compatible clients

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd my_pg_mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Database Setup

Ensure your PostgreSQL database is running and accessible. You'll need:
- Database host and port
- Database name
- Username and password with read access

### Claude Desktop Configuration

Choose one of the following configuration methods based on your Node.js setup:

#### Option 1: Using NVM (Recommended for NVM users)

If you're using NVM (Node Version Manager), use the direct node path to ensure the correct Node.js version:

```json
{
  "mcpServers": {
    "my-pg-mcp": {
      "command": "/path/to/your/node",
      "args": [
          "/path/to/your/project/node_modules/ts-node/dist/bin.js",
          "/path/to/your/project/src/server/index.ts"
      ],
      "cwd": "/path/to/your/project",
      "env": {
          "DB_USER": "your_db_user",
          "DB_PASSWORD": "your_db_password",
          "DB_HOST": "127.0.0.1",
          "DB_PORT": "5432",
          "DB_NAME": "your_db_name"
      }
    }
  }
}
```

**To find your node path with NVM:**
```bash
which node
# Example output: /Users/username/.nvm/versions/node/v18.16.1/bin/node
```

#### Option 2: Using npm (Standard Node.js installation)

If you have Node.js installed globally (not through NVM), you can use npm directly:

```json
{
  "mcpServers": {
    "my-pg-mcp": {
      "command": "npm",
      "args": [
          "start"
      ],
      "cwd": "/path/to/your/project",
      "env": {
          "DB_USER": "your_db_user",
          "DB_PASSWORD": "your_db_password",
          "DB_HOST": "127.0.0.1",
          "DB_PORT": "5432",
          "DB_NAME": "your_db_name"
      }
    }
  }
}
```

### Configuration File Locations

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Environment Variables

You can also set database credentials as environment variables instead of in the config file:

```bash
export DB_USER="your_db_user"
export DB_PASSWORD="your_db_password"
export DB_HOST="127.0.0.1"
export DB_PORT="5432"
export DB_NAME="your_db_name"
```

## 🔧 Usage

### Available Tools

The MCP server provides one main tool:

- **`query-database`**: Execute read-only SQL queries against your PostgreSQL database

### Available Resources

- **Database Tables**: Browse available tables in your database
- **Table Schemas**: View column information and data types for each table

### Example Queries

```sql
-- Get user information
SELECT id, name, email FROM users WHERE active = true LIMIT 10;

-- Count records
SELECT COUNT(*) FROM orders WHERE created_at > '2024-01-01';

-- Join tables
SELECT u.name, COUNT(o.id) as order_count 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
GROUP BY u.id, u.name 
LIMIT 20;
```

## 🛡️ Safety Features

This MCP server includes comprehensive safety mechanisms:

### Automatic Query Limiting
- **Row Limits**: Queries are automatically limited to 1,000 rows
- **Timeouts**: 30-second query timeout prevents long-running queries
- **Length Limits**: Maximum query length of 10,000 characters

### Blocked Operations
The following operations are automatically blocked:
- `DELETE` statements
- `INSERT` statements
- `UPDATE` statements
- `DROP` statements
- `CREATE` statements
- `ALTER` statements
- `TRUNCATE` statements

### Read-Only Enforcement
- All queries run in read-only transactions
- Automatic rollback after each query
- No data modification possible

For detailed safety information, see [QUERY_SAFETY.md](QUERY_SAFETY.md).

## 🚀 Development

### Running in Development Mode
```bash
npm run dev
```

### Building the Project
```bash
npm run build
```

### Testing the Server
```bash
npm start
```

## 🔍 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Ensure you've run `npm install`
   - Check that your Node.js version is compatible (v16+)

2. **Database connection errors**
   - Verify your database credentials
   - Ensure PostgreSQL is running
   - Check network connectivity to the database

3. **NVM path issues**
   - Use `which node` to find the correct path
   - Ensure the path in your config matches your active NVM version

4. **Permission errors**
   - Ensure the database user has read permissions
   - Check that the user can connect from your host

### Debugging

Enable debug logging by setting the environment variable:
```bash
export DEBUG=1
```

## 📝 Configuration Options

### Query Limits (Environment Variables)
```bash
export MCP_MAX_ROWS=500           # Maximum rows to return (default: 1000)
export MCP_TIMEOUT_MS=15000       # Query timeout in milliseconds (default: 30000)
export MCP_MAX_QUERY_LENGTH=5000  # Maximum query length (default: 10000)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Related Documentation

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
- [Query Safety Documentation](QUERY_SAFETY.md)
