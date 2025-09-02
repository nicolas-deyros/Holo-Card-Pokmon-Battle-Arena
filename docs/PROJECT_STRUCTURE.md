# Project Structure

This document outlines the organized structure of the Pokémon Card Battle Arena project.

## Root Directory Structure

```
├── .env.local              # Environment variables (not tracked)
├── .git/                   # Git repository data
├── .github/                # GitHub workflows and templates
├── .gitignore              # Git ignore patterns
├── .husky/                 # Git hooks configuration
├── .prettierignore         # Prettier ignore patterns
├── README.md               # Project documentation
├── package.json            # Project configuration and dependencies
├── package-lock.json       # Locked dependency versions
├── index.html              # Main HTML entry point
├── metadata.json           # Project metadata
├── config/                 # Configuration files
│   ├── .prettierrc         # Prettier configuration
│   ├── .stylelintrc.json   # Stylelint configuration
│   ├── commitlint.config.js # Commitlint configuration
│   ├── eslint.config.js    # ESLint configuration
│   ├── lighthouserc.json   # Lighthouse CI configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite build configuration
│   └── vitest.config.ts    # Vitest testing configuration
├── docs/                   # Documentation files
├── public/                 # Static assets
├── src/                    # Source code
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Application entry point
│   ├── constants.ts        # Application constants
│   ├── types.ts            # TypeScript type definitions
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # External service integrations
│   ├── utils/              # Utility functions
│   └── test/               # Test files and setup
├── dist/                   # Build output (generated)
├── coverage/               # Test coverage reports (generated)
└── node_modules/           # Dependencies (generated)
```

## Configuration Organization

All configuration files have been moved to the `config/` directory for better organization:

- **ESLint**: Code linting rules and configuration
- **Prettier**: Code formatting configuration
- **Stylelint**: CSS/SCSS linting configuration
- **TypeScript**: Compilation and type checking configuration
- **Vite**: Build tool configuration for development and production
- **Vitest**: Test runner configuration
- **Commitlint**: Git commit message linting
- **Lighthouse**: Performance auditing configuration

## Source Code Organization

The `src/` directory contains all application source code:

- **components/**: Reusable React components
- **hooks/**: Custom React hooks for shared logic
- **services/**: External API integrations and services
- **utils/**: Utility functions and helpers
- **test/**: Test files and testing utilities

## Scripts and Commands

All npm scripts have been updated to reference the new configuration file locations:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run code linting
- `npm run format` - Format code with Prettier

## Benefits of This Organization

1. **Cleaner Root**: Reduced clutter in the root directory
2. **Logical Grouping**: Related configuration files are grouped together
3. **Easier Maintenance**: Configuration files are easier to find and manage
4. **Better Scalability**: Structure supports project growth
5. **Professional Standards**: Follows industry best practices
