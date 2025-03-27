import { ChangeEvent, useState, useRef, useEffect} from "react"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Slider} from "@mui/material"
import React from "react"
import BoundingBox  from "./VideoBoundingBox"
import {storage} from '../firebase/firebase'
import { ref, uploadBytes, UploadResult, getDownloadURL, uploadString } from "firebase/storage";
import {  useAuth } from '../contexts/AuthContext';


interface BoundingBoxDimensions {
    left: number;
    top: number;
    width: number;
    height: number;
  }

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

const VideoUploader: React.FC = () => {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const currentTimeRef = useRef<number>(0);
    const clipStart = useRef<number>(0);
    const [file, setFile] = useState<File | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const {currentUser} = useAuth()


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
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
            videoRef.current.play()
        }
    }

    function handleSliderChange(_: Event, newValue: number | number[]){
        if (videoRef.current) {
            videoRef.current.currentTime = newValue as number;
            clipStart.current = newValue as number;

        }
    };

    function handleTimeUpdateLoop(){
        if (videoRef.current) {
            if (clipStart.current + 4 < currentTimeRef.current || currentTimeRef.current == videoDuration) {
                videoRef.current.currentTime = clipStart.current; // Reset to current time
              }

        }

    }

    async function clipAndUploadVideoElement(
        videoRef: HTMLVideoElement | null,
        dimensions: BoundingBoxDimensions,
        clipDurationSeconds: number = 4,
        customPath?: string
      ){
        
        try {
          // Check if user is authenticated
          
          if (!currentUser || !currentUser.uid) {
            throw new Error('User is not authenticated');
          }
          if (!videoRef) {
            throw new Error('No video')
          }
          
          // Get the video element
          const videoElement: HTMLVideoElement = typeof videoRef === 'string'
            ? document.getElementById(videoRef) as HTMLVideoElement
            : videoRef;
          
          if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
            throw new Error('Invalid video reference');
          }
          
          // Get current time as the start time
          const startTimeSeconds = clipStart.current;
          
          // Check if start time is valid
          if (startTimeSeconds < 0 || startTimeSeconds >= videoElement.duration) {
            throw new Error(`Invalid current time: ${startTimeSeconds}. Video duration is ${videoElement.duration} seconds.`);
          }
          
          // Adjust clip duration if it would exceed the video length
          const actualDuration = Math.min(
            clipDurationSeconds,
            videoElement.duration - startTimeSeconds
          );
          
          if (actualDuration <= 0) {
            throw new Error('Invalid clip duration. Current time is too close to the end of the video.');
          }
          
          // Set up canvas for capturing frames
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Failed to get canvas context');
          }
          
          // Set up MediaRecorder to capture the clipped portion
          const stream = canvas.captureStream(30); // 30fps
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 5000000
          });
          
          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          // Create a promise to handle the recording completion
          const recordingComplete = new Promise<Blob>((resolve) => {
            mediaRecorder.onstop = () => {
              const clipBlob = new Blob(chunks, { type: 'video/webm' });
              resolve(clipBlob);
            };
          });
          
          // Start recording
          mediaRecorder.start();
          
          // Make sure we're at the correct timestamp
          videoElement.currentTime = startTimeSeconds;
          
          // Wait for seeking to complete
          await new Promise<void>((resolve) => {
            videoElement.onseeked = () => resolve();
          });
          
          // Play video and draw frames to canvas
          videoElement.muted = true;
          videoElement.play();
          
          // Create an event that fires when recording should stop
          const originalPlaybackRate = videoElement.playbackRate;
          videoElement.playbackRate = 1.0; // Ensure normal playback speed
          
          // Record for the specified duration
          const recordingTimer = setTimeout(() => {
            videoElement.pause();
            mediaRecorder.stop();
            videoElement.playbackRate = originalPlaybackRate; // Restore original playback rate
          }, actualDuration * 1000);
          
          // Draw frames while video is playing
          const drawFrame = () => {
            if (videoElement.paused || videoElement.ended) return;
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          };
          drawFrame();
          
          // Wait for recording to complete
          const clipBlob = await recordingComplete;
          clearTimeout(recordingTimer);
          
          // Generate filename
          const fileName = `clip-${startTimeSeconds.toFixed(2)}-${Date.now()}.webm`;
          
          // Create user-specific path
          let storagePath = `users/${currentUser.uid}`;
          
          // Add custom path if provided
          if (customPath) {
            storagePath += `/${customPath}`;
          }
          
          // Add videos folder and filename
          storagePath += `/analyze/${fileName}`;
          
          // Create a reference to the storage location
          const storageRef = ref(storage, storagePath);
          
          // Upload the clipped video
          const snapshot: UploadResult = await uploadBytes(storageRef, clipBlob);
          console.log('Clipped video element uploaded successfully:', snapshot);
          
          // Get the download URL
          const downloadURL: string = await getDownloadURL(storageRef);
          const jsonObject = JSON.stringify({
            "dimensions-left": dimensions.left,
            "dimensions-top": dimensions.top,
            "dimensions-width": dimensions.width,
            "dimensions-height": dimensions.height,
            "video": downloadURL
          });
          const jsonPath = `users/${currentUser.uid}/analyze/json`;
          const jsonStorageRef = ref(storage, jsonPath);
          const jsonSnapShot = await uploadString(jsonStorageRef, jsonObject, 'raw');
          console.log('String uploaded: ', jsonSnapShot);
      
          
        } catch (error) {
          console.error('Error clipping and uploading video element:', error);
          throw error;
        }
      }
      

    async function handleAnalyze(dimensions: BoundingBoxDimensions) {
      navigate('/analysis')
      clipAndUploadVideoElement(videoRef.current, dimensions)
        
    }
    
    useEffect(() => {
        if (file && videoRef.current) {
            // Add the timeupdate event listener
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
            videoRef.current.addEventListener("timeupdate", handleTimeUpdateLoop);
            
            // Return cleanup function
            return () => {
                videoRef.current?.removeEventListener('timeupdate', handleTimeUpdate);
                videoRef.current?.removeEventListener("timeupdate", handleTimeUpdateLoop);
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
                        {file ? (<p>Choose Timestamp and Create Bounding Box</p>): (<p>Upload your video</p>)}
                    </h1>
                    {file ? (
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto"> 
                        Use the slider to determine the start of the 4 second clip. Use the bounding box to help the pose estimator find you in the video.</p>)
                        : 
                        (<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Upload a video of your volleyball swing.</p>)}

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
                        <div className="relative w-full h-max-w-4xl mx-auto">
                            <video ref={videoRef} controls className="w-full h-full object-cover m-0" src={URL.createObjectURL(file)} onLoadedMetadata={handleLoadedMetadata}></video>
                            <Slider 
                                    defaultValue={0} 
                                    aria-label="Default" 
                                    valueLabelDisplay="auto" 
                                    min={0} 
                                    max={videoDuration} 
                                    valueLabelFormat={(value) => formatTime(value)}
                                    onChange={handleSliderChange}
                                    className="mt-4"
                                    />
                            <BoundingBox videoRef = {videoRef} analyze= {handleAnalyze}/>
                        </div>
        
                                
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