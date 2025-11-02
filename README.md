# ORIGO

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-orange)](https://bun.sh/)

> 🚀 A Google Apps Script-like scheduled execution platform for running JavaScript/TypeScript code on a schedule

ORIGO is a powerful, self-hosted platform that enables you to write, schedule, and execute JavaScript/TypeScript functions automatically. Perfect for automation tasks, scheduled jobs, data processing, and recurring workflows.

## ✨ Features

- 🔐 **User Authentication**: Secure JWT-based authentication with NextAuth
- 📁 **Project Management**: Create and organize multiple projects per account
- 📝 **Code Editor**: Write and save TypeScript/JavaScript code
- ⚡ **Script Execution**: Execute specific functions on demand
- ⏰ **Scheduled Execution**: Configure automatic execution with cron expressions
- 🔧 **Environment Configuration**: Set environment variables and localStorage for each schedule
- 📊 **Execution History**: View logs and execution results
- 🌐 **Internationalization**: Multi-language support (English and Japanese)
- 🐳 **Docker Support**: Easy deployment with Docker and docker-compose

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Docker Deployment](#-docker-deployment)
- [Usage](#-usage)
- [API Routes](#-api-routes)
- [Development](#-development)
- [Internationalization](#-internationalization)
- [Security Notes](#-security-notes)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Authentication**: NextAuth with JWT
- **Database**: SQLite with [Prisma](https://www.prisma.io/) ORM
- **Code Editor**: Monaco Editor (VSCode-like experience)
- **Linting**: oxlint
- **Scheduling**: node-cron
- **Containerization**: Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Bun 1.0+** (recommended) - [Install Bun](https://bun.sh/docs/installation)
- Node.js 18+ (optional, for compatibility)

### Installation

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/hirossan4049/ORIGO.git
cd ORIGO
```

#### 2️⃣ Install dependencies

```bash
bun install
```

#### 3️⃣ Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `NEXTAUTH_SECRET` to a secure random string:

```bash
# Generate a secure secret
openssl rand -base64 32
```

#### 4️⃣ Initialize the database

```bash
bunx prisma generate
bunx prisma db push
```

#### 5️⃣ Start the development server

```bash
bun dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) in your browser and start building!

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

#### 1️⃣ Generate and set your secret

```bash
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### 2️⃣ Build and start services

```bash
docker-compose up -d
```

#### 3️⃣ View logs (optional)

```bash
docker-compose logs -f
```

#### 4️⃣ Stop services

```bash
docker-compose down
```

### Building Docker Image Manually

```bash
# Build the image
docker build -t origo .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret-key" \
  --name origo \
  origo
```

## 📖 Usage

### Quick Start Guide

#### 1. 👤 Register an Account

Navigate to `/register` or click the Register button on the home page to create your account.

#### 2. 📁 Create a Project

After logging in, click **"Create New Project"** from the dashboard. Give your project a name and description.

#### 3. ✍️ Write a Script

Inside a project, create a new script using the Monaco editor (VSCode-like experience). Write your JavaScript/TypeScript code:

```javascript
// Example: Hello World
function main() {
  console.log('Hello from ORIGO!');
  console.log('Current time:', new Date().toISOString());
  console.log('Environment:', env);
  console.log('Local Storage:', localStorage);
}

// Example: Data Processing
function processData() {
  const data = localStorage.data || [];
  console.log('Processing', data.length, 'items');
  
  // Process each item
  data.forEach((item, index) => {
    console.log(`Processing item ${index}:`, item);
  });
  
  // Update localStorage
  localStorage.lastProcessed = new Date().toISOString();
}
```

#### 4. ⚡ Execute Manually

Test your script by:
1. Selecting the function to execute (e.g., `main`)
2. Adding environment variables (key-value pairs)
3. Adding localStorage data (key-value pairs)
4. Clicking **"Execute Now"**

View the execution output in real-time on the **Execution Logs** tab.

#### 5. ⏰ Schedule Automatic Execution

Create schedules using the user-friendly dropdown interface:

**Schedule Options:**
- **Every X Minutes** - e.g., every 5 minutes
- **Every X Hours** - e.g., every 3 hours
- **Every X Days** - e.g., daily at midnight
- **Custom Cron** - for advanced scheduling

**Common Cron Patterns:**
- `*/5 * * * *` - Every 5 minutes
- `0 */3 * * *` - Every 3 hours
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 0 1 * *` - First day of every month

Configure environment variables and localStorage for each schedule to customize execution behavior.

## 🔌 API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, logout, session)

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Files (Scripts)
- `POST /api/files` - Create new script file
- `GET /api/files/[id]` - Get script file details
- `PUT /api/files/[id]` - Update script file content
- `DELETE /api/files/[id]` - Delete script file
- `POST /api/files/[id]/execute` - Execute script manually
- `GET /api/files/[id]/executions` - Get execution history

### Schedules
- `POST /api/schedules` - Create schedule
- `GET /api/schedules/[id]` - Get schedule details
- `PUT /api/schedules/[id]` - Update schedule
- `DELETE /api/schedules/[id]` - Delete schedule

## 👨‍💻 Development

### Available Scripts

#### Linting
```bash
bun run lint
```

#### Type Checking
```bash
bun run type-check
```

#### Building for Production
```bash
bun run build
```

#### Running Production Build
```bash
bun start
```

#### End-to-End Testing
```bash
bun run test:e2e
```

### Project Structure

```
ORIGO/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── components/     # React components
│   ├── dashboard/      # Dashboard pages
│   ├── files/          # Script/file editor pages
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── projects/       # Project pages
│   └── schedules/      # Schedule management pages
├── lib/                # Utility functions and configurations
├── prisma/             # Database schema and migrations
├── tests/              # End-to-end tests
└── types/              # TypeScript type definitions
```

## 🌐 Internationalization

ORIGO supports multiple languages out of the box:

- 🇬🇧 **English** (default)
- 🇯🇵 **Japanese** (日本語)

### Using the Language Switcher

Users can easily switch between languages using the language switcher available on:
- Home page (navigation bar)
- Login page
- Register page

The selected language preference is maintained as you navigate through the application.

### For Developers

Want to add more languages or customize translations? Check out our comprehensive [Localization Guide](./docs/L10N.md) for:
- Adding new languages
- Updating translations
- Translation best practices
- Troubleshooting

## 🔒 Security Notes

> ⚠️ **IMPORTANT SECURITY WARNING**

The current script execution implementation uses a basic sandboxing approach with the Function constructor. **This is NOT suitable for executing untrusted code in production environments.**

### Current Limitations

ORIGO is designed for **personal use** or **trusted team environments** where all users are trusted. The sandboxing is minimal and can be bypassed by malicious code.

### Production Recommendations

If you plan to use ORIGO in production or with untrusted code, implement additional security measures:

- ✅ **Isolated Execution**: Run scripts in separate Docker containers or VMs
- ✅ **Resource Limits**: Implement CPU, memory, and execution time limits
- ✅ **VM Isolation**: Use proper VM-based isolation (e.g., `isolated-vm`, `vm2`)
- ✅ **Input Validation**: Validate and sanitize all user inputs
- ✅ **Rate Limiting**: Prevent abuse through rate limiting
- ✅ **Audit Logging**: Log all script executions and user actions
- ✅ **Network Isolation**: Restrict network access from scripts
- ✅ **File System Restrictions**: Limit file system access

### Best Practices

1. **Only run scripts you trust**
2. **Review all code before scheduling**
3. **Use environment variables for sensitive data** (never hardcode)
4. **Regularly update dependencies** for security patches
5. **Monitor execution logs** for suspicious activity

## 🤝 Contributing

Contributions are welcome! We appreciate your help in making ORIGO better.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Bun](https://bun.sh/)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- UI components inspired by modern design practices

## 📧 Support

If you encounter any issues or have questions:

- 📫 Open an [issue](https://github.com/hirossan4049/ORIGO/issues)
- 💬 Start a [discussion](https://github.com/hirossan4049/ORIGO/discussions)
- 📖 Check [EXAMPLE.md](EXAMPLE.md) for detailed usage examples

---

<div align="center">

**Made with ❤️ by the ORIGO team**

⭐ Star us on GitHub if you find this project useful!

</div>