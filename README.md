# Neuropave

Neuropave is an intelligent infrastructure monitoring dashboard built with Next.js and modern React tooling. It provides real-time sensor visualizations, alerts, analytics, and predictive insights for road and bridge health.

## Quick Start

1. Open a terminal and navigate to the app folder:

```bash
cd Neuropave
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open your browser at:

```text
http://localhost:3000
```

## Available Scripts

From the `Neuropave/` directory:

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the production bundle
- `npm run start` - Run the production server after build
- `npm run lint` - Run ESLint across the codebase

## Project Structure

- `Neuropave/app/` - Next.js App Router pages and routes
- `Neuropave/components/` - Shared UI components and dashboard widgets
- `Neuropave/lib/` - Mock data generation and utility functions
- `Neuropave/public/` - Static assets
- `Neuropave/styles/` - Global styles
- `Neuropave/app/api/` - API route implementations used by the dashboard

## Notes

- The application uses Next.js 16.2.0 with Turbopack.
- The main app lives under `Neuropave/`, so run scripts from that directory.
- If you see a `turbopack.root` warning, it is often caused by multiple lockfiles in the repository root. The app should still run normally from `Neuropave/`.

## Dependencies

Key libraries used in this project:

- `next`, `react`, `react-dom`
- `tailwindcss`, `@tailwindcss/postcss`
- `recharts`, `leaflet`, `react-leaflet`
- `lucide-react`, `@radix-ui/react-*`
- `zod`, `react-hook-form`

## License

This repository does not include a license file. Add one if you want to publish or share the project publicly.

