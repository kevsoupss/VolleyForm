import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage


from analysis import analyze_json
from comparison import comparison

load_dotenv()

firebase_credentials_path = os.getenv('FIREBASE_CREDENTIALS_PATH')

bucketStorage = os.getenv('FIREBASE_BUCKET')
cred = credentials.Certificate(firebase_credentials_path)
firebase_admin.initialize_app(cred, {
    "storageBucket": bucketStorage,

})

db = firestore.client()

bucket = storage.bucket()

app = Flask(__name__)

CORS(app)

def upload_bytes(bucket, blob_path, video_bytes):

    # Create a blob (file) in the specified path
    blob = bucket.blob(blob_path)
    
    try:
        # Upload bytes directly
        blob.upload_from_string(
            video_bytes, 
            content_type='video/mp4'
        )
        
        blob.make_public()
        
        return blob.public_url
    except Exception as e:
        print(f"Upload error: {e}")
        return None

def upload_video_file(bucket, user_id, file_path):
    with open(file_path, 'rb') as video_file:
        video_bytes = video_file.read()
        blob_path = f"users/{user_id}/finish/pose.mp4"
        return upload_bytes(bucket, blob_path, video_bytes)

@app.get("/test")
def test():
    return ("test: test")

@app.post("/analysis")
def analysis():
    data = request.get_json()

    user_id = data.get("userId")

    # Downloading
    json_path = f"users/{user_id}/analyze/json"
    blob = bucket.blob(json_path)


    if not blob.exists():
        return jsonify({"message": "File not found"})
    
    blob.download_to_filename("tmp/user.json")

    landmark = analyze_json()

    if (landmark):
        accuracy = comparison()
        print(accuracy)
    else:
        return jsonify({"message:" f"Interal analysis error"})
    
    # Uploading
    upload_video_file(bucket, user_id, 'tmp/output.mp4')

    return jsonify({"message": "Success", 
                    "results": accuracy})

if __name__ =="__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)