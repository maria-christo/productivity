# AI Productivity Reality Check

AI Productivity Reality Check is a full-stack AI/ML web application that predicts a user's productivity score based on lifestyle and digital behavior patterns such as screen time, social media usage, study/work hours, sleep hours, notifications, focus level, and social media dependency.

The project combines a trained machine learning model with a FastAPI backend, a React TypeScript frontend, and a local Ollama LLM coach for personalized productivity advice.

---

## Project Overview

The system helps users understand how their daily habits may affect productivity.

The user enters simple lifestyle inputs through a web interface. The backend processes the input, creates engineered features, predicts a productivity score using the trained ML model, classifies the productivity level, generates rule-based recommendations, and uses a local LLM through Ollama to provide human-like coaching advice.

---

## Features

* Predicts productivity score using a trained machine learning model
* Classifies productivity into Low, Medium, or High Productivity
* Uses Optuna-tuned XGBoost as the final selected model
* Provides rule-based productivity recommendations
* Uses Ollama LLM locally to generate AI coach advice
* React TypeScript frontend with user-friendly sliders and dropdowns
* FastAPI backend with input validation
* Handles invalid time inputs such as more than 24 hours per day
* Uses feature engineering before prediction
* Saves feature column order for consistent backend predictions
* Includes SHAP explainability and feature importance analysis in the notebook

---

## Tech Stack

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* Optuna
* SHAP
* Joblib

### Backend

* FastAPI
* Uvicorn
* Pydantic
* Pandas
* Joblib
* Requests

### Frontend

* React
* TypeScript
* Vite
* CSS

### LLM

* Ollama
* llama3.2:3b

### Version Control

* Git
* GitHub

---

## Project Structure

```text
productivity-demo/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── social_media_productivity_model.pkl
│   └── feature_columns.json
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## Machine Learning Workflow

The ML notebook includes the following steps:

1. Data loading
2. Missing value handling
3. Outlier checking
4. Encoding categorical values
5. Feature engineering
6. Train-test split
7. Baseline model training
8. Hyperparameter tuning
9. Model comparison
10. Final model selection
11. Feature importance
12. SHAP explainability
13. Productivity category classification
14. Rule-based AI coach
15. Model saving

---

## Models Used

Baseline models:

* Linear Regression
* Random Forest
* XGBoost

Hyperparameter tuning methods:

* Parameter Search
* Grid Search
* Optuna

Final selected model:

```text
Optuna XGBoost
```

Optuna XGBoost was selected because it achieved the best overall performance across MAE, RMSE, and R² Score after ranking all models.

---

## Final Model Performance

```text
Model: Optuna XGBoost
MAE: 7.8828
RMSE: 10.6444
R² Score: 0.8463
Average Rank: 1.0000
```

---

## Important Features

The most important features from the final model include:

```text
focus_study_interaction
focus_score
addiction_level
study_hours
social_media_hours
digital_distraction_score
sleep_hours
```

The model found that productivity is strongly affected by focus level, study/work time, addiction level, and social media usage.

---

## Input Features

The user provides these basic inputs:

```text
age
daily_screen_time
social_media_hours
study_hours
sleep_hours
notifications_per_day
focus_score
addiction_level
```

The backend automatically creates these engineered features:

```text
screen_social_ratio
study_sleep_balance
notification_pressure
focus_study_interaction
digital_distraction_score
```

---

## Input Validation

The backend validates user input using Pydantic.

Validation rules include:

* Age must be between 10 and 80
* Daily screen time must be between 0 and 24 hours
* Social media hours cannot be greater than total screen time
* Sleep hours, study/work hours, and social media hours together cannot exceed 24 hours
* Focus score must be between 0 and 100
* Addiction level must be Low, Medium, or High

This prevents unrealistic values from being passed to the ML model.

---

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI backend:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## Ollama LLM Setup

The LLM coach uses Ollama locally.

Install Ollama, then pull the model:

```bash
ollama pull llama3.2:3b
```

Check that Ollama is running:

```bash
curl http://localhost:11434/api/tags
```

Expected result should show the downloaded model.

The backend calls Ollama through:

```text
http://localhost:11434/api/generate
```

---

## API Endpoint

### POST `/predict`

Sample request:

```json
{
  "age": 22,
  "daily_screen_time": 4,
  "social_media_hours": 1,
  "study_hours": 7,
  "sleep_hours": 8,
  "notifications_per_day": 25,
  "focus_score": 90,
  "addiction_level": "Low"
}
```

Sample response:

```json
{
  "predicted_productivity_score": 82.45,
  "productivity_category": "High Productivity",
  "recommendations": [
    "Your habits look balanced. Maintain your current routine."
  ],
  "llm_advice": "Productivity Analysis: ..."
}
```

---

## Running the Full Project

Use three running services for the complete local demo.

### Terminal 1: Run Ollama

```bash
ollama run llama3.2:3b
```

### Terminal 2: Run FastAPI Backend

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```

### Terminal 3: Run React Frontend

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## Project Summary

AI Productivity Reality Check is a complete AI/ML project that moves beyond a notebook by integrating a trained ML model with a working web application. It predicts productivity, explains user behavior, provides recommendations, and uses a local LLM coach to generate personalized advice.

The project demonstrates:

* Machine learning model development
* Hyperparameter tuning
* Explainable AI
* Backend API development
* Frontend development
* Local LLM integration
* Full-stack AI application design
