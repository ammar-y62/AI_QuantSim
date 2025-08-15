# PostgreSQL Paths & Commands for Windows

## ✅ PostgreSQL is now in your PATH!

You can now use these commands from anywhere:

```bash
psql --version
psql -U postgres -d quantsim
createdb quantsim
```

## 🔧 Full Paths (Backup Option)

If you ever need the full paths:

**PostgreSQL Bin Directory:**
```
C:\Program Files\PostgreSQL\17\bin
```

**Common Commands with Full Paths:**
```bash
# Connect to database
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d quantsim

# Create database
"C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres quantsim

# Run schema file
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d quantsim -f database/schema.sql
```

## 🚀 Quick Database Setup Commands

Once you have your `.env` file ready:

```bash
# Navigate to server directory
cd quantsim-server

# Install dependencies
npm install

# Setup database (creates DB and runs schema)
npm run db:setup

# Start development server
npm run dev
```

## 🔍 Test Connection

Test if everything is working:

```bash
# Test PostgreSQL connection
psql -U postgres -c "SELECT NOW();"

# Check if database exists
psql -U postgres -l | grep quantsim
```

## 📝 Notes

- **Default user**: `postgres`
- **Default port**: `5432`
- **Service name**: `postgresql-x64-17`
- **Data directory**: `C:\Program Files\PostgreSQL\17\data`

## 🆘 Troubleshooting

If you get "command not found":
1. Restart your terminal/PowerShell
2. Check if PATH was added: `echo $env:PATH`
3. Use full paths as backup

The PATH change will persist across terminal restarts! 🎉