# Copilot Memory

A personalization layer that adds persistent rules and preferences on top of GitHub Copilot.

## 🛠 Tech Stack

- **Node.js with TypeScript** for the VS Code extension
- **MongoDB with Mongoose** for persistence (local MongoDB with cloud Atlas migration support)
- **VS Code Extension API** for integration

## 🎯 Project Goal

Build a VS Code extension that intercepts Copilot requests and injects custom rules before sending to Copilot. Rules are stored in MongoDB with support for different scopes (global, project, language-specific).

## 📦 Features

### MVP Features
1. ✅ VS Code extension scaffold (Node.js, TypeScript)
2. ✅ MongoDB schema for rules with scopes (global, project, language)
3. ✅ Rule management system with MongoDB and local file fallback
4. ✅ VS Code commands:
   - `CopilotMemory.addRule` - Add a new rule
   - `CopilotMemory.listRules` - List and manage existing rules
   - `CopilotMemory.removeRule` - Remove a rule
5. ✅ Fallback to local `.copilot-memory.json` if MongoDB is unavailable

### Rule Schema
```typescript
interface Rule {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;    // for language-specific rules
    projectPath?: string;      // for project-specific rules
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
```

## 🚀 Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Open in VS Code and press `F5` to run the extension in a new Extension Development Host window

## ⚙️ Configuration

Configure the extension in VS Code settings:

- `copilotMemory.mongodbUri`: MongoDB connection URI (default: `mongodb://localhost:27017/copilot-memory`)
- `copilotMemory.fallbackToLocal`: Use local `.copilot-memory.json` if MongoDB is unavailable (default: `true`)

## 📝 Usage

### Adding Rules

1. Open the Command Palette (`Cmd+Shift+P`)
2. Run `Copilot Memory: Add Rule`
3. Enter your rule text (e.g., "Always use const instead of let for variables that are not reassigned")
4. Select the scope:
   - **Global**: Applies to all projects and languages
   - **Project**: Applies only to the current workspace
   - **Language**: Applies only to files of a specific language

### Managing Rules

- **List Rules**: `Copilot Memory: List Rules` - View all rules and optionally delete them
- **Remove Rule**: `Copilot Memory: Remove Rule` - Select and remove a specific rule

### Rule Examples

- **Global**: "Always include error handling for async operations"
- **Project**: "Use the custom Logger class instead of console.log"
- **Language** (TypeScript): "Prefer interfaces over type aliases for object shapes"

## 🔧 Development

### Project Structure
```
src/
├── extension.ts           # Main extension entry point
├── ruleManager.ts         # Rule CRUD operations and storage
├── copilotInterceptor.ts  # Copilot integration (simplified)
└── models/
    └── rule.ts           # Mongoose schema for rules
```

### Build and Test
```bash
# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Run linting
npm run lint

# Package extension
vsce package
```

## 📅 Roadmap

- **Week 1**: ✅ Scaffold VS Code extension and MongoDB connection
- **Week 2**: ✅ Implement schema, CRUD for rules, and local cache fallback
- **Week 3**: 🔄 Integrate rule injection into Copilot completions
- **Week 4**: Package extension, write docs, and prepare for open-source release

## 🔮 Future Enhancements

- **Cloud Sync**: Sync rules across devices using MongoDB Atlas
- **Rule Templates**: Pre-built rule sets for popular frameworks
- **Smart Suggestions**: AI-powered rule suggestions based on code patterns
- **Team Rules**: Share rules across team members
- **Rule Analytics**: Track rule usage and effectiveness

## 🤝 Contributing

This project is in active development. Contributions are welcome!

## 📄 License

MIT License - see LICENSE file for details
