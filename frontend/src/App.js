import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import ServiceBuilder from './pages/ServiceBuilder';
import TemplateGallery from './pages/TemplateGallery';
import SecurityScanner from './pages/SecurityScanner';
import Navbar from './components/common/Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/builder" element={<ServiceBuilder />} />
            <Route path="/templates" element={<TemplateGallery />} />
            <Route path="/security" element={<SecurityScanner />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;