import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from '@/store/appStore';
import { useAuth, canAccess, ROLE_HOME, UserRole } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { CampaignsPage } from '@/pages/CampaignsPage';
import { ImportPage } from '@/pages/ImportPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { TasksPage } from '@/pages/TasksPage';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';

const queryClient = new QueryClient();

// Redirects unauthenticated users to login
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}

// Checks role permission for a given path; shows AccessDenied if blocked
function RoleGuard({ path, children }: { path: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (!canAccess(user.role as UserRole, path)) {
    return (
      <DashboardLayout>
        <AccessDeniedPage />
      </DashboardLayout>
    );
  }
  return <>{children}</>;
}

// Combined guard: auth + role
function ProtectedRoute({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard path={path}>
        <DashboardLayout>{children}</DashboardLayout>
      </RoleGuard>
    </AuthGuard>
  );
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  const home = ROLE_HOME[(user!.role as UserRole)] ?? '/dashboard';
  return <Redirect to={home} />;
}

function AppRoutes() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Switch key={location}>
        {/* Public routes */}
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />

        {/* Protected routes — role guards enforce access per role */}
        <Route path="/dashboard">
          <ProtectedRoute path="/dashboard"><DashboardPage /></ProtectedRoute>
        </Route>

        <Route path="/leads">
          <ProtectedRoute path="/leads"><LeadsPage /></ProtectedRoute>
        </Route>

        <Route path="/agents">
          <ProtectedRoute path="/agents"><AgentsPage /></ProtectedRoute>
        </Route>

        <Route path="/campaigns">
          <ProtectedRoute path="/campaigns"><CampaignsPage /></ProtectedRoute>
        </Route>

        <Route path="/assignments">
          <ProtectedRoute path="/assignments"><AssignmentsPage /></ProtectedRoute>
        </Route>

        <Route path="/analytics">
          <ProtectedRoute path="/analytics"><AnalyticsPage /></ProtectedRoute>
        </Route>

        <Route path="/import">
          <ProtectedRoute path="/import"><ImportPage /></ProtectedRoute>
        </Route>

        <Route path="/tasks">
          <ProtectedRoute path="/tasks"><TasksPage /></ProtectedRoute>
        </Route>

        <Route path="/workspace">
          <ProtectedRoute path="/workspace"><WorkspacePage /></ProtectedRoute>
        </Route>

        <Route path="/notifications">
          <ProtectedRoute path="/notifications"><NotificationsPage /></ProtectedRoute>
        </Route>

        <Route path="/settings">
          <ProtectedRoute path="/settings"><SettingsPage /></ProtectedRoute>
        </Route>

        {/* Root: redirect based on role */}
        <Route path="/" component={RoleRedirect} />
        <Route component={RoleRedirect} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AppRoutes />
            </WouterRouter>
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </AppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
