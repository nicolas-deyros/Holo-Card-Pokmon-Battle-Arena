# Development Guide

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services and external integrations
│   ├── utils/              # Utility functions and classes
│   ├── test/               # Test files and test utilities
│   ├── types.ts            # TypeScript type definitions
│   └── constants.ts        # Application constants
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions CI/CD
├── .husky/                # Git hooks
└── docs/                  # Documentation
```

## Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Holo-Card-Pokmon-Battle-Arena
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run lint:css` - Run Stylelint
- `npm run lint:css:fix` - Fix Stylelint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Testing

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

### Git Hooks

- `npm run pre-commit` - Run lint-staged (triggered by husky)
- `npm run validate` - Run full validation (type-check + lint + test)

## Code Style Guidelines

### TypeScript

- Use strict TypeScript settings
- Prefer `interface` over `type` for object shapes
- Use proper return types for functions
- Avoid `any` - use proper typing

### React

- Use functional components with hooks
- Follow React hooks rules
- Use proper dependency arrays in useEffect
- Prefer custom hooks for reusable logic

### Naming Conventions

- Components: PascalCase (`PokemonCard`)
- Files: camelCase for utilities, PascalCase for components
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- CSS classes: kebab-case (via Tailwind)

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new Pokemon search functionality
fix: resolve battle calculation bug
docs: update API documentation
style: format code with prettier
refactor: extract common battle logic
test: add tests for Pokemon service
chore: update dependencies
```

## Testing Strategy

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Focus on business logic and edge cases

### Integration Tests

- Test component interactions
- Test API integrations
- Test user workflows

### Coverage Goals

- Minimum 60% coverage for all metrics
- 80%+ coverage for critical business logic
- 90%+ coverage for utility functions

## Performance Guidelines

### Bundle Size

- Keep bundle size under 1MB
- Use code splitting for routes
- Lazy load non-critical components

### Runtime Performance

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid inline object/function creation in render

### Monitoring

- Use the built-in performance monitoring utilities
- Monitor FPS during animations
- Track API response times

## API Integration

### PokéAPI

- All API calls go through the `services/pokeapi.ts` service
- Implement proper error handling and retries
- Cache responses to reduce API calls
- Respect rate limits

### Error Handling

- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors for debugging
- Implement fallback UI states

## Deployment

### GitHub Actions

The CI/CD pipeline automatically:

1. Runs tests and linting
2. Builds the application
3. Deploys to GitHub Pages (on main branch)
4. Runs Lighthouse performance audits

### Manual Deployment

```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## Troubleshooting

### Common Issues

1. **Node version compatibility**
   - Use Node.js 18.x or 20.x
   - Use `npm ci` instead of `npm install` for consistent installs

2. **TypeScript errors**
   - Run `npm run type-check` to see all type errors
   - Update type definitions if needed

3. **Test failures**
   - Check test setup and mocks
   - Ensure all async operations are properly awaited

4. **Build failures**
   - Check for TypeScript errors
   - Verify all imports are correct
   - Ensure environment variables are set

### Getting Help

- Check the issue tracker
- Review existing documentation
- Ask in team discussions
