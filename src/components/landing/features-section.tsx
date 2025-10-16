import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Zap, 
  Database, 
  Palette, 
  Code, 
  Lock,
  Smartphone,
  Layers
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'NextAuth.js',
    description: 'Complete authentication system with multiple providers and session management.',
    badge: 'Security',
  },
  {
    icon: Database,
    title: 'Prisma + SQLite',
    description: 'Type-safe database access with easy migration to PostgreSQL or MySQL.',
    badge: 'Database',
  },
  {
    icon: Zap,
    title: 'tRPC',
    description: 'End-to-end type safety for your APIs with automatic client generation.',
    badge: 'API',
  },
  {
    icon: Palette,
    title: 'shadcn/ui',
    description: 'Beautiful, accessible components built with Radix UI and Tailwind CSS.',
    badge: 'UI',
  },
  {
    icon: Code,
    title: 'TypeScript',
    description: 'Full type safety across your entire application with strict configuration.',
    badge: 'Type Safety',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Responsive design that works perfectly on all devices and screen sizes.',
    badge: 'Responsive',
  },
  {
    icon: Lock,
    title: 'Protected Routes',
    description: 'Middleware-based route protection with role-based access control.',
    badge: 'Security',
  },
  {
    icon: Layers,
    title: 'State Management',
    description: 'React Query for server state and Zustand for client state management.',
    badge: 'State',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to build
          </h2>
          <p className="mb-12 text-lg text-muted-foreground">
            A complete toolkit for modern web applications with best practices built-in.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {feature.badge}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
