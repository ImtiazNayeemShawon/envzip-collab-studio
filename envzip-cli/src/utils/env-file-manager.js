
// ===================================
// src/utils/env-file-manager.js
const fs = require('fs-extra');
const path = require('path');

class EnvFileManager {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
  }

  async readEnvFile() {
    if (!await fs.pathExists(this.filePath)) {
      return {};
    }

    const content = await fs.readFile(this.filePath, 'utf8');
    const variables = {};

    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        return;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key) {
        variables[key] = value;
      }
    });

    return variables;
  }

  async writeEnvFile(variables) {
    const existingContent = await fs.pathExists(this.filePath) 
      ? await fs.readFile(this.filePath, 'utf8')
      : '';

    // Preserve comments and formatting
    const lines = existingContent.split('\n');
    const updatedLines = [];
    const processedKeys = new Set();

    // Process existing lines
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Keep comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        updatedLines.push(line);
        continue;
      }

      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        updatedLines.push(line);
        continue;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      
      if (variables.hasOwnProperty(key)) {
        // Update existing variable
        const value = variables[key];
        const needsQuotes = value.includes(' ') || value.includes('#') || value.includes('"');
        updatedLines.push(`${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
        processedKeys.add(key);
      } else {
        // Keep line as is (variable not in our set)
        updatedLines.push(line);
      }
    }

    // Add new variables that weren't in the original file
    for (const [key, value] of Object.entries(variables)) {
      if (!processedKeys.has(key)) {
        const needsQuotes = value.includes(' ') || value.includes('#') || value.includes('"');
        updatedLines.push(`${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
      }
    }

    await fs.writeFile(this.filePath, updatedLines.join('\n'));
  }
}

module.exports = EnvFileManager;