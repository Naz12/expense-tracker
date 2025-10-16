import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Calendar } from 'lucide-react'

export default function UsersPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage your application users
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demo User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">demo@example.com</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Created today
                </span>
              </div>
              <Badge variant="secondary" className="mt-2">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              This is a protected route that requires authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              In a real application, you would implement:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground space-y-1">
              <li>• User listing with pagination</li>
              <li>• User creation and editing</li>
              <li>• Role-based permissions</li>
              <li>• User search and filtering</li>
              <li>• Bulk operations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
