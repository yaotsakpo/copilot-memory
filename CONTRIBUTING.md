# Contributing to Copilot Memory

We love your input! We want to make contributing to Copilot Memory as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Quick Start for Contributors

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/YOUR_USERNAME/copilot-memory.git`
3. **Install dependencies**: `npm install`
4. **Make your changes**
5. **Test your changes**: `npm run compile && F5 in VS Code`
6. **Submit a pull request**

## 📋 Development Setup

### Prerequisites
- Node.js 16+ 
- VS Code
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/yaotsakpo/copilot-memory.git
cd copilot-memory

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Start development mode
npm run watch
```

### Testing Your Changes
1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test your changes in the new VS Code window
4. Make sure existing functionality still works

## 🐛 Bug Reports

Great bug reports tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Feature Requests

We use GitHub issues to track feature requests. Please:

1. **Check existing issues** first to avoid duplicates
2. **Describe the feature** you'd like to see
3. **Explain why** it would be useful
4. **Provide examples** if possible

## 🔧 Code Contributions

### Code Style
- We use ESLint for code quality
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic

### Pull Request Process
1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes** with clear, atomic commits
3. **Update documentation** if needed
4. **Test thoroughly** 
5. **Update CHANGELOG.md** with your changes
6. **Submit a pull request** with a clear description

### Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## 📚 Areas We Need Help

### High Priority
- 🎨 **UI/UX improvements** for rule management
- 🧪 **Unit tests** for core functionality
- 📖 **Documentation** improvements
- 🐛 **Bug fixes** and stability improvements

### Medium Priority
- 🚀 **Performance optimizations**
- 🌐 **Internationalization** (i18n)
- 📦 **Rule templates** for popular frameworks
- 🔄 **Import/export** functionality

### Future Features
- 🤖 **AI-powered rule suggestions**
- 📊 **Analytics and insights**
- 👥 **Team collaboration** features
- ☁️ **Cloud synchronization**

## 🏗️ Project Structure

```
copilot-memory/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── ruleManager.ts         # Rule CRUD operations  
│   ├── copilotInterceptor.ts  # Copilot integration
│   └── models/
│       └── rule.ts           # Rule data model
├── .vscode/                  # VS Code configuration
├── package.json              # Extension manifest
└── README.md                 # Documentation
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Extension activates without errors
- [ ] Can add rules with all three scopes
- [ ] Can list and view existing rules
- [ ] Can remove rules
- [ ] Rules persist between VS Code sessions
- [ ] Status bar shows correct rule count
- [ ] MongoDB fallback to local storage works

### Before Submitting
- [ ] Code compiles without errors (`npm run compile`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Extension loads and works in development mode
- [ ] No console errors in Extension Development Host

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Community

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

## 🙏 Recognition

Contributors will be:
- Listed in our CHANGELOG.md
- Mentioned in release notes
- Added to a future CONTRIBUTORS.md file

Thank you for making Copilot Memory better! 🎉
