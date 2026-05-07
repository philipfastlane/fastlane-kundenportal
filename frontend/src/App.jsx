import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Contracts from './pages/Contracts';
import Contacts from './pages/Contacts';
import Invoices from './pages/Invoices';
import Tickets from './pages/Tickets';
import Settings from './pages/Settings';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';

import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/pages/AdminDashboard';
import Customers from './admin/pages/Customers';
import AdminContracts from './admin/pages/AdminContracts';
import AdminInvoices from './admin/pages/AdminInvoices';
import AdminContacts from './admin/pages/AdminContacts';
import AdminTickets from './admin/pages/AdminTickets';
import AdminActivities from './admin/pages/AdminActivities';
import AdminSettings from './admin/pages/AdminSettings';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}
function AdminRoute({ children }) {
  return localStorage.getItem('adminToken') ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
    <ToastProvider>
      <Routes>
        {/* Customer portal */}
        <Route path="/login" element={<Login />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/passwort-vergessen" element={<ForgotPassword />} />
        <Route path="/passwort-zuruecksetzen" element={<ResetPassword />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="vertraege"       element={<Contracts />} />
          <Route path="ansprechpartner" element={<Contacts />} />
          <Route path="rechnungen"      element={<Invoices />} />
          <Route path="tickets"         element={<Tickets />} />
          <Route path="einstellungen"   element={<Settings />} />
        </Route>

        {/* Admin area */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"       element={<AdminDashboard />} />
          <Route path="kunden"          element={<Customers />} />
          <Route path="vertraege"       element={<AdminContracts />} />
          <Route path="rechnungen"      element={<AdminInvoices />} />
          <Route path="ansprechpartner" element={<AdminContacts />} />
          <Route path="tickets"         element={<AdminTickets />} />
          <Route path="aktivitaeten"    element={<AdminActivities />} />
          <Route path="einstellungen"   element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
    </BrowserRouter>
  );
}
