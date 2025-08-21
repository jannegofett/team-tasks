# Database Setup

This project uses PostgreSQL with Drizzle ORM for data persistence.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm

## Quick Start

1. **Start the database:**
   ```bash
   npm run docker:up
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=team_tasks
   ```

3. **Generate and run migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **View database in Drizzle Studio:**
   ```bash
   npm run db:studio
   ```

## Database Schema

### Tables

- **assignees**: Team members who can be assigned to tasks
- **columns**: Kanban board columns (To Do, In Progress, Done)
- **tasks**: Individual tasks with status, description, and assignments

### Relationships

- Tasks belong to columns (many-to-one)
- Tasks can have assignees (many-to-one)
- Columns contain multiple tasks (one-to-many)

## Available Scripts

- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View container logs
- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Development

The database automatically initializes with:
- Default columns (To Do, In Progress, Done)
- Proper indexes for performance
- UUID primary keys
- Timestamps for created_at and updated_at
- Foreign key constraints with proper cascade rules

## Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: team_tasks
- **Username**: postgres
- **Password**: postgres
