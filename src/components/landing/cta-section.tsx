import { Button } from '@/components/ui/button'
import { ArrowRight, Github, Star } from 'lucide-react'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 p-8 sm:p-12 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Ready to start building?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Clone this template and start building your next great application in minutes, not hours.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/auth/signin">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div>•</div>
              <div>Used by 1000+ developers</div>
              <div>•</div>
              <div>MIT License</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
