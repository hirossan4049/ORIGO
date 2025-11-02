# ORIGO Usage Example

## Quick Start Guide

### 1. Registration & Login

1. Start the application: `bun dev`
2. Navigate to `http://localhost:3000`
3. Click "Register" and create an account
4. Login with your credentials

### 2. Create a Project

1. From the dashboard, click "Create New Project"
2. Enter project details:
   - Name: "My First Project"
   - Description: "Testing ORIGO scheduled execution"
3. Click "Create"

### 3. Write a Script

Click on your project and create a new script:

```javascript
// Example 1: Simple Hello World
function main() {
  console.log('Hello from ORIGO!');
  console.log('Current time:', new Date().toISOString());
}

// Example 2: Using Environment Variables
function processWithEnv() {
  console.log('API Key:', env.API_KEY);
  console.log('Environment:', env.NODE_ENV);
}

// Example 3: Using Local Storage
function dataProcessor() {
  const lastRun = localStorage.lastRun || 'Never';
  console.log('Last run:', lastRun);
  
  // Update last run time
  localStorage.lastRun = new Date().toISOString();
  
  // Process some data
  const items = localStorage.items || [];
  console.log(`Processing ${items.length} items`);
}

// Example 4: Daily Report
function dailyReport() {
  const today = new Date().toDateString();
  console.log('=== Daily Report for', today, '===');
  
  const stats = {
    processed: Math.floor(Math.random() * 100),
    errors: Math.floor(Math.random() * 10),
    success: true
  };
  
  console.log('Stats:', JSON.stringify(stats, null, 2));
}
```

### 4. Execute Manually

1. Enter the function name: `main`
2. (Optional) Add environment variables in JSON format:
```json
{
  "API_KEY": "your-api-key",
  "NODE_ENV": "development"
}
```
3. (Optional) Add localStorage data:
```json
{
  "items": ["item1", "item2", "item3"],
  "lastRun": "2025-11-01T00:00:00Z"
}
```
4. Click "Execute Now"

### 5. Schedule Execution

Create a schedule for automatic execution:

**Cron Expression Examples:**
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 0 1 * *` - First day of every month at midnight

**Configuration:**
1. Select the function to execute: `dailyReport`
2. Set cron expression: `0 9 * * *` (daily at 9 AM)
3. Add environment variables (optional)
4. Add localStorage state (optional)
5. Click "Create"

### 6. Monitor Execution

- View execution history in the database
- Check console logs in the server output
- See execution results in the UI (coming feature)

## Advanced Examples

### Weather Alert Script
```javascript
function checkWeather() {
  const apiKey = env.WEATHER_API_KEY;
  const city = localStorage.city || 'Tokyo';
  
  console.log(`Checking weather for ${city}...`);
  // In a real scenario, you'd fetch from an API
  // For now, just demonstrate the concept
  console.log('Weather check completed');
}
```

Schedule: `0 */3 * * *` (Every 3 hours)

### Database Cleanup Script
```javascript
function cleanupOldRecords() {
  const daysToKeep = parseInt(env.RETENTION_DAYS || '30');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  console.log(`Cleaning up records older than ${cutoffDate.toISOString()}`);
  console.log('Cleanup completed');
}
```

Schedule: `0 2 * * *` (Daily at 2 AM)

### Backup Script
```javascript
function performBackup() {
  const backupType = env.BACKUP_TYPE || 'incremental';
  const timestamp = new Date().toISOString();
  
  console.log(`Starting ${backupType} backup at ${timestamp}`);
  localStorage.lastBackup = timestamp;
  console.log('Backup completed successfully');
}
```

Schedule: `0 1 * * *` (Daily at 1 AM)

## Docker Deployment

### Using Docker Compose

```bash
# Set your secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Building Custom Image

```bash
docker build -t origo:latest .
docker run -d \
  -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret" \
  -e DATABASE_URL="file:/app/data/dev.db" \
  -v $(pwd)/data:/app/data \
  origo:latest
```

## Security Notes

⚠️ **Important**: The current implementation uses a basic sandboxing approach that is **NOT suitable for untrusted code**. Use ORIGO only with scripts you trust or in isolated environments.

For production use, consider:
- Running scripts in separate Docker containers
- Implementing resource limits (CPU, memory, time)
- Using proper VM isolation
- Adding input validation and sanitization
- Implementing rate limiting
- Adding audit logging

## Troubleshooting

### Scheduler not starting
Check the server logs for "Initializing scheduler..." message.

### Scripts not executing on schedule
1. Verify cron expression is valid
2. Check that schedule is enabled
3. View server logs for errors
4. Ensure scheduler is running (check health endpoint: `/api/health`)

### Database errors
```bash
# Regenerate Prisma client
bunx prisma generate

# Reset database (⚠️ destroys all data)
bunx prisma db push --force-reset
```
