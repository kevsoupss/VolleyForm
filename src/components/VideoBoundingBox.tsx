import React, { useEffect, useRef, useState } from 'react';
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

const VideoBoundingBox: React.FC<VideoBoundingBoxProps> = ({
  videoRef,
  onSaveBoundingBox
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const boundingBoxRef = useRef<Rect | null>(null);
  
  const [dimensions, setDimensions] = useState<BoundingBoxDimensions>({
    left: 0,
    top: 0,
    width: 0,
    height: 0
  });

  const initializeCanvas = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    // Get video dimensions
    const videoWidth = videoRef.current.offsetWidth ;
    const videoHeight = videoRef.current.offsetHeight;
    
    // Update canvas size to match video
    if (canvasRef.current) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }

    if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
    }
    
    // Initialize Fabric canvas
    fabricCanvasRef.current = new Canvas(canvasRef.current, {
      selection: false
    });

    const initialWidth = videoWidth / 4;
    const initialHeight = videoHeight /4;

    // Creating new bounding box
    boundingBoxRef.current = new Rect({
        left: (videoWidth - initialWidth) / 2,
        top: (videoHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        hasControls: true,
        hasBorders: true,
        lockRotation: true
    });

    // Add bounding box to the canvas
    fabricCanvasRef.current.add(boundingBoxRef.current);

    // Constraints
    if (boundingBoxRef.current) {
        //Constraints whilst moving the bounding box
        boundingBoxRef.current.on('moving', function(this: Rect) {
            if (!this) return;

            // Horizontal constraints
            if (this.left < 0) {
                this.set('left', 0);
            } else if (this.left + this.getScaledWidth() > videoWidth) {
                this.set('left', videoWidth - this.getScaledWidth())
            }

            // Vertical constraints
            if (this.top < 0) {
                this.set('top', 0);
            } else if (this.top + this.getScaledHeight() > videoHeight) {
                this.set('top', videoHeight - this.getScaledHeight())
            }
           
            updateDimensions();
        });

        // Constraints while resizing the bounding box
        boundingBoxRef.current.on('resizing', function(this: Rect) {
            if (!this) return;

            // If our bounding box leaks outside videoWidth, we want it to scale back
            if (this.left + this.getScaledWidth() > videoWidth) {
                this.scaleX = (videoWidth - this.left) / this.width;
            }

            // Similar for videoHeight
            if (this.top + this.getScaledHeight() > videoHeight) {
                this.scaleY = (videoHeight - this.top) / this.top;
            }

            updateDimensions();
        });

        // Updating dimensions for valid modifications
        boundingBoxRef.current.on('modified', updateDimensions);

    }

    return () => {
        fabricCanvasRef.current?.dispose();
      };

    
};

useEffect(() => {
    if (!videoRef.current) return;

    const onLoadedMetadata = () => {
        console.log("Video metadata loaded");
        initializeCanvas();
      };

      videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);

      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
      }
}, [videoRef]);

const updateDimensions = () => {
    if (!boundingBoxRef) return;

    const box = boundingBoxRef.current;
    const newDimensions = {
        left: Math.round(box!.left),
        top: Math.round(box!.top),
        width: Math.round(box!.getScaledWidth()),
        height: Math.round(box!.getScaledHeight())
    };
    

    setDimensions(newDimensions);
}

const resetBoundingBox = () => {
    if (!boundingBoxRef.current || !videoRef.current || !fabricCanvasRef.current) return;

    const videoWidth = videoRef.current.offsetWidth ;
    const videoHeight = videoRef.current.offsetHeight;
    
    const initialWidth = videoWidth / 4;
    const initialHeight = videoHeight /4;
    
    boundingBoxRef.current.set({
        left: (videoWidth - initialWidth) / 2,
        top: (videoHeight - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
        scaleX: 1,
        scaleY: 1
      });

    boundingBoxRef.current.setCoords();
    fabricCanvasRef.current.renderAll();
    updateDimensions();
    
}
   

  return (
    <>
      {/* Canvas that overlays the video */}
      <canvas 
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Controls placed below the video (rendered in parent component) */}
      <div className="flex items-center justify-center mt-4 space-x-4">
        <button
          //onClick={saveBoundingBoxDimensions}
          className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Save Bounding Box
        </button>
        
        <button
          onClick={resetBoundingBox}
          className="px-4 py-2 font-semibold text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Reset Bounding Box
        </button>
      </div>
      
      <div className="mt-2 p-4 bg-gray-100 rounded w-full max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold mb-2">Bounding Box Dimensions:</h3>
          <div className="grid grid-cols-2 gap-2">
            <p className="font-mono">Left: {dimensions.left}px</p>
            <p className="font-mono">Top: {dimensions.top}px</p>
            <p className="font-mono">Width: {dimensions.width}px</p>
            <p className="font-mono">Height: {dimensions.height}px</p>
          </div>
        </div>
    </>
  );
};

export default VideoBoundingBox;