// src/services/envzip-service.js
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const EnvFileManager = require('../utils/env-file-manager');

class EnvZipService {
  constructor(config) {
    this.config = config;
    this.watcher = null;
    this.realtimeSubscription = null;
    this.envManager = new EnvFileManager(config.local_env_path);
    this.isInitialized = false;
    this.isSyncing = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    console.log(chalk.green('🔗 [Init] Config loaded:'), this.config);
    this.isInitialized = true;
  }

  async ensureCollection() {
    console.log(chalk.blue('📦 [EnsureCollection] Would ensure collection exists'));
  }

  getDocumentId(key) {
    return `${this.config.projectkey}_${this.config.stage}_${key}`;
  }

  async pullFromRemote() {
    console.log(chalk.blue('📥 [Pull] Fetching remote variables...'));

    // Fake remote data for testing
    const remoteVars = {
      API_KEY: { value: 'remote-123', timestamp: Date.now(), hash: 'xxx' },
    };
    const localVars = await this.envManager.readEnvFile();

    let updated = false;
    let conflicts = [];
    let count = 0;

    for (const [key, remoteData] of Object.entries(remoteVars)) {
      const localValue = localVars[key];
      const remoteValue = remoteData.value;

      if (localValue !== remoteValue) {
        if (localValue !== undefined) {
          conflicts.push({ key, local: localValue, remote: remoteValue });
        }
        localVars[key] = remoteValue;
        updated = true;
        count++;
      }
    }

    if (updated) {
      await this.envManager.writeEnvFile(localVars);
      console.log(chalk.green(`✅ [Pull] Applied ${count} updates`));
    }

    return { updated, count, conflicts };
  }

  async pushToRemote() {
    console.log(chalk.blue('📤 [Push] Pushing local variables...'));

    const localVars = await this.envManager.readEnvFile();

    let updated = false;
    let count = 0;

    for (const [key, value] of Object.entries(localVars)) {
      console.log(chalk.yellow(`[Push] Would update key=${key}, value=${value}`));
      updated = true;
      count++;
    }

    return { updated, count };
  }

  async getRemoteVariables() {
    console.log(chalk.blue('📡 [Fetch] Would fetch remote vars...'));
    // Return mock data
    return {
      TEST_KEY: { value: 'remote-val', timestamp: Date.now(), hash: 'abc' }
    };
  }

  async setRemoteVariable(key, value, timestamp = Date.now()) {
    console.log(chalk.magenta(`[Set] Would set ${key}=${value} at ${timestamp}`));
  }

  async startWatcher(enableRealtime = false) {
    this.startFileWatcher();

    if (enableRealtime) {
      await this.startRealtimeSync();
    }

    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n🛑 Stopping watchers...'));
      this.stopWatchers();
      process.exit(0);
    });

    await new Promise(() => {}); // Keep alive
  }

  startFileWatcher() {
    const envPath = path.resolve(this.config.local_env_path);

    this.watcher = chokidar.watch(envPath, {
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', async () => {
      if (this.isSyncing) return;
      console.log(chalk.cyan('📝 Local .env file changed, pushing updates...'));

      try {
        this.isSyncing = true;
        const result = await this.pushToRemote();
        if (result.updated) {
          console.log(chalk.green(`✅ [Watcher] Pushed ${result.count} changes`));
        }
      } catch (error) {
        console.error(chalk.red('❌ [Watcher] Failed to push changes:'), error.message);
      } finally {
        this.isSyncing = false;
      }
    });

    console.log(chalk.green(`👀 Watching ${envPath} for changes...`));
  }

  async startRealtimeSync() {
    console.log(chalk.green('📡 [Realtime] Would start realtime subscription...'));
    this.realtimeSubscription = () => console.log(chalk.gray('📡 [Realtime] Stopped'));
  }

  async handleRealtimeUpdate(response) {
    if (this.isSyncing) return;
    console.log(chalk.cyan('📡 [Realtime] Received update:'), response);

    try {
      this.isSyncing = true;
      const result = await this.pullFromRemote();
      if (result.updated) {
        console.log(chalk.green(`✅ [Realtime] Applied ${result.count} remote changes`));
      }
    } catch (error) {
      console.error(chalk.red('❌ [Realtime] Failed to apply update:'), error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  async getStatus() {
    const localVars = await this.envManager.readEnvFile();
    const remoteVars = await this.getRemoteVariables();

    let conflicts = 0;
    for (const [key, localValue] of Object.entries(localVars)) {
      const remoteData = remoteVars[key];
      if (remoteData && remoteData.value !== localValue) {
        conflicts++;
      }
    }

    return {
      localCount: Object.keys(localVars).length,
      remoteCount: Object.keys(remoteVars).length,
      conflicts,
      lastSync: 'Unknown'
    };
  }

  stopWatchers() {
    if (this.watcher) {
      this.watcher.close();
      console.log(chalk.gray('🔍 [Watcher] Stopped'));
    }
    if (this.realtimeSubscription) {
      this.realtimeSubscription();
    }
  }

  generateHash(value) {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}

module.exports = EnvZipService;
