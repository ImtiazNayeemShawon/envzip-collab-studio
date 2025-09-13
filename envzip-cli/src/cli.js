const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const EnvZipService = require('./services/envzip-service');
const ConfigManager = require('./utils/config-manager');

class EnvZipCLI {
  constructor() {
    this.service = null;
    this.config = null;
  }

  async init() {
    console.log(chalk.blue('🔧 Initializing EnvZip configuration...'));

    const questions = [
      {
        type: 'input',
        name: 'envzip_key',
        message: 'Enter your envzip API key:',
        validate: input => input.trim() !== '' || 'API key is required'
      },
      {
        type: 'input',
        name: 'projectkey',
        message: 'Enter project key:',
        validate: input => input.trim() !== '' || 'Project name is required'
      },
      {
        type: 'input',
        name: 'local_env_path',
        message: 'Path to local .env file:',
        default: '.env'
      },
      {
        type: 'list',
        name: 'stage',
        message: 'Select environment stage:',
        choices: ['development', 'staging', 'production'],
        default: 'development'
      },
      
    ];

    const answers = await inquirer.prompt(questions);
    
    const configPath = path.join(process.cwd(), 'envzip.config');
    const configContent = Object.entries(answers)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(configPath, configContent);
    console.log(chalk.green('✅ Configuration saved to envzip.config'));

    // Create .env file if it doesn't exist
    const envPath = path.join(process.cwd(), answers.local_env_path);
    if (!await fs.pathExists(envPath)) {
      await fs.writeFile(envPath, '# Environment variables\n');
      console.log(chalk.green(`✅ Created ${answers.local_env_path}`));
    }
  }

  async loadService() {
    if (!this.service) {
      this.config = await ConfigManager.load();
      this.service = new EnvZipService(this.config);
      await this.service.initialize();
    }
    return this.service;
  }

  async pull() {
    try {
      console.log(chalk.blue('📥 Pulling environment variables...'));
      const service = await this.loadService();
      const result = await service.pullFromRemote();
      
      if (result.updated) {
        console.log(chalk.green(`✅ Successfully pulled ${result.count} variables`));
        if (result.conflicts.length > 0) {
          console.log(chalk.yellow(`⚠️  ${result.conflicts.length} conflicts detected and resolved`));
        }
      } else {
        console.log(chalk.cyan('ℹ️  No updates available'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Pull failed:'), error.message);
      process.exit(1);
    }
  }

  async push() {
    try {
      console.log(chalk.blue('📤 Pushing environment variables...'));
      const service = await this.loadService();
      const result = await service.pushToRemote();
      
      if (result.updated) {
        console.log(chalk.green(`✅ Successfully pushed ${result.count} variables`));
      } else {
        console.log(chalk.cyan('ℹ️  No changes to push'));
      }
    } catch (error) {
      console.error(chalk.red('❌ Push failed:'), error.message);
      process.exit(1);
    }
  }

  async watch(enableDashboard = false) {
    try {
      console.log(chalk.blue('👀 Starting watch mode...'));
      if (enableDashboard) {
        console.log(chalk.blue('📡 Realtime dashboard sync enabled'));
      }
      
      const service = await this.loadService();
      
      console.log(chalk.green('✅ Watching for changes. Press Ctrl+C to stop.'));
      await service.startWatcher(enableDashboard);
      
    } catch (error) {
      console.error(chalk.red('❌ Watch mode failed:'), error.message);
      process.exit(1);
    }
  }

  async status() {
    try {
      const service = await this.loadService();
      const status = await service.getStatus();
      
      console.log(chalk.blue('📊 EnvZip Status'));
      console.log(chalk.gray('═══════════════'));
      console.log(`Project: ${chalk.cyan(this.config.projectkey)}`);
      console.log(`Stage: ${chalk.cyan(this.config.stage)}`);
      console.log(`Local file: ${chalk.cyan(this.config.local_env_path)}`);
      console.log(`Local variables: ${chalk.yellow(status.localCount)}`);
      console.log(`Remote variables: ${chalk.yellow(status.remoteCount)}`);
      console.log(`Last sync: ${chalk.gray(status.lastSync || 'Never')}`);
      
      if (status.conflicts > 0) {
        console.log(chalk.red(`⚠️  ${status.conflicts} potential conflicts`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Status check failed:'), error.message);
    }
  }
}

module.exports = EnvZipCLI;