import Navbar from '../components/Navbar'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LinearProgress from '@mui/material/LinearProgress';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from "react";
import { getStorage, ref, listAll } from "firebase/storage";



const Analysis: React.FC = () => {

  const [results, setResults] = useState(null);
  const {currentUser} = useAuth();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {

    // Check storage for updates every 5 seconds
    intervalIdRef.current = setInterval(() => {
      checkStorageForUpdates();
    }, 5000); 

    // Clean up the interval on component unmount
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
    }}
  }, []);

  const checkStorageForUpdates = async () => {
    if (!currentUser) {
      return;
    }
    const storage = getStorage();
    const userStorageRef = ref(storage, `users/${currentUser.uid}/analyze/`);

    try {
      const result = await listAll(userStorageRef); 
      if (result.items.length > 0) {
        fetchResults();
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);  
        }
      }
    } catch (error) {
      console.log("Error checking storage:", error);
    }
  };


  async function fetchResults(){
    try {
      if (!currentUser) {
        throw new Error("No current user")
      }
      const response = await axiosInstance.post("/analysis", {
        userId: currentUser.uid,
      })
      console.log(response.data.message)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Navbar />
      { results ? (results) : (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
          <motion.div
            className="space-y-6 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Please wait for analysis. 
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                It may take some time for pose estimation and analysis.
              </p>
            </div>

            <div className="pt-4">
              <LinearProgress />
            </div>
          </motion.div>
          </div>
          </div>
      )}
      
    </>
  )
}

export default Analysis
