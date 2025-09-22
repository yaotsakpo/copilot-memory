# Changelog

All notable changes to the "Copilot Memory" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated publishing pipeline with GitHub Actions
- Continuous Integration (CI) with multi-OS testing
- Automated version bumping and release scripts
- Security scanning and code quality checks
- GitHub Releases with .vsix attachments

### Documentation
- Complete automation setup guide (AUTOMATION.md)
- Professional CI/CD workflow documentation

## [0.0.1] - 2025-09-22

### Added
- Initial release of Copilot Memory extension
- VS Code extension scaffold with TypeScript
- Rule management system with MongoDB and local file fallback
- Three main commands:
  - `copilotMemory.addRule` - Add new coding rules
  - `copilotMemory.listRules` - View and manage existing rules
  - `copilotMemory.removeRule` - Delete specific rules
- Rule scopes: global, project, and language-specific
- Mongoose schema for MongoDB integration
- Simplified Copilot interceptor with completion provider
- Status bar integration showing active rule count
- Configuration options for MongoDB URI and local fallback
- Complete documentation and deployment guides
- MIT License

### Technical Details
- Built with Node.js and TypeScript
- Uses Mongoose for MongoDB integration
- Includes ESLint for code quality
- Supports both MongoDB and local JSON storage
- VS Code Extension API integration
- Comprehensive build and debug configuration

[Unreleased]: https://github.com/yaotsakpo/copilot-memory/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/yaotsakpo/copilot-memory/releases/tag/v0.0.1
