# Quick Reference Guide

## 🚀 Quick Start

### First Time Setup
```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## 📁 Project Structure at a Glance

```
app/                           # Next.js App Router
├── page.tsx                   # Landing page (/)
├── dashboard/page.tsx         # Dashboard (/dashboard)
└── login/page.tsx             # Login (/login)

components/
├── ui/                        # Reusable UI components
├── dashboard/                 # Dashboard-specific widgets
└── dashboard-layout.tsx       # Main layout wrapper

lib/                           # Utilities
hooks/                         # Custom React hooks
styles/                        # Global styles
public/                        # Static assets
```

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server (http://localhost:3000) |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm lint` | Check code for issues |
| `git log --oneline` | View commit history |

## 📝 Code Standards

### File Naming
- Components: `PascalCase` (e.g., `DashboardLayout.tsx`)
- Utils: `camelCase` (e.g., `dateUtils.ts`)
- Types: `PascalCase` suffix with `Type` (e.g., `UserType.ts`)

### Component Template
```typescript
/**
 * ComponentName
 * 
 * Brief description of what the component does.
 * 
 * @example
 * <ComponentName prop="value" />
 */

"use client"

import { useState } from "react"

export function ComponentName() {
  return <div>Component</div>
}
```

### Styling
- Use Tailwind CSS classes
- Avoid inline styles
- Use `cn()` utility for conditional classes:
```typescript
import { cn } from "@/lib/utils"

<div className={cn("base-styles", isActive && "active-styles")} />
```

## 🎨 UI Components

All UI components are in `/components/ui/` using Radix UI primitives.

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
```

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` for development:
```bash
cp .env.example .env.local
```

## 🐛 Debugging

### Browser DevTools
- Open DevTools: `F12` or `Cmd+Option+I` (Mac)
- Use React DevTools extension for component debugging

### Next.js Debug Mode
Add `NODE_OPTIONS='--inspect'` before running dev:
```bash
NODE_OPTIONS='--inspect' pnpm dev
```

## 📚 Documentation Files

- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CHANGELOG.md](./CHANGELOG.md) - Version history

## 🔗 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Radix UI](https://www.radix-ui.com)

## 💡 Tips

- Use `console.log()` for debugging during development
- Use React DevTools for component inspection
- Hot reload works automatically - just save files
- Restart dev server if dependencies change

## ❓ Need Help?

1. Check existing documentation
2. Search project for similar patterns
3. Open an issue on GitHub
4. Check the [Discussions](../../discussions) section

---

**Happy coding!** 🚀
