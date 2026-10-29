import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Authority from './pages/Authority';
import Login from './pages/Login';
import Register from './pages/Register';
import Citizen from './pages/Citizen';
import Worker from './pages/Worker';
import Leaderboard from './pages/Leaderboard';
import EcoAcademy from './pages/EcoAcademy';
import CertificationView from './pages/CertificationView';
import BlockchainExplorer from './pages/BlockchainExplorer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="bg-surface min-h-screen">
        <Routes>
          {/* Public Open Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/academy" element={<EcoAcademy />} />

          {/* Protected Secure Routes (Require Prior Authentication) */}
          <Route 
            path="/explorer" 
            element={
              <ProtectedRoute allowedRoles={['AUTHORITY']}>
                <BlockchainExplorer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <Citizen />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/authority" 
            element={
              <ProtectedRoute allowedRoles={['AUTHORITY']}>
                <Authority />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker" 
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <Worker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/certification" 
            element={
              <ProtectedRoute>
                <CertificationView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
