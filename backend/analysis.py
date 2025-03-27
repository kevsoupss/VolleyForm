import math
import cv2
import numpy as np
import mediapipe as mp
from mediapipe import solutions
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.framework.formats import landmark_pb2
import matplotlib.pyplot as plt
import json
import requests
import os

def draw_landmarks_on_image(rgb_image, detection_result):
    pose_landmarks_list = detection_result.pose_landmarks
    annotated_image = np.copy(rgb_image)

    # Loop through the detected poses to visualize.
    for idx in range(len(pose_landmarks_list)):
        pose_landmarks = pose_landmarks_list[idx]

        # Draw the pose landmarks.
        pose_landmarks_proto = landmark_pb2.NormalizedLandmarkList()
        for landmark in pose_landmarks:
            landmark_proto = pose_landmarks_proto.landmark.add()  # Just call add() without arguments
            landmark_proto.x = landmark.x
            landmark_proto.y = landmark.y
            landmark_proto.z = landmark.z
            if hasattr(landmark, 'visibility'):
                landmark_proto.visibility = landmark.visibility

        solutions.drawing_utils.draw_landmarks(
            annotated_image,
            pose_landmarks_proto,
            solutions.pose.POSE_CONNECTIONS,
            solutions.drawing_styles.get_default_pose_landmarks_style())
        
    
    return annotated_image


def video_to_numpy(video_path):
    video = cv2.VideoCapture(video_path)
    video_array = []

    # video to numpy array
    while video.isOpened():
        ret, frame = video.read()
        if not ret:
            break  
        video_array.append(frame) 

    video.release()
    return np.array(video_array)

def analyze_json():

    with open('tmp/user.json') as json_file:
        load_file=json.load(json_file)

    # load json dimensions
    dimensions = {
        "left" : load_file["dimensions-left"],
        "top" : load_file["dimensions-top"] ,
        "width" : load_file["dimensions-width"] ,
        "height" : load_file["dimensions-height"] ,
    }

    # load video as webm file
    url = load_file["video"]
    file_path = "tmp/input.webm"
    response = requests.get(url)
    with open(file_path, "wb") as f:
        f.write(response.content)
    
    # initialize mediapose
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    pose_video = mp_pose.Pose(static_image_mode=False, min_detection_confidence=0.5, model_complexity=1)

    if not os.path.isfile(file_path):
        return {"error": {"No video uploaded."}}

    # video to numpy array to mediapipe format
    video_array = video_to_numpy('tmp/input.webm')

    # initialize pose landmarker
    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    model_file = open('pose_landmarker_full.task', "rb")
    model_data = model_file.read()
    model_file.close()

    # Create a pose landmarker instance with the video mode:
    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_buffer=model_data),
        num_poses = 1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
        )
    
    output_path = "tmp/output.mp4"
    detector = vision.PoseLandmarker.create_from_options(options)

    cap = cv2.VideoCapture(file_path)
    # Get video properties
    orig_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = 30


    x, y, width, height = dimensions['left'], dimensions['top'], dimensions['width'], dimensions['height']
    # Ensure bbox stays within video boundaries
    x = max(0, min(x, orig_width))
    y = max(0, min(y, orig_height))
    width = min(width, orig_width - x)
    height = min(height, orig_height - y)
    output_width, output_height = width, height
  
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    out = cv2.VideoWriter(output_path, fourcc, fps, (output_width, output_height), isColor=True)
    
    world_landmarks_data = {
        'fps': fps,
        'frames': [],
        'video_path': file_path,
        'dimensions': {
            'original': {'width': orig_width, 'height': orig_height},
            'processed': {'width': output_width, 'height': output_height}
        }
    }
    
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Crop frame if bbox provided
        frame = frame[y:y+height, x:x+width]
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Create MediaPipe image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        # Detect poses
        detection_result = detector.detect(mp_image)
        
        # Store world landmarks for this frame
        frame_data = {
            'frame_id': frame_count,
            'timestamp': frame_count / fps,
            'poses': []
        }
        
        if detection_result.pose_world_landmarks:
            for pose_idx, pose_landmarks in enumerate(detection_result.pose_world_landmarks):
                pose_data = {
                    'pose_id': pose_idx,
                    'landmarks': []
                }
                for landmark_idx, landmark in enumerate(pose_landmarks):
                    pose_data['landmarks'].append({
                        'landmark_id': landmark_idx,
                        'x': landmark.x,
                        'y': landmark.y,
                        'z': landmark.z,
                        'visibility': landmark.visibility
                    })
                frame_data['poses'].append(pose_data)
        
        world_landmarks_data['frames'].append(frame_data)
        
        # Draw landmarks on the frame
        annotated_frame = draw_landmarks_on_image(mp_image.numpy_view(), detection_result)
        
        # Convert back to BGR for video writing
        output_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_RGB2BGR)
        
        # Write frame
        out.write(output_frame)
        
        frame_count += 1
    
    # Release resources
    cap.release()
    out.release()
    
    landmarks_path = 'tmp/landmark_data.json'
    # Save world landmarks to JSON file
    if landmarks_path:
        with open(landmarks_path, 'w') as f:
            json.dump(world_landmarks_data, f, indent=2)
    
    print(f"Video processing complete. Output saved to {output_path}")
    if landmarks_path:
        print(f"World landmarks saved to {landmarks_path}")
    
    return landmarks_path

def main():

    analyze_json()



if __name__ == "__main__":
    main()


