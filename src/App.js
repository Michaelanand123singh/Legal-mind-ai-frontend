import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Tutor from './pages/Tutor';
import Cases from './pages/Cases';
import Learning from './pages/Learning';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Auto-open sidebar on desktop, close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header with toggle functionality */}
        <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Sidebar with toggle functionality */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        
        {/* Main Content - adjusts based on sidebar state */}
        <main className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tutor" element={<Tutor />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/learning" element={<Learning />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;