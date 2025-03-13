import {useEffect, useState} from 'react'
import Navbar from '../components/Navbar'
import { ArrowRight, Camera, Dumbbell, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LinearProgress from '@mui/material/LinearProgress';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../contexts/AuthContext';

const Analysis: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const {currentUser} = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    console.log("Getting")
    const results = fetchResults();
    
  }, [])
  

  async function fetchResults(){
    try {
      if (!currentUser) {
        throw new Error("No current user")
      }
      const response = await axiosInstance.get("/analysis")
    } catch (error) {
      console.log("No uploaded videos found")
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
                Please wait for the analysis. 
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload videos of your volleyball swing, compare with professionals, and receive detailed feedback to improve your technique.
              </p>
            </div>

            <div className="pt-4">
              <LinearProgress variant="determinate" value={progress} />
            </div>
          </motion.div>
          </div>
          </div>
      )}
      
    </>
  )
}

export default Analysis
