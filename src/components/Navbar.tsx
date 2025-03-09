import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from "react-router-dom"

export default function Navbar() {
  const {logout} = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <div className="bg-white flex justify-between px-6 py-4 drop-shadow fixed top-0 left-0 right-0 z-50">
    <h2 className="text-xl md:text-2xl font-medium text-black">VolleyForm</h2>
    <button
      onClick={onLogout}
      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
    >
      Logout
    </button>
  </div>

      

      
      
        
    
  )
}


