# EnvZip - Hybrid .env Syncing System

A powerful CLI tool for syncing environment variables across teams using Appwrite as the backend.

## Features

- 🔄 **Two-way sync** between local `.env` files and Appwrite database
- 📡 **Real-time collaboration** with instant updates across team members
- 🎯 **Multi-environment support** (development, staging, production)
- ⚡ **File watching** for automatic sync on local changes
- 🔒 **Conflict resolution** with timestamp-based versioning
- 🛠️ **Easy CLI interface** with intuitive commands

## Installation

```bash
npm install -g envzip-cli
```

Or install locally in your project:

```bash
npm install envzip-cli
```

## Quick Start

### 1. Initialize Configuration

Run this command in your project root:

```bash
npx envzip init
```

This will prompt you for:
- Appwrite API key
- Project name
- Local .env file path
- Environment stage (development/staging/production)
- Appwrite endpoint URL
- Appwrite project ID

### 2. Set Up Appwrite

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project
3. Generate an API key with the following scopes:
   - `databases.read`
   - `databases.write`
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
   - `documents.read`
   - `documents.write`

### 3. Basic Usage

```bash
# Pull latest variables from remote
npx envzip pull

# Push local changes to remote
npx envzip push

# Check sync status
npx envzip status

# Watch for changes (file only)
npx envzip watch

# Watch with realtime dashboard sync
npx envzip watch --dashboard
```

## Configuration

The `envzip.config` file contains:

```
envzip_key=your_appwrite_api_key
projectkey=my_project
local_env_path=.env
stage=development
appwrite_endpoint=https://cloud.appwrite.io/v1
appwrite_project_id=your_project_id
```

## Commands

### `envzip init`
Initialize configuration in current directory.

### `envzip pull`
Download latest environment variables from Appwrite and update local `.env` file.

### `envzip push`
Upload local `.env` variables to Appwrite database.

### `envzip watch [--dashboard]`
Start watching for changes:
- Without `--dashboard`: Only watches local file changes and pushes to remote
- With `--dashboard`: Enables two-way sync with realtime updates from dashboard

### `envzip status`
Display current sync status, variable counts, and potential conflicts.

## How It Works

### Data Flow

1. **Local to Remote**: File watcher detects changes → pushes to Appwrite
2. **Remote to Local**: Realtime subscription receives updates → updates local file
3. **Conflict Resolution**: Timestamp-based versioning prevents data loss

### Database Schema

Variables are stored in Appwrite with this structure:
```javascript
{
  project: "my_project",
  stage: "development", 
  key: "DATABASE_URL",
  value: "postgresql://...",
  timestamp: 1640995200000,
  hash: "abc123..."
}
```

### Conflict Handling

- Each variable update includes a timestamp
- Local changes always take precedence during push
- Remote changes are applied during pull with conflict detection
- Conflicts are logged but remote values are preserved

## Advanced Usage

### Multiple Environments

Set up different configs for each environment:

```bash
# Development
stage=development

# Staging  
stage=staging

# Production
stage=production
```

### Team Collaboration

1. Team members run `envzip init` with same project settings
2. Use `envzip watch --dashboard` for real-time collaboration
3. Changes made by any team member sync automatically

### CI/CD Integration

```bash
# In your deployment script
npx envzip pull  # Get latest variables
# Run your deployment commands
```

## Troubleshooting

### Common Issues

1. **"Collection not found" error**
   - Solution: The CLI automatically creates required collections

2. **"Permission denied" error**  
   - Solution: Ensure API key has proper database permissions

3. **Variables not syncing**
   - Solution: Check `envzip status` and verify configuration

4. **File permission errors**
   - Solution: Ensure `.env` file is writable

### Debug Mode

Set `DEBUG=envzip:*` environment variable for detailed logging:

```bash
DEBUG=envzip:* npx envzip pull
```

## Security Considerations

- Store API keys securely (use environment variables in CI/CD)
- Use separate Appwrite projects for different teams
- Regularly rotate API keys
- Review team member access to Appwrite projects

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## License

MIT License - see LICENSE file for details.