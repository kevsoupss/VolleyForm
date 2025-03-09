import { ChangeEvent, useState } from "react"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import React from "react"


interface VideoUploaderProps {
    update: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({update}) => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0]);
            update()
        }
    }

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
                        Upload your video
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Upload a video of your volleyball swing
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
                        <video controls className="max-h-[80vh]" src={URL.createObjectURL(file)}></video>
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