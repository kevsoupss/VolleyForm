# VolleyForm - A Volleyball Swing Analysis Application

This application allows you to upload videos of yourself hitting, and compare it to Ishikawa, the current captain and outside hitter of Japan's national volleyball team.

### Demo
[![Watch the video](https://img.youtube.com/vi/iW9MKdmGPYE/maxresdefault.jpg)](https://youtu.be/iW9MKdmGPYE)

## Setup
### Frontend
```bash
git clone https://github.com/kevsoupss/VolleyForm.git
npm ci
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
. .\venv\Scripts\activate
pip install requirements.txt
python server.py
```

### Env files

- Fill in the .env file in the root directory with your firebase credentials
- Fill in the .env file in the backend folder with your firebase credentials
- Fill in the credentials.json file in the backend folder


