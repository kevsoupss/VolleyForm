import json
import numpy as np

def load_pose_file(file_path):
    """Load a pose estimation JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)

# calculate using cosine simularity
def calculate_similarity(landmark1, landmark2):
    vec1 = np.array([landmark1['x'], landmark1['y'], landmark1['z']])
    vec2 = np.array([landmark2['x'], landmark2['y'], landmark2['z']])
                  
                  
    cosine_similarity = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

    return cosine_similarity            
                  


def compare_pose_files(file1, file2):

    data1 = load_pose_file(file1)
    data2 = load_pose_file(file2)

    min_frames = min(len(data1['frames']), len(data2['frames']))

    if min_frames == 0:
        return 0.0

    similarity = []

    for i in range(0, min_frames):
        poseframe1 = data1['frames'][i]["poses"]
        poseframe2 = data2['frames'][i]["poses"]

        if (poseframe1 and poseframe2):
            for j in range(0, min(len(poseframe1[0]["landmarks"]), len(poseframe2[0]["landmarks"]))):
                similarity.append(calculate_similarity(poseframe1[0]["landmarks"][j],poseframe2[0]["landmarks"][j]))

    accuracy = sum(similarity)/len(similarity)
    return accuracy

def comparison():
    return compare_pose_files("ishikawa_data/ishikawa_landmark.json", "tmp/landmark_data.json")

def main():
    comparison()

if __name__ == "__main__":
    main()