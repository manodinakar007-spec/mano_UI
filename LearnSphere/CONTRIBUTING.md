# Contributing to Skillfyme Platform

We welcome contributions from the community! Here's how to get started.

## Development Setup

See [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for full setup instructions.

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feat/*` | Feature development |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, deps, config |
| `docs/*` | Documentation only |

## Pull Request Process

1. Create a branch from `develop`: `git checkout -b feat/your-feature`
2. Make your changes with appropriate tests
3. Ensure CI passes: `yarn test && yarn lint`
4. Open a PR against `develop` with a clear description
5. Require at least 1 reviewer approval
6. Squash merge when approved

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add assessment retry logic
fix: resolve Redis connection pool leak
docs: update enrollment API specification
chore: upgrade mongoose to 8.0.3
```

## Code Standards

- **Node.js**: ES modules, Pino logging, Zod validation, parameterized SQL
- **Python**: Type hints required, async SQLAlchemy, Pydantic v2
- **Go**: zerolog, parameterized SQL, no global mutable state

## Security

Report vulnerabilities privately to security@skillfyme.com. Do not open public issues for security bugs.

## License

Apache 2.0 — see [LICENSE](LICENSE).
