# Environment Variables

Create a `.env.local` file in the root directory for development:

```env
# API Configuration (when backend is implemented)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Development Environment Setup

### Required

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher

### Installation Steps

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Architecture Notes

### Project Structure

- **app/** - Next.js App Router pages (Server & Client Components)
- **components/** - Reusable React components
  - **ui/** - Base UI components (buttons, cards, dialogs, etc.)
  - **dashboard/** - Dashboard-specific widgets
- **hooks/** - Custom React hooks
- **lib/** - Utility functions and helpers
- **public/** - Static assets (images, icons)
- **styles/** - Global CSS styles

### Key Design Patterns

1. **Component Composition** - UI built from small, reusable components
2. **Type Safety** - Full TypeScript for development safety
3. **Responsive Design** - Mobile-first approach with Tailwind CSS
4. **State Management** - React hooks (useState, useCallback, etc.)
5. **Animation** - Framer Motion for smooth transitions

### Database & Backend

Currently uses mock data. Production implementation would include:
- Backend API (Node.js/Python/Go)
- PostgreSQL or MongoDB
- Authentication system
- Real-time data synchronization

---

Questions? Create an issue or check the README.md for more details.
