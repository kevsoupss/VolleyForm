import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from "react-router-dom";

export default function Login() {
    const {signInWithGoogle} = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <p>VolleyForm</p>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Login to start analyzing your volleyball hitting technique 
          </p>
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 w-64"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>
        </div>
      );
    } 


