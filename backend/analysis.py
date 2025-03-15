import math
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import matplotlib.pyplot as plt
import json
import requests
import os

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
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=video_array)

    # initialize pose landmarker
    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    # Create a pose landmarker instance with the video mode:
    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path='pose_landmarker_lite.task'),
        running_mode=VisionRunningMode.VIDEO
        
        )

    with PoseLandmarker.create_from_options(options) as landmarker:
        pose_landmarker_result = landmarker.detect_for_video(mp_image)
    
    print(pose_landmarker_result)

def main():

    analyze_json()



if __name__ == "__main__":
    main()


