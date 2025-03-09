import { ChangeEvent, useState } from "react"

export default function VideoUploader() {
    const [file, setFile] = useState<File | null>(null)


    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }
      return (
        <>
            <div className="h-screen flex items-center justify-center">
                <input type="file" accept="video/*" onChange={handleFileChange}/>
                {file && (
                    <div className="mb-4 text-sm">
                        <p>File name: {file.name}</p>
                        <p>Type: {file.type}</p>
                        <video controls width="600vw" height="auto" src={URL.createObjectURL(file)}></video>
                    </div>
                )}
            </div>
        </>

      )
    
}

