<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Pokémon Card Battle Arena

An interactive Pokémon Card Game battle simulator with holographic effects, built with React, TypeScript, and Vite.

View your app in AI Studio: https://ai.studio/apps/drive/1itzQcNPOG8PMxIlbGtl7Uwv62zWg59D8

## ✨ Features

- Interactive Pokémon card battles with realistic effects
- Holographic card animations and visual effects
- Team selection and battle management
- Sound effects and audio feedback
- Statistics tracking and performance monitoring
- Responsive design for all devices

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and npm

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Holo-Card-Pokmon-Battle-Arena
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**
   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key: `GEMINI_API_KEY=your_api_key_here`

4. **Start development server**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## 📁 Project Structure

```
├── config/                    # All configuration files
│   ├── .prettierrc           # Code formatting rules
│   ├── .stylelintrc.json     # CSS linting rules
│   ├── commitlint.config.js  # Git commit linting
│   ├── eslint.config.js      # JavaScript/TypeScript linting
│   ├── lighthouserc.json     # Performance auditing
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Build tool configuration
│   └── vitest.config.ts      # Test runner configuration
├── docs/                     # Documentation files
├── public/                   # Static assets
├── src/                      # Source code
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API integrations
│   ├── utils/                # Utility functions
│   └── test/                 # Test files
├── .github/                  # GitHub workflows
├── .husky/                   # Git hooks
└── dist/                     # Build output (generated)
```

## 🛠️ Development

### Available Scripts

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `npm run dev`           | Start development server            |
| `npm run build`         | Build for production                |
| `npm run preview`       | Preview production build            |
| `npm run test`          | Run tests in watch mode             |
| `npm run test:run`      | Run tests once                      |
| `npm run test:coverage` | Run tests with coverage             |
| `npm run lint`          | Check code quality                  |
| `npm run lint:fix`      | Fix linting issues                  |
| `npm run format`        | Format code with Prettier           |
| `npm run type-check`    | Check TypeScript types              |
| `npm run validate`      | Run all checks (types, lint, tests) |

### Code Quality

This project includes comprehensive code quality tools:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Stylelint**: CSS/SCSS linting
- **TypeScript**: Static type checking
- **Vitest**: Fast unit testing
- **Husky**: Git hooks for quality gates
- **Commitlint**: Conventional commit messages

### Testing

Tests are located in `src/test/` and use:

- **Vitest**: Test runner
- **Testing Library**: React component testing
- **JSDoc**: Browser environment simulation

Run tests:

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Testing**: Vitest 2.1.8 with Testing Library
- **Styling**: Tailwind CSS with custom animations
- **Code Quality**: ESLint, Prettier, Stylelint
- **Git Workflow**: Husky hooks with Commitlint

### Key Components

- **App.tsx**: Main application component
- **PokemonCard.tsx**: Interactive card component
- **Battlefield.tsx**: Battle simulation arena
- **TeamSelection.tsx**: Pokémon team management
- **AutocompleteSearch.tsx**: Search functionality

### Services & Utils

- **pokeapi.ts**: Pokémon data API integration
- **soundManager.ts**: Audio effects management
- **statsManager.ts**: Battle statistics tracking
- **performance.ts**: Performance monitoring

## 🔧 Configuration

All configuration files are organized in the `config/` directory for better maintainability:

- **ESLint**: Modern JavaScript/TypeScript linting with React support
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking with path aliases
- **Vite**: Optimized build configuration with React plugin
- **Vitest**: Comprehensive testing setup with coverage

## 📚 Documentation

- [Project Structure](docs/PROJECT_STRUCTURE.md) - Detailed project organization
- [Component Documentation](docs/components/) - Component API reference
- [Contributing Guidelines](CONTRIBUTING.md) - Development guidelines

## 🚀 Deployment

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Lighthouse Auditing

Performance is continuously monitored with Lighthouse CI:

```bash
npm run build
npx lhci autorun
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our code quality standards
4. Run tests: `npm run validate`
5. Commit using conventional commits: `git commit -m "feat: add amazing feature"`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Pokémon data provided by [PokéAPI](https://pokeapi.co/)
- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
