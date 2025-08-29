import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getDefaultRoute } from './utils/permissions';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { FoundationRegistrationPage } from './pages/FoundationRegistrationPage';
import { RegistrationCompletePage } from './pages/RegistrationCompletePage';
import { LimitedDashboardPage } from './pages/LimitedDashboardPage';
import { AuthLayout } from './layouts/AuthLayout';
import { AppLayout } from './layouts/AppLayout';
import { LimitedLayout } from './layouts/LimitedLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { FoundationsPage } from './pages/FoundationsPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { FoundationDetailsPage } from './pages/FoundationDetailsPage';
import { FoundationForm } from './components/FoundationForm';
import { DocumentsPage } from './pages/DocumentsPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { GrantsPage } from './pages/GrantsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { GovernancePage } from './pages/GovernancePage';
import { FinancialPage } from './pages/FinancialPage';

function App() {
  const { user, loading, logout } = useAuth();
  const isAuthenticated = !!user;
  const userRole = user?.role || 'member';

  const handleLogout = async () => {
    await logout();
  };

  const handleFoundationSubmit = (data: any) => {
    console.log('Foundation data:', data);
    // This would normally send data to the backend
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(userRole)} replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Foundation Registration */}
        <Route
          path="/register-foundation"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <FoundationRegistrationPage />
            )
          }
        />

        <Route
          path="/registration-complete"
          element={<RegistrationCompletePage />}
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(userRole)} replace />
            ) : (
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(userRole)} replace />
            ) : (
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="dashboard" userRole={userRole}>
                <AppLayout onLogout={handleLogout}>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/manager-dashboard"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="manager-dashboard" userRole={userRole}>
                <AppLayout onLogout={handleLogout}>
                  <ManagerDashboardPage />
                </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/foundations"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="foundations" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <FoundationsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/foundations/new"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="foundations" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <FoundationForm onSubmit={handleFoundationSubmit} />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/foundations/:id"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="foundations" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <FoundationDetailsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/foundations/:id/edit"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="foundations" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <FoundationForm onSubmit={handleFoundationSubmit} />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/governance"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="governance" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <GovernancePage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/financial"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="financial" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                <FinancialPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/documents"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="documents" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <DocumentsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/meetings"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="meetings" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <MeetingsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/expenses"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="expenses" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <ExpensesPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/investments"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="investments" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <InvestmentsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/projects"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="projects" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <ProjectsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/grants"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="grants" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <GrantsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="profile" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <ProfilePage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="settings" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <SettingsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <ProtectedRoute requiredScreen="reports" userRole={userRole}>
              <AppLayout onLogout={handleLogout}>
                  <ReportsPage />
              </AppLayout>
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
        {/* Catch-all route for unauthorized access */}
        <Route
          path="/access-denied"
          element={<AccessDeniedPage />}
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultRoute(userRole)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;