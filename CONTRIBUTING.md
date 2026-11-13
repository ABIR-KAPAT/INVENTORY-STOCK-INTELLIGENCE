# Contributing to StockWise

First off, thank you for considering contributing to **StockWise**! It is contributions from developers like you that make open-source software incredible.

---

## Code of Conduct

This project and everyone participating in it is governed by the [StockWise Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Steps

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/stockwise-inventory-intelligence.git
   cd stockwise-inventory-intelligence
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Verify the production build:**
   ```bash
   npm run build
   ```

---

## How to Contribute

### 1. Reporting Bugs

Before submitting a bug report:
- Search existing issues to ensure the bug has not already been reported.
- Verify that the issue reproduces on the latest `main` branch.

When opening an issue:
- Use the **Bug Report** template.
- Provide a clear title and description.
- Include reproduction steps and expected vs. actual behavior.
- Attach browser console logs or screenshots where relevant.

### 2. Suggesting Enhancements

Feature requests are very welcome:
- Use the **Feature Request** template.
- Clearly describe the problem your feature solves.
- Explain the proposed solution or design.

### 3. Submitting Pull Requests

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Commit guidelines:**
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add warehouse transfer confirmation modal`
   - `fix: resolve negative balance constraint in sales dispatch`
   - `docs: update API integration instructions in README`
   - `refactor: optimize movement ledger filter selectors`
   - `style: adjust topbar breadcrumb padding`

3. **Code style & quality:**
   - Keep components modular and reusable under `src/components/common/` or module-specific folders.
   - Use Redux Toolkit actions and centralized selectors (`src/store/slices/`).
   - Run linter and verify build passes:
     ```bash
     npm run lint
     npm run build
     ```

4. **Open a Pull Request:**
   - Fill out the PR template completely.
   - Link any related issue numbers (e.g., `Closes #42`).
   - Request review and address feedback promptly.

---

## Architecture Guidelines

- **Zero Backend Assumption**: StockWise runs 100% in the client browser. Do not introduce mandatory server dependencies.
- **Atomic State Updates**: All inventory increments, decrements, and transfers must maintain ledger integrity atomically within Redux.
- **Persistence**: Any state addition that needs to persist across reloads must be supported by the Redux persistence layer (`src/store/persistence.js`).

Thank you for building with us!
