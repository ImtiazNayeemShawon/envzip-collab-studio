// src/utils/config-manager.js
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class ConfigManager {
  static async load() {
    const configPath = path.join(process.cwd(), 'envzip.config');
    
    if (!await fs.pathExists(configPath)) {
      throw new Error('envzip.config not found. Run "envzip init" first.');
    }

    const content = await fs.readFile(configPath, 'utf8');
    const config = {};

    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          config[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    // Validate required fields
    const required = ['envzip_key', 'projectkey', 'local_env_path', 'stage', ];
    for (const field of required) {
      if (!config[field]) {
        throw new Error(`Missing required field "${field}" in envzip.config`);
      }
    }

    // Set defaults
    config.appwrite_endpoint = config.appwrite_endpoint || 'https://cloud.appwrite.io/v1';

    return config;
  }

  static async save(config) {
    const configPath = path.join(process.cwd(), 'envzip.config');
    const content = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(configPath, content);
  }
}

module.exports = ConfigManager;
