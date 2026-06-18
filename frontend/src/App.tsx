import { useState } from "react";
import "./App.css";

type FormData = {
  age: string;
  daily_screen_time: string;
  social_media_hours: string;
  study_hours: string;
  sleep_hours: string;
  notification_level: string;
  focus_score: string;
  addiction_level: string;
};

type PredictionResult = {
  predicted_productivity_score: number;
  productivity_category: string;
  recommendations: string[];
  llm_advice?: string;
};

function App() {
  const [formData, setFormData] = useState<FormData>({
    age: "",
    daily_screen_time: "6",
    social_media_hours: "3",
    study_hours: "4",
    sleep_hours: "7",
    notification_level: "Medium",
    focus_score: "50",
    addiction_level: "Medium",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const notificationMapping: Record<string, number> = {
    Low: 25,
    Medium: 75,
    High: 150,
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const payload = {
      age: Number(formData.age),
      daily_screen_time: Number(formData.daily_screen_time),
      social_media_hours: Number(formData.social_media_hours),
      study_hours: Number(formData.study_hours),
      sleep_hours: Number(formData.sleep_hours),
      notifications_per_day: notificationMapping[formData.notification_level],
      focus_score: Number(formData.focus_score),
      addiction_level: formData.addiction_level,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Prediction failed.");
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      setError("Could not connect to backend. Make sure FastAPI is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1>AI Productivity Reality Check</h1>

        <p className="subtitle">
          Answer a few simple lifestyle questions. The system will estimate your
          productivity and suggest improvements.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="field">
            <label>Age</label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>
              Daily Screen Time: <strong>{formData.daily_screen_time} hours</strong>
            </label>
            <p className="hint">
              Total time spent using phone, laptop, tablet, or TV in a day.
            </p>
            <input
              type="range"
              name="daily_screen_time"
              min="0"
              max="16"
              step="0.5"
              value={formData.daily_screen_time}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>
              Social Media Usage:{" "}
              <strong>{formData.social_media_hours} hours</strong>
            </label>
            <p className="hint">
              Time spent on Instagram, YouTube, WhatsApp, reels, shorts, etc.
            </p>
            <input
              type="range"
              name="social_media_hours"
              min="0"
              max="12"
              step="0.5"
              value={formData.social_media_hours}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>
              Study / Work Hours: <strong>{formData.study_hours} hours</strong>
            </label>
            <p className="hint">
              Approximate focused study or productive work time per day.
            </p>
            <input
              type="range"
              name="study_hours"
              min="0"
              max="12"
              step="0.5"
              value={formData.study_hours}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>
              Sleep Hours: <strong>{formData.sleep_hours} hours</strong>
            </label>
            <p className="hint">Average sleep duration per day.</p>
            <input
              type="range"
              name="sleep_hours"
              min="0"
              max="12"
              step="0.5"
              value={formData.sleep_hours}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Notifications Per Day</label>
            <p className="hint">
              Choose an approximate level. The app converts this to a number.
            </p>
            <select
              name="notification_level"
              value={formData.notification_level}
              onChange={handleChange}
            >
              <option value="Low">Low: 0–30 notifications</option>
              <option value="Medium">Medium: 31–100 notifications</option>
              <option value="High">High: 100+ notifications</option>
            </select>
          </div>

          <div className="field">
            <label>
              Focus Level: <strong>{formData.focus_score}/100</strong>
            </label>
            <p className="hint">
              0 means very distracted, 100 means highly focused.
            </p>
            <input
              type="range"
              name="focus_score"
              min="0"
              max="100"
              step="1"
              value={formData.focus_score}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Social Media Dependency</label>
            <p className="hint">
              How difficult is it for you to stay away from social media?
            </p>
            <select
              name="addiction_level"
              value={formData.addiction_level}
              onChange={handleChange}
            >
              <option value="Low">Low: I can avoid it easily</option>
              <option value="Medium">Medium: I check it often but can control it</option>
              <option value="High">High: I find it difficult to stop checking</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Predicting..." : "Check My Productivity"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <h2>Prediction Result</h2>

            <div className="score-card">
              <p>Productivity Score</p>
              <h3>{result.predicted_productivity_score}</h3>
            </div>

            <p>
              <strong>Category:</strong> {result.productivity_category}
            </p>

            <h3>Recommendations</h3>
            <ul>
              {result.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>

            {result.llm_advice && (
              <div className="llm-box">
                <h3>AI Coach Advice</h3>
                <p>{result.llm_advice}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;