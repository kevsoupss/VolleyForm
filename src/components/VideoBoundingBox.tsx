import {useRef, useEffect, useState} from 'react'
import { Canvas, Rect } from 'fabric';

interface VideoBoundingBoxProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    onSaveBoundingBox?: (dimensions: BoundingBoxDimensions) => void;
}
  
interface BoundingBoxDimensions {
    left: number;
    top: number;
    width: number;
    height: number;
}

const VideoBoundingBox: React.FC<VideoBoundingBoxProps> = (props)=> {
    const { videoRef, onSaveBoundingBox} = props;


    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<Canvas | null>(null);
    const boundingBoxRef = useRef<Rect | null>(null);

    const [dimensions, setDimensions] = useState<BoundingBoxDimensions>({
        left:0,
        top: 0,
        width: 0,
        height: 0
    });

    useEffect(() => {
        if (!canvasRef.current || !videoRef.current) return;

        const videoWidth = videoRef.current.offsetWidth;
        const videoHeight = videoRef.current.offsetHeight;  

        if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
        }
    })


    return (
        <div className="flex flex-col items-center">
        <div className="relative">
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-auto"
          />
        </div>
        
        <div className="flex items-center justify-center mt-4 space-x-4">
          <button
            //onClick={saveBoundingBoxDimensions}
            className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Save Bounding Box
          </button>
          
          <button
           // onClick={resetBoundingBox}
            className="px-4 py-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Reset Bounding Box
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2">Bounding Box Dimensions:</h3>
          <p className="font-mono">Left: {dimensions.left}px</p>
          <p className="font-mono">Top: {dimensions.top}px</p>
          <p className="font-mono">Width: {dimensions.width}px</p>
          <p className="font-mono">Height: {dimensions.height}px</p>
        </div>
      </div>
    )
}


export default VideoBoundingBox




