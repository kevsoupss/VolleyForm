from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.get("/test")
def test():
    return ("test: test")

@app.post("/analysis")
def analysis():
    data = request.get_json()

    user_id = data.get("userId")
    return jsonify({"message": f"Received {user_id}"})

if __name__ =="__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)