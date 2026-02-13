# Contributing to Ulevha Database Management System

Thank you for your interest in contributing to the Ulevha Database Management System! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Treat all contributors with dignity
- Report inappropriate behavior to the maintainers

## Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/[your-username]/ulevha.git
   cd ulevha
   ```

2. **Set Up Development Environment**
   ```bash
   npm install
   npm run dev
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b bugfix/issue-description
   ```

## Development Workflow

### Before You Start
- Check existing issues and pull requests to avoid duplicates
- For major features, open an issue first to discuss implementation

### Code Standards

- Follow the existing code style
- Use meaningful variable and function names
- Write clean, readable code
- Add comments for complex logic

### Commit Messages

Write clear, descriptive commit messages:
```
feat: add age distribution chart
fix: resolve login validation error
docs: update installation instructions
refactor: simplify user role logic
```

Use prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `style:` - Code style changes

## Making Changes

### For Frontend Changes
1. Update components in `src/components/`
2. Test with `npm run dev`
3. Verify styling with Tailwind CSS is applied correctly

### For Database Changes
1. Document schema changes
2. Provide migration instructions
3. Test with SQLite locally

### For Backend Changes
1. Update Node.js server code
2. Test API endpoints
3. Verify database interactions

## Testing

```bash
# Run linting
npm run lint

# Run linting with fix
npm run lint -- --fix
```

## Submitting a Pull Request

1. **Push Your Changes**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request**
   - Title: Clear description of changes
   - Description: Explain what and why
   - Link related issues (e.g., "Closes #123")
   - Include screenshots for UI changes

3. **Pull Request Checklist**
   - [ ] Code follows project style guidelines
   - [ ] All tests pass locally
   - [ ] No console errors or warnings
   - [ ] Documentation is updated
   - [ ] Commit messages are clear

4. **Review Process**
   - At least one maintainer review required
   - Address feedback promptly
   - Update PR based on comments

## Reporting Issues

### Bug Reports
Include:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- System information (OS, Node version, etc.)

### Feature Requests
Include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Examples from similar applications

## Project Structure Guidelines

When adding new features:
- React components go in `src/components/`
- Page components go in `src/pages/`
- Styles use Tailwind CSS
- Keep components small and focused
- Use descriptive file names

## Questions?

- Check existing documentation
- Review closed issues and PRs
- Open a discussion issue
- Contact maintainers

## Recognition

Contributors will be recognized in the project's CONTRIBUTORS.md file.

Thank you for contributing to Ulevha! 🎉
