import React from 'react'
import {  useAuth } from '../contexts/AuthContext';
import {storage} from '../firebase/firebase'
import { ref, uploadBytes, UploadResult, getDownloadURL, uploadString } from "firebase/storage";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  results: string,
}

const Results: React.FC<Props> = (props: Props) => {
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);
    const {currentUser} = useAuth()
    const analyzedVideoRef = ref(storage, `users/${currentUser!.uid}/finish/pose.mp4`)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [readyCount, setReadyCount] = useState(0);

    const handleCanPlay = () => setReadyCount((prev) => prev + 1);
    const handleReplay = (e:React.SyntheticEvent<HTMLVideoElement, Event>) => {
      const videoElement = e.currentTarget as HTMLVideoElement;
      videoElement.currentTime = 0;
      videoElement.play();
  };

    useEffect(() => {
      if (!currentUser || !currentUser.uid) {
        throw new Error('User is not authenticated');
      }
        getDownloadURL(analyzedVideoRef).then((url) => {
            setVideoUrl(url)
            console.log(url)
          });

    }, [])

    useEffect(() => {
      if (readyCount === 2) {
        video1Ref.current?.play();
        video2Ref.current?.play();
      }
    }, [readyCount]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
      <motion.div
          className="space-y-6 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
      >
          <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <p>Results</p>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto"> 
          Your volleyball swing is {(Number(props.results)*100).toFixed(2)}% similar to Ishikawa.</p>

          </div>
        </motion.div>

    <div className="flex gap-20 items-center justify-center">
    
      <motion.div
      className="space-y-6 max-w-3xl pt-10" 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
  >
      <div className="mb-4 text-sm flex flex-col">

          <div className="relative w-full mx-auto">
              <video ref={video1Ref} controls  className="h-[598px] object-cover m-0" onCanPlay={handleCanPlay} onEnded={handleReplay} src={videoUrl!}></video>
          </div>

                  
      </div>

    </motion.div>
        <motion.div
        className="space-y-6 max-w-3xl pt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >

        <div className="mb-4 text-sm flex flex-col">
    
            <div className="relative w-full mx-auto">
                <video ref={video2Ref} controls className="w-full h-[598px] object-cover m-0" onCanPlay={handleCanPlay} onEnded={handleReplay} src='../../backend/ishikawa_data/ishikawa.mp4'></video>
            </div>
      
        </div>
    
      </motion.div>
      
    </div>

    </div>
  )
}

export default Results
