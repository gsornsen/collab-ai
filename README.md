# Notion Clone

A fullstack Notion clone built with Next.js, React, Tailwind, Clerk, Convex, Edge Store, and BlockNote.

## Features

* 🔐 Authentication using Clerk
* 📊 Real-time backend and database powered by Convex.dev
* 🖼️ Upload images using Edge Store
* 📝 Create and edit notes using BlockNote editor
* 🙂 Emojis using Emoji Picker React
* 🌲 Create hierarchies of notes
* 🗑️ Archive, restore, and delete notes
* 📢 Publish notes to share with others
* ⬅️ Adjustable sidebar
* ✨ Responsive UI and light/dark mode built with Tailwind and shadcn/ui

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Setup .env file

```env
CONVEX_DEPLOYMENT=

NEXT_PUBLIC_CONVEX_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

EDGE_STORE_ACCESS_KEY=
EDGE_STORE_SECRET_KEY=
```

### Start Convex

```bash
npx convex dev
```

### Start the app

```bash
pnpm run dev
```

### Credit

Created by using [notion-clone](https://github.com/sgbj/notion-clone) as initial base
