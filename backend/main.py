from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json
import requests
from pydantic import BaseModel, Field, model_validator
from typing import Literal


# Load model
model = joblib.load("social_media_productivity_model.pkl")

# Load feature column order
with open("feature_columns.json", "r") as f:
    feature_columns = json.load(f)


app = FastAPI(title="Social Media Productivity Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class UserInput(BaseModel):
    age: int = Field(..., ge=10, le=80)
    daily_screen_time: float = Field(..., ge=0, le=24)
    social_media_hours: float = Field(..., ge=0, le=24)
    study_hours: float = Field(..., ge=0, le=24)
    sleep_hours: float = Field(..., ge=0, le=24)
    notifications_per_day: int = Field(..., ge=0, le=1000)
    focus_score: float = Field(..., ge=0, le=100)
    addiction_level: Literal["Low", "Medium", "High"]

    @model_validator(mode="after")
    def validate_time_logic(self):
        if self.social_media_hours > self.daily_screen_time:
            raise ValueError(
                "Social media hours cannot be greater than daily screen time."
            )

        if self.sleep_hours + self.study_hours + self.social_media_hours > 24:
            raise ValueError(
                "Sleep hours, study hours, and social media hours together cannot exceed 24 hours."
            )

        return self


def productivity_category(score):
    if score < 40:
        return "Low Productivity"
    elif score < 70:
        return "Medium Productivity"
    else:
        return "High Productivity"


def prepare_user_input(user_data):
    data = user_data.copy()

    addiction_mapping = {
        "Low": 0,
        "Medium": 1,
        "High": 2
    }

    if isinstance(data["addiction_level"], str):
        data["addiction_level"] = addiction_mapping[data["addiction_level"]]

    data["screen_social_ratio"] = (
        data["social_media_hours"] /
        (data["daily_screen_time"] + 1)
    )

    data["study_sleep_balance"] = (
        data["study_hours"] /
        (data["sleep_hours"] + 1)
    )

    data["notification_pressure"] = (
        data["notifications_per_day"] /
        (data["focus_score"] + 1)
    )

    data["focus_study_interaction"] = (
        data["focus_score"] *
        data["study_hours"]
    )

    data["digital_distraction_score"] = (
        data["daily_screen_time"] +
        data["social_media_hours"] +
        (data["notifications_per_day"] / 50)
    )

    user_df = pd.DataFrame([data])
    user_df = user_df[feature_columns]

    return user_df


def productivity_coach(user_data, score, category):
    recommendations = []

    if user_data["social_media_hours"] > 4:
        recommendations.append("Reduce social media usage to below 3 hours per day.")

    if user_data["daily_screen_time"] > 8:
        recommendations.append("Try reducing total screen time, especially during study/work hours.")

    if user_data["sleep_hours"] < 6:
        recommendations.append("Increase sleep duration to at least 7 hours for better focus.")

    if user_data["study_hours"] < 3:
        recommendations.append("Increase focused study/work time gradually.")

    if user_data["focus_score"] < 50:
        recommendations.append("Use focus techniques such as Pomodoro or app blockers.")

    if user_data["notifications_per_day"] > 100:
        recommendations.append("Mute non-essential notifications during productive hours.")

    if len(recommendations) == 0:
        recommendations.append("Your habits look balanced. Maintain your current routine.")

    return recommendations

def llm_productivity_coach(user_data, predicted_score, category, rule_recommendations):
    prompt = f"""
You are an AI productivity coach for students.

A machine learning model predicted the user's productivity.

User details:
- Age: {user_data["age"]}
- Daily screen time: {user_data["daily_screen_time"]} hours
- Social media hours: {user_data["social_media_hours"]} hours
- Study/work hours: {user_data["study_hours"]} hours
- Sleep hours: {user_data["sleep_hours"]} hours
- Notifications per day: {user_data["notifications_per_day"]}
- Focus score: {user_data["focus_score"]}
- Addiction level: {user_data["addiction_level"]}

ML prediction:
- Productivity score: {round(predicted_score, 2)}
- Productivity category: {category}

Rule-based recommendations:
{rule_recommendations}

Write the response in this exact structure:

Productivity Analysis:
Explain in 2 short sentences why the user received this productivity score.

Key Factors:
1. Mention one positive factor.
2. Mention one negative factor.
3. Mention one habit that can be improved.

Action Plan:
1. Give one practical action for screen/social media control.
2. Give one practical action for focus or study/work.
3. Give one practical action for sleep or routine.

Motivation:
End with one short encouraging sentence.

Rules:
- Keep the tone supportive and student-friendly.
- Do not call the user "kiddo".
- Do not use markdown symbols like ** or #.
- Do not write one long paragraph.
- Keep the whole answer under 180 words.
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:3b",
                "prompt": prompt,
                "stream": False
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()
        return result.get("response", "LLM response was not available.")

    except requests.exceptions.RequestException:
        return (
            "LLM coach is currently unavailable. "
            "Please make sure Ollama is running locally. "
            "Basic recommendations have still been generated."
        )

    result = response.json()
    return result["response"]


@app.get("/")
def home():
    return {
        "message": "Social Media Productivity Prediction API is running"
    }


@app.post("/predict")
def predict_productivity(user_input: UserInput):
    user_data = user_input.model_dump()

    user_df = prepare_user_input(user_data)

    prediction = model.predict(user_df)[0]
    prediction = float(prediction)

    category = productivity_category(prediction)

    recommendations = productivity_coach(
        user_data,
        prediction,
        category
    )

    llm_advice = llm_productivity_coach(
        user_data,
        prediction,
        category,
        recommendations
    )

    return {
        "predicted_productivity_score": round(prediction, 2),
        "productivity_category": category,
        "recommendations": recommendations,
        "llm_advice": llm_advice
    }