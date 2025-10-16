import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full border bg-background/50 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Production Ready Template
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-6xl">
            Next.js Full-Stack
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Template
            </span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl lg:text-2xl">
            A complete, production-ready Next.js template with TypeScript, TailwindCSS, 
            shadcn/ui, NextAuth.js, Prisma, tRPC, and more. Start building faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/signin">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="#features">
                Learn More
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">14+</div>
              <div className="text-sm text-muted-foreground">Next.js Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">100%</div>
              <div className="text-sm text-muted-foreground">TypeScript</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">0</div>
              <div className="text-sm text-muted-foreground">Config Needed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary sm:text-3xl">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
