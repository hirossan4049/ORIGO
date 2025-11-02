# ORIGO

Google App Script-like scheduled execution platform built with Next.js, Bun, and NextAuth.

## Features

- 🔐 **User Authentication**: Secure JWT-based authentication with NextAuth
- 📁 **Project Management**: Create and organize multiple projects per account
- 📝 **Code Editor**: Write and save TypeScript/JavaScript code
- ⚡ **Script Execution**: Execute specific functions on demand
- ⏰ **Scheduled Execution**: Configure automatic execution with cron expressions
- 🔧 **Environment Configuration**: Set environment variables and localStorage for each schedule
- 📊 **Execution History**: View logs and execution results
- 🐳 **Docker Support**: Easy deployment with Docker and docker-compose

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth with JWT
- **Database**: SQLite with Prisma ORM
- **Linting**: oxlint
- **Scheduling**: node-cron
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Bun 1.0 or later
- Node.js 18+ (optional, for compatibility)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hirossan4049/ORIGO.git
cd ORIGO
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and set NEXTAUTH_SECRET to a random string
```

4. Initialize the database:
```bash
bunx prisma generate
bunx prisma db push
```

5. Run the development server:
```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

### Using Docker Compose

1. Set your environment variables:
```bash
export NEXTAUTH_SECRET="your-secret-key"
```

2. Build and run:
```bash
docker-compose up -d
```

### Building Docker Image Manually

```bash
docker build -t origo .
docker run -p 3000:3000 -e NEXTAUTH_SECRET="your-secret-key" origo
```

## Usage

### 1. Register an Account
Navigate to `/register` and create a new account.

### 2. Create a Project
After logging in, create a new project from the dashboard.

### 3. Write a Script
Inside a project, create a new script and write your JavaScript/TypeScript code:

```javascript
function main() {
  console.log('Hello from ORIGO!');
  console.log('Environment:', env);
  console.log('Local Storage:', localStorage);
}

function processData() {
  const data = localStorage.data || [];
  console.log('Processing', data.length, 'items');
}
```

### 4. Execute Manually
Test your script by executing it manually with custom environment variables and localStorage.

### 5. Schedule Execution
Create a schedule using cron expressions:
- `*/5 * * * *` - Every 5 minutes
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM

Configure environment variables and localStorage for each schedule.

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `POST /api/scripts` - Create new script
- `GET /api/scripts/[id]` - Get script details
- `PUT /api/scripts/[id]` - Update script
- `DELETE /api/scripts/[id]` - Delete script
- `POST /api/scripts/[id]/execute` - Execute script
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/[id]` - Update schedule
- `DELETE /api/schedules/[id]` - Delete schedule

## Development

### Linting
```bash
bun run lint
```

### Type Checking
```bash
bun run type-check
```

### Building
```bash
bun run build
```

### Running Production Build
```bash
bun start
```

## Security Notes

⚠️ **Important**: The script execution uses a basic sandboxing approach with Function constructor. This is **NOT suitable for executing untrusted code** in production. For production use, consider:

- Using a separate isolated worker process
- Implementing proper resource limits
- Running scripts in containerized environments
- Using VM-based isolation (e.g., vm2, isolated-vm)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.