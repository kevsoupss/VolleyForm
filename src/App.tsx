import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import HomePage from './pages/HomePage';
import Upload from './pages/Upload';
import Analysis from './pages/Analysis'

import './App.css'



function AuthenticatedApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element ={<HomePage />} />
        <Route path='/upload' element = {<Upload />} />
        <Route path='/analysis' element = {<Analysis />} />
      </Routes>
    </BrowserRouter>
    
  )
}
function App() {
  return (
    <AuthProvider>
      <AuthStateManager />
    </AuthProvider>
  )
}

function AuthStateManager() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>;
  }

  return currentUser ? <AuthenticatedApp /> : <Login />;
}

export default App
