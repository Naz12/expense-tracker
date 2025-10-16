# Next.js Full-Stack Template

A production-ready Next.js template with TypeScript, TailwindCSS, shadcn/ui, NextAuth.js, Prisma, tRPC, and more. This template provides everything you need to build modern web applications quickly and efficiently.

## 🚀 Features

- **Next.js 14+** with App Router and TypeScript
- **TailwindCSS** for styling with **shadcn/ui** components
- **NextAuth.js** for authentication with multiple providers
- **Prisma** with SQLite (easily switchable to PostgreSQL/MySQL)
- **tRPC** for type-safe APIs
- **React Query** for server state management
- **Zustand** for client state management
- **Collapsible sidebar** layout with mobile-first design
- **Theme support** (light/dark/system)
- **Protected routes** with middleware
- **Form validation** with Zod
- **ESLint & Prettier** for code quality
- **Mobile-first responsive design**

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth routes group
│   │   ├── (protected)/     # Protected routes group
│   │   ├── api/             # API routes
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── layout/          # Layout components
│   │   ├── landing/         # Landing page components
│   │   └── providers/       # React providers
│   ├── lib/
│   │   ├── auth.ts          # NextAuth config
│   │   ├── db.ts            # Prisma client
│   │   ├── trpc.ts          # tRPC client
│   │   └── utils.ts         # Utilities
│   ├── server/
│   │   ├── trpc.ts          # tRPC setup
│   │   └── routers/         # tRPC routers
│   └── store/               # Zustand stores
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
└── public/                  # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the template:**
   ```bash
   git clone <your-repo-url>
   cd nextjs-fullstack-template
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your values:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:generate
   npm run db:seed
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed the database
- `npm run type-check` - Run TypeScript type checking

## 🔐 Authentication

The template includes NextAuth.js with support for:

- **Credentials** (email/password)
- **Google OAuth**
- **GitHub OAuth**

### Adding OAuth Providers

1. Get your OAuth credentials from the provider
2. Add them to your `.env` file:
   ```env
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   ```

### Protected Routes

Routes in the `(protected)` folder are automatically protected by middleware. Add new protected routes by creating them in this folder.

## 🗄️ Database

The template uses Prisma with SQLite by default. To switch to PostgreSQL or MySQL:

1. Update your `DATABASE_URL` in `.env`
2. Change the provider in `prisma/schema.prisma`
3. Run `npm run db:push`

### Adding New Models

1. Add your model to `prisma/schema.prisma`
2. Run `npm run db:push`
3. Run `npm run db:generate`

## 🎨 UI Components

The template uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Customizing the Theme

Edit `src/app/globals.css` to customize the design system colors and variables.

## 🔌 API Development

### tRPC Procedures

Add new procedures in `src/server/routers/`:

```typescript
// src/server/routers/example.ts
export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { message: `Hello ${input.name}!` }
    }),
})
```

### Standard API Routes

Create standard Next.js API routes in `src/app/api/`:

```typescript
// src/app/api/example/route.ts
export async function GET() {
  return NextResponse.json({ message: 'Hello World' })
}
```

## 📱 Mobile-First Design

The template is built with mobile-first principles:

- Responsive navigation with collapsible sidebar
- Touch-friendly interface elements
- Optimized for all screen sizes
- Progressive enhancement

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The template works with any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Prisma](https://prisma.io/) - Database toolkit
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](https://nextjs.org/docs)
2. Search existing [issues](https://github.com/your-repo/issues)
3. Create a new issue if needed

---

**Happy coding! 🎉**