import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AdminRoute from '../components/AdminRoute.jsx';
import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Elections from '../pages/Elections.jsx';
import ElectionDetails from '../pages/ElectionDetails.jsx';
import Vote from '../pages/Vote.jsx';
import Results from '../pages/Results.jsx';
import Profile from '../pages/Profile.jsx';
import NotFound from '../pages/NotFound.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Faq from '../pages/Faq.jsx';
import VotingGuidelines from '../pages/VotingGuidelines.jsx';
import Privacy from '../pages/Privacy.jsx';
import Terms from '../pages/Terms.jsx';
import AdminLayout from '../pages/admin/AdminLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageElections from '../pages/admin/ManageElections.jsx';
import ManageCandidates from '../pages/admin/ManageCandidates.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import VotingResults from '../pages/admin/VotingResults.jsx';

const AppRoutes = () => (
  <Routes>
    {/* Public + voter pages (shared navbar/footer layout) */}
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/elections" element={<Elections />} />
      <Route path="/elections/:id" element={<ElectionDetails />} />
      <Route path="/results" element={<Results />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/voting-guidelines" element={<VotingGuidelines />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Voter-only */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/elections/:id/vote" element={<Vote />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>

    {/* Admin (own sidebar layout) */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="elections" element={<ManageElections />} />
          <Route path="candidates" element={<ManageCandidates />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="results" element={<VotingResults />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
