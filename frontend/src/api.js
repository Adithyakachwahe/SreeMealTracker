const BASE = "http://localhost:5000/api";

export const api = {
  getMealPlan: () => fetch(`${BASE}/meal-plan`).then(r => r.json()),

  logIntake: (data) => fetch(`${BASE}/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  deleteLog: (data) => fetch(`${BASE}/log`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getLogs: (dateStr) => fetch(`${BASE}/log/${dateStr}`).then(r => r.json()),

  logWater: (glasses) => fetch(`${BASE}/water`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ glasses })
  }).then(r => r.json()),

  getWater: (dateStr) => fetch(`${BASE}/water/${dateStr}`).then(r => r.json()),

  logWeight: (weight) => fetch(`${BASE}/weight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight })
  }).then(r => r.json()),

  getWeight: (dateStr) => fetch(`${BASE}/weight/${dateStr}`).then(r => r.json()),

  getWeightHistory: () => fetch(`${BASE}/weight/history/all`).then(r => r.json()),

  deleteWeight: (dateStr) => fetch(`${BASE}/weight/${dateStr}`, { method: "DELETE" }).then(r => r.json()),

  getHistory: () => fetch(`${BASE}/history`).then(r => r.json()),
};