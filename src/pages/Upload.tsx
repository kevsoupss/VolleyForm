import Navbar from "../components/Navbar"
import VideoUploader from "../components/VideoUploader"
import { ChangeEvent, useState } from "react"
export default function Upload() {
    const [isVideo, setIsVideo] = useState(false)
    const updateVideo = () => {
        //console.log(isVideo)
        setIsVideo(true)
    }

      return (
        <>
            <Navbar />
            <VideoUploader update={updateVideo}/>
        </>

      )
    
}

