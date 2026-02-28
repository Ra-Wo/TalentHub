# Copilot Instructions for TalentHub

## Project structure policy

When creating new files, prefer this structure:

```text
src/
  app/                # Next.js App Router (routes, layouts, pages)
  components/
    ui/               # Generic UI (Button, Input, Modal)
    icons/            # SVG icons as React components
    layout/           # Header, Footer, Sidebar
    feature/          # Feature-specific (AuthForm, DashboardCard)
  hooks/              # useAuth, useFetch, useTheme
  lib/                # api.ts, utils.ts, constants.ts
  styles/             # globals.css, tailwind.config.ts
  context/            # React context providers (AuthContext, ThemeContext)
  services/           # External services (Firebase, Supabase, Stripe)
```

## Rules to follow

1. Place all new route files in `src/app`.
2. Put reusable primitives in `src/components/ui`.
3. Put layout components (header/footer/sidebar) in `src/components/layout`.
4. Put feature-scoped UI in `src/components/feature`.
5. Put reusable hooks in `src/hooks`.
6. Put shared helpers and constants in `src/lib`.
7. Keep global styling assets in `src/styles`.
8. Put React providers/contexts in `src/context`.
9. Put third-party integration code in `src/services`.
10. Avoid adding new top-level folders for app code outside `src`.
