import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import TodayTracker from "./pages/TodayTracker";
import WeeklyPlan from "./pages/WeeklyPlan";
import Profile from "./pages/Profile";
import History from "./pages/History";
import { api } from "./api";

const NAV = [
  { key: "dashboard", label: "Home",    icon: "⊞" },
  { key: "today",     label: "Today",   icon: "✦" },
  { key: "weekly",    label: "Plan",    icon: "◫" },
  { key: "history",   label: "History", icon: "◷" },
  { key: "profile",   label: "Profile", icon: "◉" },
];

export default function App() {
  const [page, setPage]         = useState("dashboard");
  const [mealPlan, setMealPlan] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [water, setWater]       = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const today   = new Date().toISOString().split("T")[0];
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    api.getMealPlan().then(setMealPlan).catch(console.error);
    refreshLogs();
    api.getWater(today).then(d => setWater(d.glasses || 0)).catch(() => {});
  }, []);

  const refreshLogs = () => {
    api.getLogs(today).then(setTodayLogs).catch(() => setTodayLogs([]));
  };

  const handleLog = async (item, mealType, isCustom = false) => {
    await api.logIntake({ day: dayName, meal_type: mealType, item, consumed: true, is_custom: isCustom });
    refreshLogs();
  };

  const handleDelete = async (item, mealType) => {
    await api.deleteLog({ date: today, meal_type: mealType, item });
    refreshLogs();
  };

  const handleWater = async (glasses) => {
    setWater(glasses);
    await api.logWater(glasses);
  };

  const toggleDark = () => setDarkMode(d => !d);

  if (!mealPlan) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100dvh", flexDirection:"column", gap:14, background:"var(--bg)" }}>
      <div style={{ width:38, height:38, borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:"var(--accent)", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"var(--text3)", fontSize:14 }}>Loading your meal plan…</p>
    </div>
  );

  const sharedProps = {
    mealPlan, todayLogs, water, today, dayName,
    handleLog, handleDelete, handleWater, refreshLogs,
    darkMode, toggleDark,
  };

  const pages = { dashboard: Dashboard, today: TodayTracker, weekly: WeeklyPlan, profile: Profile, history: History };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="app-layout">
      <Sidebar page={page} setPage={setPage} user={mealPlan.user} darkMode={darkMode} toggleDark={toggleDark} />
      <main className="main-content">
        <PageComponent {...sharedProps} />
      </main>
      <nav className="bottom-nav">
        {NAV.map(n => (
          <button key={n.key} className={page === n.key ? "active" : ""} onClick={() => setPage(n.key)}>
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}