# Contributing to LogiFlow

Thank you for your interest in contributing to LogiFlow! We welcome all contributions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/logiflow-ai-inventory.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Start development: `pnpm dev`

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Components
- Create reusable, single-responsibility components
- Use Tailwind CSS for styling
- Follow the component structure in `/components`

### Git Workflow
1. Make changes to your feature branch
2. Test thoroughly: `pnpm lint`
3. Commit with clear messages: `git commit -m "feat: add new feature description"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Create a Pull Request with a description of changes

## Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, etc.

Example:
```
feat: add anomaly detection alerts

Add real-time anomaly detection for inventory patterns
and send alerts to users when unusual activity is detected.

Closes #123
```

## Code Review

All submissions require review. Please:
- Be responsive to review feedback
- Keep discussions professional and constructive
- Update your PR based on feedback

## Questions?

Create an issue or reach out to the maintainers.

Thank you for contributing! 🙏
