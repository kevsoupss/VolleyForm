import Navbar from '../components/Navbar'
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LinearProgress from '@mui/material/LinearProgress';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState, useRef } from "react";
import { getStorage, ref, listAll } from "firebase/storage";

import AnalysisLoading  from "../components/AnalysisLoading"


import Results  from "../components/Results"

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
      setResults(response.data.results)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Navbar />
      { results ? <Results results={results} /> : <AnalysisLoading />}
    
    </>

  )
}

export default Analysis
