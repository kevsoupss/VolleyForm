import os
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, storage

from analysis import analyze_json

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

@app.get("/test")
def test():
    return ("test: test")

@app.post("/analysis")
def analysis():
    data = request.get_json()

    user_id = data.get("userId")

    json_path = f"users/{user_id}/analyze/json"
    blob = bucket.blob(json_path)


    if not blob.exists():
        return jsonify({"message": "File not found"})
    
    blob.download_to_filename("tmp/user.json")

    #analyze_json()


    return jsonify({"message": f"Received {blob}"})

if __name__ =="__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)