import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar,
  Shield, 
  Smartphone,
  TrendingUp,
  CreditCard
} from 'lucide-react'

const features = [
  {
    icon: DollarSign,
    title: 'Expense Tracking',
    description: 'Easily record and categorize your daily expenses with our intuitive interface.',
    badge: 'Core Feature',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Visualize your spending patterns with detailed charts and monthly reports.',
    badge: 'Insights',
  },
  {
    icon: PieChart,
    title: 'Category Breakdown',
    description: 'See exactly where your money goes with detailed category analysis.',
    badge: 'Analysis',
  },
  {
    icon: Calendar,
    title: 'Monthly Trends',
    description: 'Track your financial progress over time with monthly trend analysis.',
    badge: 'Trends',
  },
  {
    icon: CreditCard,
    title: 'Income Tracking',
    description: 'Record your income sources and track your total earnings alongside expenses.',
    badge: 'Income',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Access your financial data anywhere with our mobile-optimized interface.',
    badge: 'Mobile',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your financial data is protected with enterprise-grade security measures.',
    badge: 'Security',
  },
  {
    icon: TrendingUp,
    title: 'Budget Insights',
    description: 'Get actionable insights to help you save more and spend smarter.',
    badge: 'Smart',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to manage your finances
          </h2>
          <p className="mb-12 text-lg text-muted-foreground">
            Powerful features designed to help you take control of your spending and achieve your financial goals.
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
