import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Tutor from './pages/Tutor';
import Cases from './pages/Cases';
import Learning from './pages/Learning';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <Header />
        
        {/* Main Layout */}
        <div className="flex pt-16"> {/* pt-16 accounts for fixed header */}
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 ml-64 p-6"> {/* ml-64 accounts for fixed sidebar */}
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/learning" element={<Learning />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;