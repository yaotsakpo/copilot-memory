# 🧠 Copilot Memory

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/yaotsakpo.copilot-memory)](https://marketplace.visualstudio.com/items?itemName=yaotsakpo.copilot-memory)
[![Visual Studio Marketplace Downl## 🛣️ Roadmap

### ✅ Completed (v0.0.7 - Current)
- ✅ **Advanced MongoDB Integration**: Connection pooling, retry logic, failover
- ✅ **Professional Architecture**: Command pattern, dependency injection, modular design
- ✅ **Comprehensive Testing**: Unit tests for utilities, command handlers, and core functionality
- ✅ **Configuration Validation**: Runtime validation with detailed error messages
- ✅ **Extension API**: Full programmatic access for third-party extensions
- ✅ **Custom Rule Scopes**: Extensible scope system beyond global/project/language
- ✅ **Event System**: Subscribe to rule changes and extension events
- ✅ **Enterprise Logging**: Professional logging with output channels and log levels
- ✅ **CI/CD Pipeline**: Automated testing, linting, and marketplace publishing
- ✅ **Bulk Operations**: Export rules, bulk delete with confirmation
- ✅ **Production Ready**: Error handling, resource cleanup, graceful shutdown

### 🚧 Coming Soon (v0.1.0)
- 🚧 **Visual Rule Editor**: Rich UI for managing rules with drag-drop, filtering
- 🚧 **Rule Templates**: Pre-built rule sets for popular frameworks (React, Vue, Angular)
- 🚧 **Team Synchronization**: Share rule sets across teams with Git integration
- 🚧 **Rule Analytics**: Usage metrics, effectiveness tracking, rule optimization
- 🚧 **AI Rule Suggestions**: Copilot-powered rule recommendations based on code patterns

### 🔮 Future (v1.0.0+)
- 🔮 **Cloud Service**: Managed rule synchronization across devices and teams
- 🔮 **Machine Learning**: Personalized rule suggestions based on coding habits
- 🔮 **IDE Integration**: Support for JetBrains IDEs, Neovim, Emacs
- 🔮 **Enterprise Features**: SAML/SSO, audit logs, compliance reporting
- 🔮 **Rule Marketplace**: Community-driven rule sharing and discoveryhields.io/visual-studio-marketplace/d/yaotsakpo.copilot-memory)](https://marketplace.visualstudio.com/items?itemName=yaotsakpo.copilot-memory)
[![GitHub Stars](https://img.shields.io/github/stars/yaotsakpo/copilot-memory)](https://github.com/yaotsakpo/copilot-memory)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![CI/CD](https://github.com/yaotsakpo/copilot-memory/actions/workflows/ci.yml/badge.svg)](https://github.com/yaotsakpo/copilot-memory/actions)

**Enterprise-grade personalization layer for GitHub Copilot with advanced MongoDB integration and extensible API!**

Copilot Memory is a professional VS Code extension that adds intelligent, persistent memory to GitHub Copilot. Define coding rules, preferences, and standards that are automatically applied to enhance AI suggestions according to your team's requirements.

![Copilot Memory Demo](https://raw.githubusercontent.com/yaotsakpo/copilot-memory/main/assets/copilot-memory.png)

## 🚀 Why Copilot Memory?

- 🎯 **Enterprise-Ready**: Professional MongoDB connection pooling with retry logic and failover
- 🌐 **Advanced Scoping**: Global, project, language, and custom rule scopes
- � **Dual Storage**: MongoDB primary with intelligent local JSON fallback
- 🔌 **Extensible API**: Full programmatic access for third-party extensions
- ⚡ **Zero Configuration**: Works immediately with comprehensive validation
- 🛡️ **Production-Grade**: Extensive testing, logging, error handling, and monitoring

## 📦 Installation

### From VS Code Marketplace (Recommended) ⭐

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Copilot Memory"
4. Click **Install**

### Manual Installation

1. Download the latest `.vsix` file from [Releases](https://github.com/yaotsakpo/copilot-memory/releases)
2. In VS Code: `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
3. Select the downloaded file

## 🎯 Quick Start

### 1. Add Your First Rule

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Copilot Memory: Add Rule`
3. Enter your rule: *"Always use async/await instead of .then() for Promises"*
4. Choose scope: **Global** (applies everywhere)

### 2. Language-Specific Rules

1. Open a TypeScript file
2. `Copilot Memory: Add Rule`
3. Enter: *"Prefer interfaces over type aliases for object shapes"*
4. Choose scope: **Language** (applies only to TypeScript)

### 3. Project-Specific Rules

1. In your project workspace
2. `Copilot Memory: Add Rule`
3. Enter: *"Use our custom Logger class instead of console.log"*
4. Choose scope: **Project** (applies only to this workspace)

## 💡 Example Rules

### Code Style Rules
- *"Always use const instead of let for variables that won't be reassigned"*
- *"Prefer arrow functions over function declarations for callbacks"*
- *"Use template literals instead of string concatenation"*

### Framework-Specific Rules
- *"Use React hooks instead of class components"*
- *"Prefer Composition API over Options API in Vue 3"*
- *"Use async/await with try-catch for error handling in Node.js"*

### Team Standards
- *"Include JSDoc comments for all public functions"*
- *"Use our custom error handling middleware for Express routes"*
- *"Follow our naming convention: use camelCase for variables, PascalCase for classes"*

## 🎛️ Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `Copilot Memory: Add Rule` | Create a new coding rule | - |
| `Copilot Memory: List Rules` | View and manage existing rules | - |
| `Copilot Memory: Remove Rule` | Delete a specific rule | - |
| `Copilot Memory: Remove All Rules` | Bulk delete all rules (with confirmation) | - |
| `Copilot Memory: Export Rules` | Export rules to JSON file | - |
| `Copilot Memory: Show Logs` | View extension logs and diagnostics | - |

## 🔌 Extension API (NEW!)

Copilot Memory provides a comprehensive API for third-party extensions. Perfect for building team tools, CI/CD integrations, or custom rule management interfaces.

### Getting the API

```typescript
import * as vscode from 'vscode';
import { CopilotMemoryAPI } from './types/copilotMemoryAPI';

// Get the API
const extension = vscode.extensions.getExtension('yaotsakpo.copilot-memory');
const api: CopilotMemoryAPI = extension?.exports;
```

### API Methods

#### Rule Management
```typescript
// Add a rule programmatically
const ruleId = await api.addRule(
  'Always use TypeScript strict mode',
  'language',
  { languageScope: 'typescript' }
);

// Get all rules with filters
const globalRules = await api.getRules({ scope: 'global', isActive: true });

// Remove a rule
await api.removeRule(ruleId);

// Get active rules for current context
const contextRules = await api.getActiveRulesForContext('typescript');
```

#### Custom Scopes
```typescript
// Register a custom scope for test files
api.registerCustomScope('test-files', (context) => {
  return context.filePath?.includes('.test.') ||
         context.filePath?.includes('.spec.');
});
```

#### Event Handling
```typescript
// Subscribe to rule changes
const disposable = api.onRuleChanged(event => {
  console.log(`Rule ${event.type}: ${event.ruleId}`);
  if (event.type === 'added') {
    vscode.window.showInformationMessage(`New rule added: ${event.rule?.ruleText}`);
  }
});

// Cleanup
disposable.dispose();
```

#### Utility Methods
```typescript
// Check extension capabilities
const version = api.getVersion();
const isConnected = api.isMongoConnected();

console.log(`Copilot Memory v${version}, MongoDB: ${isConnected ? 'Connected' : 'Offline'}`);
```

### Example: Team Rules Manager Extension

```typescript
import * as vscode from 'vscode';
import { getCopilotMemoryAPI } from './types/copilotMemoryAPI';

export async function activate(context: vscode.ExtensionContext) {
  const api = await getCopilotMemoryAPI();
  if (!api) {
    vscode.window.showErrorMessage('Copilot Memory is required but not installed');
    return;
  }

  // Sync team rules from your configuration
  const teamRules = await fetchTeamRulesFromAPI();
  for (const rule of teamRules) {
    await api.addRule(rule.text, rule.scope, rule.options);
  }

  // Monitor for rule changes
  api.onRuleChanged(event => {
    if (event.type === 'added') {
      reportRuleUsage(event.ruleId, event.rule?.ruleText);
    }
  });
}
```

## ⚙️ Configuration

Configure Copilot Memory in VS Code Settings (`settings.json`):

```json
{
  "copilotMemory.mongodbUri": "mongodb://localhost:27017/copilot-memory",
  "copilotMemory.fallbackToLocal": true,
  "copilotMemory.maxRulesPerScope": 100,
  "copilotMemory.enableAutoSync": false,
  "copilotMemory.syncIntervalMinutes": 30,
  "copilotMemory.logLevel": "info",
  "copilotMemory.connectionTimeoutMs": 10000,
  "copilotMemory.retryAttempts": 3
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mongodbUri` | string | `"mongodb://localhost:27017/copilot-memory"` | MongoDB connection string with authentication support |
| `fallbackToLocal` | boolean | `true` | Use local JSON storage when MongoDB is unavailable |
| `maxRulesPerScope` | number | `100` | Maximum number of rules per scope (1-1000) |
| `enableAutoSync` | boolean | `false` | Automatically sync rules between local and MongoDB |
| `syncIntervalMinutes` | number | `30` | Auto-sync interval in minutes (5-1440) |
| `logLevel` | string | `"info"` | Logging level: `"info"`, `"warn"`, or `"error"` |
| `connectionTimeoutMs` | number | `10000` | MongoDB connection timeout in milliseconds |
| `retryAttempts` | number | `3` | Number of connection retry attempts (0-10) |

### MongoDB Setup

#### Local Development
```bash
# Using Docker
docker run -d -p 27017:27017 --name copilot-memory-db mongo:7

# Using MongoDB Community Server
brew install mongodb-community
brew services start mongodb-community
```

#### Production (MongoDB Atlas)
```json
{
  "copilotMemory.mongodbUri": "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/copilot-memory?retryWrites=true&w=majority"
}
```

> ⚠️ **Security Note**: Replace `<username>`, `<password>`, and `<cluster>` with your actual MongoDB Atlas credentials. Never commit real credentials to version control!

## � How It Works

1. **Rule Storage**: Rules are stored in MongoDB (if configured) or locally in `.copilot-memory.json`
2. **Context Awareness**: Extension detects your current language and project
3. **Rule Injection**: Relevant rules are injected into Copilot's context
4. **Enhanced Suggestions**: Copilot provides suggestions that follow your rules

## 🌟 Rule Scopes

| Scope | Description | Use Case |
|-------|-------------|----------|
| **Global** | Applies everywhere | Universal coding standards |
| **Project** | Current workspace only | Project-specific conventions |
| **Language** | Specific programming language | Language-specific best practices |

## 🛣️ Roadmap

### Current (v0.1.0)
- ✅ Rule management with three scopes
- ✅ MongoDB + local JSON storage
- ✅ VS Code command integration
- ✅ Status bar indicators

### Coming Soon (v0.2.0)
- 🚧 Visual rule editor interface
- 🚧 Rule templates for popular frameworks
- � Import/export rule sets
- 🚧 Team collaboration features

### Future (v1.0.0)
- 🔮 AI-powered rule suggestions
- 🔮 Rule analytics and usage insights
- 🔮 Integration with other AI coding tools
- 🔮 Cloud synchronization service

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Acknowledgments

- GitHub Copilot team for the amazing AI coding assistant
- VS Code team for the excellent extension API
- MongoDB team for robust data storage

---

**Made with ❤️ for developers who care about code quality**

[⭐ Star this project](https://github.com/yaotsakpo/copilot-memory) | [🐛 Report Bug](https://github.com/yaotsakpo/copilot-memory/issues) | [💡 Request Feature](https://github.com/yaotsakpo/copilot-memory/issues)
