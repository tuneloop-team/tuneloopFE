# 📐 Architecture Decision Records

## ADR-001: Monorepo Structure

**Date:** 2026-02-22
**Status:** Accepted

### Context
We need a project structure that supports both frontend and backend development within a single repository while maintaining clear boundaries.

### Decision
Use a simple monorepo with `client/` and `server/` directories, each with their own `package.json`, managed via root-level npm scripts with `concurrently`.

### Consequences
- Single repo for the whole team
- Easy to set up CI/CD
- Clear separation of concerns
- Shared `.gitignore` and docs

---

## ADR-002: TypeScript Strict Mode

**Date:** 2026-02-22
**Status:** Accepted

### Context
Code quality and type safety are important for a team project.

### Decision
Enable `strict: true` in both client and server `tsconfig.json`.

### Consequences
- Catches bugs at compile time
- Better IDE support
- Slightly steeper learning curve for beginners
