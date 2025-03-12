import { ChangeEvent, useState, useRef, useEffect} from "react"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Slider} from "@mui/material"
import React from "react"
import BoundingBox  from "./VideoBoundingBox"


interface VideoUploaderProps {
    update: () => void;
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

const VideoUploader: React.FC<VideoUploaderProps> = ({update}) => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentTimeRef = useRef<number>(0);
    const [file, setFile] = useState<File | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);

    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
            update();
        }
    }

    function handleTimeUpdate() {
        if (videoRef.current) {
            currentTimeRef.current = videoRef.current.currentTime;
          }
    }

    function handleLoadedMetadata() {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
        }
    }

    function handleSliderChange(_: Event, newValue: number | number[]){
        if (videoRef.current) {
            videoRef.current.currentTime = newValue as number;
            console.log(videoRef.current.currentTime);
        }
    };

    useEffect(() => {
        if (file && videoRef.current) {
            // Add the timeupdate event listener
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
            
            // Return cleanup function
            return () => {
                videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [file])


      return (
        <>
        <div className="flex items-center justify-center">
            <div className="min-h-[calc(100vh-8rem)] flex flex-col w-full">
                <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                <motion.div
                    className="space-y-6 max-w-3xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        {file ? (<p>Choose timestamp</p>): (<p>Upload your video</p>)}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        {file ? (<p>Use the slider to determine the start of the 5 second clip.</p>): (<p>Upload a video of your volleyball swing.</p>)}
                    </p>
                    </div>

                </motion.div>
                <motion.div
                    className="space-y-6 max-w-3xl pt-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                <input type="file" accept="video/*" onChange={handleFileChange}/>
                {file && (
                    <div className="mb-4 text-sm flex flex-col">
                        <p>File name: {file.name}</p>
                        <video ref={videoRef} controls className="max-h-[80vh] pb-5" src={URL.createObjectURL(file)} onLoadedMetadata={handleLoadedMetadata}></video>
                        <Slider
                                defaultValue={0} 
                                aria-label="Default" 
                                valueLabelDisplay="auto" 
                                min={0} 
                                max={videoDuration} 
                                valueLabelFormat={(value) => formatTime(value)}
                                onChange={handleSliderChange}
                                />
                        <BoundingBox videoRef = {videoRef} />
                                
                    </div>

                )}
                </motion.div>
                    </div>
                </div>
            </div>
        </>

      )
    
}

export default VideoUploader