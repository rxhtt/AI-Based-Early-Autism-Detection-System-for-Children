import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientIntake from './pages/PatientIntake';
import Screening from './pages/Screening';
import Result from './pages/Result';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
           <Route path="/" element={<Navigate to="/dashboard" replace />} />
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/patients/new" element={<PatientIntake />} />
           <Route path="/patients/:id/screening" element={<Screening />} />
           <Route path="/screenings/:id/result" element={<Result />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
