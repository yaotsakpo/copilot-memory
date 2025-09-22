# 🧠 Copilot Memory

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/copilot-memory.copilot-memory)](https://marketplace.visualstudio.com/items?itemName=copilot-memory.copilot-memory)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/copilot-memory.copilot-memory)](https://marketplace.visualstudio.com/items?itemName=copilot-memory.copilot-memory)
[![GitHub Stars](https://img.shields.io/github/stars/yaotsakpo/copilot-memory)](https://github.com/yaotsakpo/copilot-memory)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Train GitHub Copilot to remember your coding preferences!** 

Copilot Memory is a VS Code extension that adds a personalization layer to GitHub Copilot, allowing you to define persistent coding rules that enhance AI suggestions according to your standards and preferences.

![Copilot Memory Demo](https://raw.githubusercontent.com/yaotsakpo/copilot-memory/main/assets/demo.gif)

## 🚀 Why Copilot Memory?

- 🎯 **Consistent Code Style**: Ensure Copilot suggestions match your coding standards
- 🌐 **Global & Context-Aware Rules**: Apply rules globally, per-project, or per-language
- 💾 **Persistent Memory**: Your preferences are saved and applied across all sessions
- 🔄 **Smart Storage**: Cloud-ready with MongoDB support + local JSON fallback
- ⚡ **Zero Configuration**: Works out of the box with sensible defaults

## 📦 Installation

### From VS Code Marketplace (Recommended)

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

| Command | Description |
|---------|-------------|
| `Copilot Memory: Add Rule` | Create a new coding rule |
| `Copilot Memory: List Rules` | View and manage existing rules |
| `Copilot Memory: Remove Rule` | Delete a specific rule |

## ⚙️ Configuration

Configure Copilot Memory in VS Code Settings:

```json
{
  "copilotMemory.mongodbUri": "mongodb://localhost:27017/copilot-memory",
  "copilotMemory.fallbackToLocal": true
}
```

### Settings

- **`copilotMemory.mongodbUri`**: MongoDB connection string (optional)
- **`copilotMemory.fallbackToLocal`**: Use local storage if MongoDB unavailable (default: `true`)

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
