# Database Setup Guide for AI QuantSim

This guide will help you set up PostgreSQL for your AI QuantSim application.

## Prerequisites

1. **PostgreSQL installed** on your system
2. **Node.js** (version 16 or higher)
3. **Firebase Admin SDK** credentials

## Quick Setup

### 1. Install Dependencies

```bash
cd quantsim-server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your details:

```bash
cp env.example .env
```

Edit `.env` with your actual values:
- Database credentials
- Firebase Admin SDK credentials
- API keys

### 3. Create Database and Run Schema

**Option A: Using the setup script (Recommended)**
```bash
npm run db:setup
```

**Option B: Manual setup**
```bash
# Create database
createdb quantsim

# Run schema
psql -U postgres -d quantsim -f database/schema.sql
```

### 4. Start the Server

```bash
npm run dev
```

## Database Schema Overview

The database includes the following tables:

- **users** - User accounts linked to Firebase Auth
- **portfolios** - User portfolio configurations
- **portfolio_holdings** - Individual stock holdings within portfolios
- **user_preferences** - User settings and preferences
- **watchlists** - User stock watchlists
- **saved_forecasts** - User's saved AI predictions
- **user_activity** - User activity logging

## Key Features

- **UUID primary keys** for better security
- **Automatic timestamps** (created_at, updated_at)
- **Referential integrity** with foreign key constraints
- **Triggers** for automatic data maintenance
- **Indexes** for optimal query performance

## Development Workflow

1. **Local Development**: Use local PostgreSQL instance
2. **Testing**: Use separate test database
3. **Production**: Use cloud PostgreSQL service (Railway, Supabase, AWS RDS)

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if PostgreSQL is running
2. **Authentication failed**: Verify username/password in .env
3. **Database doesn't exist**: Run the setup script first

### Useful Commands

```bash
# Check database connection
npm run dev

# Reset database (WARNING: This will delete all data)
npm run db:reset

# View database logs
psql -U postgres -d quantsim -c "SELECT * FROM users;"
```

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for database access
- Enable SSL in production
- Regularly backup your database

## Next Steps

After setting up the database:

1. Update your controllers to use the database
2. Implement proper error handling
3. Add database migrations for future schema changes
4. Set up automated backups

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your environment variables
3. Ensure PostgreSQL is running and accessible