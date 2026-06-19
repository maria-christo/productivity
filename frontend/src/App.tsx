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

  const getCategoryClass = (category: string) => {
    if (category.includes("High")) return "high";
    if (category.includes("Medium")) return "medium";
    return "low";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    const age = Number(formData.age);
    const dailyScreenTime = Number(formData.daily_screen_time);
    const socialMediaHours = Number(formData.social_media_hours);
    const studyHours = Number(formData.study_hours);
    const sleepHours = Number(formData.sleep_hours);
    const focusScore = Number(formData.focus_score);

    if (age < 10 || age > 80) {
      setError("Age must be between 10 and 80.");
      setLoading(false);
      return;
    }

    if (socialMediaHours > dailyScreenTime) {
      setError("Social media hours cannot be greater than total screen time.");
      setLoading(false);
      return;
    }

    if (sleepHours + studyHours + socialMediaHours > 24) {
      setError(
        "Sleep hours, study/work hours, and social media hours together cannot exceed 24 hours."
      );
      setLoading(false);
      return;
    }

    const payload = {
      age: age,
      daily_screen_time: dailyScreenTime,
      social_media_hours: socialMediaHours,
      study_hours: studyHours,
      sleep_hours: sleepHours,
      notifications_per_day: notificationMapping[formData.notification_level],
      focus_score: focusScore,
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
        const errorData = await response.json();

        let message = "Prediction failed. Please check your inputs.";

        if (Array.isArray(errorData.detail)) {
          message = errorData.detail
            .map((err: { msg?: string }) => err.msg)
            .join(" ");
        }

        throw new Error(message);
      }

      const data: PredictionResult = await response.json();
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not connect to backend. Make sure FastAPI is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const scorePercent = result
    ? Math.max(0, Math.min(100, result.predicted_productivity_score))
    : 0;

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">AI + ML Productivity Coach</p>
          <h1>Productivity Reality Check</h1>
          <p className="hero-text">
            Discover how your screen habits, focus, sleep, and study routine
            affect your productivity.
          </p>
        </div>

        <div className="hero-card">
          <span>Final Model</span>
          <strong>Optuna XGBoost</strong>
          <p>ML prediction + Ollama AI coach</p>
        </div>
      </section>

      <section className="layout">
        <form onSubmit={handleSubmit} className="panel form-panel">
          <div className="panel-header">
            <h2>Your Lifestyle Inputs</h2>
            <p>Use sliders and simple choices. No technical values needed.</p>
          </div>

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
            <div className="label-row">
              <label>Daily Screen Time</label>
              <span>{formData.daily_screen_time} hrs</span>
            </div>
            <input
              type="range"
              name="daily_screen_time"
              min="0"
              max="16"
              step="0.5"
              value={formData.daily_screen_time}
              onChange={handleChange}
            />
            <p className="hint">Phone, laptop, tablet, TV, and other screens.</p>
          </div>

          <div className="field">
            <div className="label-row">
              <label>Social Media Usage</label>
              <span>{formData.social_media_hours} hrs</span>
            </div>
            <input
              type="range"
              name="social_media_hours"
              min="0"
              max={formData.daily_screen_time}
              step="0.5"
              value={formData.social_media_hours}
              onChange={handleChange}
            />
            <p className="hint">Reels, shorts, Instagram, YouTube, WhatsApp, etc.</p>
          </div>

          <div className="field">
            <div className="label-row">
              <label>Study / Work Hours</label>
              <span>{formData.study_hours} hrs</span>
            </div>
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
            <div className="label-row">
              <label>Sleep Hours</label>
              <span>{formData.sleep_hours} hrs</span>
            </div>
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

          <div className="two-columns">
            <div className="field">
              <label>Notifications</label>
              <select
                name="notification_level"
                value={formData.notification_level}
                onChange={handleChange}
              >
                <option value="Low">Low: 0–30/day</option>
                <option value="Medium">Medium: 31–100/day</option>
                <option value="High">High: 100+/day</option>
              </select>
            </div>

            <div className="field">
              <label>Social Media Dependency</label>
              <select
                name="addiction_level"
                value={formData.addiction_level}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="field">
            <div className="label-row">
              <label>Focus Level</label>
              <span>{formData.focus_score}/100</span>
            </div>
            <input
              type="range"
              name="focus_score"
              min="0"
              max="100"
              step="1"
              value={formData.focus_score}
              onChange={handleChange}
            />
            <p className="hint">0 = distracted, 100 = highly focused.</p>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze My Productivity"}
          </button>
        </form>

        <aside className="panel result-panel">
          {!result && !loading && (
            <div className="empty-state">
              <div className="pulse-circle">AI</div>
              <h2>Your result will appear here</h2>
              <p>
                Submit your lifestyle details to get a productivity score,
                category, recommendations, and AI coach advice.
              </p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <h2>Analyzing your routine...</h2>
              <p>The ML model and AI coach are preparing your feedback.</p>
            </div>
          )}

          {result && (
            <div className="result-content">
              <p className="eyebrow">Prediction Result</p>

              <div className="score-box">
                <div>
                  <span>Productivity Score</span>
                  <h2>{result.predicted_productivity_score}</h2>
                </div>

                <div className={`badge ${getCategoryClass(result.productivity_category)}`}>
                  {result.productivity_category}
                </div>
              </div>

              <div className="meter">
                <div
                  className="meter-fill"
                  style={{ width: `${scorePercent}%` }}
                ></div>
              </div>

              <div className="recommendation-box">
                <h3>Recommended Actions</h3>
                <ul>
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>

              {result.llm_advice && (
                <div className="llm-box">
                  <h3>AI Coach Advice</h3>
                  <p>{result.llm_advice}</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;