import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";

// ─── Diet Plan Data ───────────────────────────────────────────────────────────
const DIET_TASKS = [
  { id: "t1", time: "6:00 AM", label: "Morning Hydration", desc: "1 glass of water (normal or lukewarm)", emoji: "💧", category: "hydration" },
  { id: "t2", time: "6:30 AM", label: "Morning Club Join", desc: "Online or community wellness session", emoji: "🎧", category: "wellness" },
  { id: "t3", time: "7:30 AM", label: "Afresh (Morning)", desc: "1 scoop – Metabolism Booster", emoji: "🌿", category: "supplement" },
  { id: "t4", time: "8:00 AM", label: "Breakfast", desc: "Formula-1 (3 scoops) + ShakeMate (2 scoops)", emoji: "🥤", category: "meal" },
  { id: "t5", time: "10:00 AM", label: "Mid-Morning Snack", desc: "2 Bananas or Chiku (or any seasonal fruit like mango)", emoji: "🍌", category: "snack" },
  { id: "t6", time: "12:00 PM", label: "Lunch", desc: "4 Roti + Sabzi + Salad + Curd", emoji: "🍽️", category: "meal" },
  { id: "t7", time: "1:00 PM", label: "Afresh (Afternoon)", desc: "1 scoop – Helps boost metabolism", emoji: "🌿", category: "supplement" },
  { id: "t8", time: "4:00 PM", label: "Evening Snack", desc: "Tea + Healthy Snacks", emoji: "☕", category: "snack" },
  { id: "t9", time: "5:00 PM", label: "Evening Nutrition", desc: "Sprouts (Moong, Chana) and soaked dry fruits", emoji: "🌱", category: "nutrition" },
  { id: "t10", time: "8:00 PM", label: "Dinner", desc: "3 Roti + Sabzi", emoji: "🍛", category: "meal" },
  { id: "t11", time: "10:00 PM", label: "Rest", desc: "Time to sleep – Good Sleep, Better Growth", emoji: "🌙", category: "rest" },
  { id: "t12", time: "All Day", label: "Hydration Goal", desc: "10 glasses of water throughout the day", emoji: "🥛", category: "hydration" },
];

const CATEGORY_COLORS = {
  hydration: "#4FC3F7",
  wellness: "#81C784",
  supplement: "#A5D6A7",
  meal: "#FFB74D",
  snack: "#F48FB1",
  nutrition: "#CE93D8",
  rest: "#9FA8DA",
};

// ─── Storage Helpers ──────────────────────────────────────────────────────────
const STORE_KEY = "wgdp_v2";
const toDateStr = (d) => d.toISOString().slice(0, 10);
const today = () => toDateStr(new Date());

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveStore(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {}
}

// ─── Auth Helpers (simulated) ─────────────────────────────────────────────────
const AUTH_KEY = "wgdp_auth_v2";
function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || "null"); } catch { return null; }
}
function saveAuth(u) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => loadAuth());
  const [store, setStore] = useState(() => loadStore());
  const [view, setView] = useState("today"); // today | calendar | reports
  const [selectedDate, setSelectedDate] = useState(today());
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [reportTab, setReportTab] = useState("daily"); // daily | weekly | monthly
  const [loginMode, setLoginMode] = useState("google"); // google | email | mobile
  const [loginForm, setLoginForm] = useState({ name: "", email: "", phone: "", pass: "" });
  const [loginError, setLoginError] = useState("");

  const updateStore = useCallback((newStore) => {
    setStore(newStore);
    saveStore(newStore);
  }, []);

  const toggleTask = (dateStr, taskId) => {
    const ns = { ...store };
    if (!ns[dateStr]) ns[dateStr] = {};
    ns[dateStr][taskId] = !ns[dateStr][taskId];
    updateStore(ns);
  };

  const getDayData = (dateStr) => store[dateStr] || {};
  const getDayCount = (dateStr) => {
    const d = getDayData(dateStr);
    return Object.values(d).filter(Boolean).length;
  };
  const getDayPct = (dateStr) => Math.round((getDayCount(dateStr) / DIET_TASKS.length) * 100);

  // ─ Login ─────────────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    // Simulated Google login
    const u = { name: "Google User", email: "user@gmail.com", avatar: "G", method: "google", uid: "google_1" };
    setUser(u); saveAuth(u);
  };
  const handleEmailLogin = () => {
    if (!loginForm.name || !loginForm.email) { setLoginError("Please enter name and email"); return; }
    const u = { name: loginForm.name, email: loginForm.email, avatar: loginForm.name[0].toUpperCase(), method: "email", uid: "email_" + loginForm.email };
    setUser(u); saveAuth(u);
  };
  const handleMobileLogin = () => {
    if (!loginForm.name || !loginForm.phone) { setLoginError("Please enter name and mobile number"); return; }
    const u = { name: loginForm.name, phone: loginForm.phone, avatar: loginForm.name[0].toUpperCase(), method: "mobile", uid: "mob_" + loginForm.phone };
    setUser(u); saveAuth(u);
  };
  const handleLogout = () => { setUser(null); saveAuth(null); };

  // ─ Report data ───────────────────────────────────────────────────────────
  const getWeekDates = (fromDate) => {
    const base = new Date(fromDate);
    const day = base.getDay();
    const mon = new Date(base); mon.setDate(base.getDate() - ((day + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return toDateStr(d); });
  };
  const getMonthDates = (y, m) => {
    const days = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => toDateStr(new Date(y, m, i + 1)));
  };

  const weekDates = getWeekDates(selectedDate);
  const monthDates = getMonthDates(calMonth.y, calMonth.m);

  const weeklyData = weekDates.map(d => ({
    day: new Date(d).toLocaleDateString("en", { weekday: "short" }),
    date: d,
    completed: getDayCount(d),
    total: DIET_TASKS.length,
    pct: getDayPct(d),
  }));

  const monthlyData = monthDates.map(d => ({
    day: new Date(d).getDate(),
    completed: getDayCount(d),
    pct: getDayPct(d),
  }));

  const taskBreakdown = DIET_TASKS.map(t => ({
    name: t.label.length > 14 ? t.label.slice(0, 13) + "…" : t.label,
    fullName: t.label,
    emoji: t.emoji,
    category: t.category,
    done: getDayData(selectedDate)[t.id] ? 1 : 0,
  }));

  // Download report
  const downloadReport = () => {
    const dayData = getDayData(selectedDate);
    const completed = DIET_TASKS.filter(t => dayData[t.id]);
    const missed = DIET_TASKS.filter(t => !dayData[t.id]);
    let txt = `WEIGHT GAIN DIET PLAN – REPORT\n`;
    txt += `Date: ${selectedDate}\nUser: ${user?.name}\n`;
    txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `Completion: ${getDayCount(selectedDate)}/${DIET_TASKS.length} tasks (${getDayPct(selectedDate)}%)\n\n`;
    txt += `✅ COMPLETED:\n${completed.map(t => `  ${t.emoji} ${t.time} – ${t.label}`).join("\n")}\n\n`;
    txt += `❌ MISSED:\n${missed.map(t => `  ${t.emoji} ${t.time} – ${t.label}`).join("\n")}\n`;
    txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    txt += `RIGHT NUTRITION • CONSISTENCY • BETTER RESULTS\n`;
    const blob = new Blob([txt], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `diet-report-${selectedDate}.txt`; a.click();
  };

  // ─ Calendar ───────────────────────────────────────────────────────────────
  const calDays = () => {
    const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
    const totalDays = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    const blanks = Array((firstDay + 6) % 7).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return [...blanks, ...days];
  };

  if (!user) {
    return <LoginPage
      mode={loginMode} setMode={setLoginMode}
      form={loginForm} setForm={setLoginForm}
      error={loginError} setError={setLoginError}
      onGoogle={handleGoogleLogin}
      onEmail={handleEmailLogin}
      onMobile={handleMobileLogin}
    />;
  }

  return (
    <div style={styles.root}>
      {/* Background */}
      <div style={styles.bg} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.logo}>🌿</span>
          <div>
            <div style={styles.headerTitle}>Weight Gain Diet Plan</div>
            <div style={styles.headerSub}>Target: Healthy Weight Gain</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.avatar}>{user.avatar}</div>
          <div style={{ fontSize: 12, color: "#666", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Nav */}
      <nav style={styles.nav}>
        {[
          { id: "today", label: "📋 Today" },
          { id: "calendar", label: "📅 Calendar" },
          { id: "reports", label: "📊 Reports" },
        ].map(n => (
          <button key={n.id} onClick={() => setView(n.id)}
            style={{ ...styles.navBtn, ...(view === n.id ? styles.navActive : {}) }}>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.main}>

        {/* TODAY VIEW */}
        {view === "today" && (
          <div>
            <div style={styles.dateBar}>
              <span style={styles.dateLabel}>
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
              <div style={styles.progressRing}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" fill="none" stroke="#E8F5E9" strokeWidth="5" />
                  <circle cx="28" cy="28" r="23" fill="none" stroke="#4CAF50" strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 23}`}
                    strokeDashoffset={`${2 * Math.PI * 23 * (1 - getDayPct(selectedDate) / 100)}`}
                    strokeLinecap="round" transform="rotate(-90 28 28)" />
                </svg>
                <span style={styles.ringText}>{getDayPct(selectedDate)}%</span>
              </div>
            </div>

            {/* Stats Bar */}
            <div style={styles.statsRow}>
              <StatCard icon="✅" value={getDayCount(selectedDate)} label="Done" color="#4CAF50" />
              <StatCard icon="⏳" value={DIET_TASKS.length - getDayCount(selectedDate)} label="Pending" color="#FF9800" />
              <StatCard icon="🎯" value={DIET_TASKS.length} label="Total" color="#2196F3" />
            </div>

            {/* Tasks */}
            <div style={styles.taskList}>
              {DIET_TASKS.map(task => {
                const done = !!getDayData(selectedDate)[task.id];
                return (
                  <div key={task.id} style={{ ...styles.taskCard, ...(done ? styles.taskDone : {}) }}
                    onClick={() => toggleTask(selectedDate, task.id)}>
                    <div style={{ ...styles.taskCatDot, background: CATEGORY_COLORS[task.category] }} />
                    <div style={styles.taskEmoji}>{task.emoji}</div>
                    <div style={styles.taskBody}>
                      <div style={styles.taskTime}>{task.time}</div>
                      <div style={styles.taskLabel}>{task.label}</div>
                      <div style={styles.taskDesc}>{task.desc}</div>
                    </div>
                    <div style={{ ...styles.checkBox, ...(done ? styles.checkDone : {}) }}>
                      {done && <span style={{ color: "#fff", fontSize: 16 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Avoid Section */}
            <div style={styles.avoidBox}>
              <div style={styles.avoidTitle}>🚫 Foods to Avoid</div>
              {["Namkeen (salty snacks) & biscuits", "Items made from refined flour (Maida)", "Outside fried or junk food", "Cold drinks and packaged juices"].map(f => (
                <div key={f} style={styles.avoidItem}>❌ {f}</div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === "calendar" && (
          <div>
            <div style={styles.calHeader}>
              <button style={styles.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
              <span style={styles.calTitle}>
                {new Date(calMonth.y, calMonth.m).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </span>
              <button style={styles.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
            </div>

            <div style={styles.calGrid}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <div key={d} style={styles.calDayHead}>{d}</div>
              ))}
              {calDays().map((d, i) => {
                if (!d) return <div key={`b${i}`} />;
                const ds = toDateStr(new Date(calMonth.y, calMonth.m, d));
                const pct = getDayPct(ds);
                const isSelected = ds === selectedDate;
                const isToday = ds === today();
                return (
                  <div key={ds} style={{ ...styles.calDay, ...(isSelected ? styles.calDaySelected : {}), ...(isToday ? styles.calDayToday : {}) }}
                    onClick={() => { setSelectedDate(ds); setView("today"); }}>
                    <span style={styles.calDayNum}>{d}</span>
                    {pct > 0 && (
                      <div style={styles.calPctBar}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct >= 80 ? "#4CAF50" : pct >= 50 ? "#FF9800" : "#F44336", borderRadius: 2 }} />
                      </div>
                    )}
                    {pct > 0 && <span style={styles.calPctText}>{pct}%</span>}
                  </div>
                );
              })}
            </div>

            <div style={styles.calLegend}>
              <span>🟢 ≥80% &nbsp; 🟡 ≥50% &nbsp; 🔴 &lt;50%</span>
            </div>
          </div>
        )}

        {/* REPORTS VIEW */}
        {view === "reports" && (
          <div>
            <div style={styles.reportNav}>
              {["daily", "weekly", "monthly"].map(t => (
                <button key={t} style={{ ...styles.reportTab, ...(reportTab === t ? styles.reportTabActive : {}) }}
                  onClick={() => setReportTab(t)}>
                  {t === "daily" ? "📅 Daily" : t === "weekly" ? "📆 Weekly" : "🗓️ Monthly"}
                </button>
              ))}
            </div>

            {reportTab === "daily" && (
              <div>
                <div style={styles.reportHeader}>
                  <div>
                    <div style={styles.reportDate}>{new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                    <div style={styles.reportScore}>{getDayCount(selectedDate)} / {DIET_TASKS.length} tasks completed ({getDayPct(selectedDate)}%)</div>
                  </div>
                  <button onClick={downloadReport} style={styles.downloadBtn}>⬇️ Download</button>
                </div>

                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Daily Activity – Task Completion</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={taskBreakdown} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-40} textAnchor="end" />
                      <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={v => v ? "Done" : "Missed"} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v, n, p) => [v ? "✅ Completed" : "❌ Missed", p.payload.fullName]} />
                      <Bar dataKey="done" radius={[4, 4, 0, 0]}
                        fill="#4CAF50"
                        label={{ position: "top", formatter: v => v ? "✓" : "", fontSize: 14 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={styles.taskSummary}>
                  {DIET_TASKS.map(t => {
                    const done = !!getDayData(selectedDate)[t.id];
                    return (
                      <div key={t.id} style={{ ...styles.summaryRow, background: done ? "#E8F5E9" : "#FFF3E0" }}>
                        <span>{t.emoji}</span>
                        <span style={{ flex: 1, fontSize: 13 }}>{t.time} – {t.label}</span>
                        <span>{done ? "✅" : "❌"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reportTab === "weekly" && (
              <div>
                <div style={styles.reportHeader}>
                  <div style={styles.reportDate}>Week of {weekDates[0]} to {weekDates[6]}</div>
                </div>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Weekly Activity – Tasks Completed Per Day</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, DIET_TASKS.length]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [`${v} tasks`, "Completed"]} />
                      <Bar dataKey="completed" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Weekly Completion % Trend</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={weeklyData} margin={{ top: 5, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={v => [`${v}%`, "Completion"]} />
                      <Line type="monotone" dataKey="pct" stroke="#FF9800" strokeWidth={3} dot={{ fill: "#FF9800", r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={styles.weekGrid}>
                  {weeklyData.map(d => (
                    <div key={d.date} style={{ ...styles.weekCell, background: d.pct >= 80 ? "#E8F5E9" : d.pct >= 50 ? "#FFF8E1" : d.pct > 0 ? "#FFEBEE" : "#F5F5F5" }}
                      onClick={() => { setSelectedDate(d.date); setReportTab("daily"); }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{d.day}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: d.pct >= 80 ? "#4CAF50" : d.pct >= 50 ? "#FF9800" : "#9E9E9E" }}>{d.pct}%</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{d.completed}/{DIET_TASKS.length}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportTab === "monthly" && (
              <div>
                <div style={styles.calHeader}>
                  <button style={styles.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>‹</button>
                  <span style={styles.calTitle}>{new Date(calMonth.y, calMonth.m).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                  <button style={styles.calNav} onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}>›</button>
                </div>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Monthly Activity – Daily Completion %</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={v => [`${v}%`, "Completion"]} labelFormatter={l => `Day ${l}`} />
                      <Bar dataKey="pct" fill="#66BB6A" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={styles.chartBox}>
                  <div style={styles.chartTitle}>Monthly Trend Line</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={monthlyData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip formatter={v => [`${v}%`, "Completion"]} labelFormatter={l => `Day ${l}`} />
                      <Line type="monotone" dataKey="pct" stroke="#4CAF50" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Monthly Summary */}
                <div style={styles.monthlySummaryBox}>
                  {(() => {
                    const active = monthlyData.filter(d => d.pct > 0);
                    const avg = active.length ? Math.round(active.reduce((s, d) => s + d.pct, 0) / active.length) : 0;
                    const perfect = monthlyData.filter(d => d.pct === 100).length;
                    const tracked = active.length;
                    return (
                      <>
                        <div style={styles.monthlyStat}><span>📅</span><div><div style={{ fontWeight: 700, fontSize: 18 }}>{tracked}</div><div style={{ fontSize: 11, color: "#888" }}>Days Tracked</div></div></div>
                        <div style={styles.monthlyStat}><span>📊</span><div><div style={{ fontWeight: 700, fontSize: 18 }}>{avg}%</div><div style={{ fontSize: 11, color: "#888" }}>Avg Completion</div></div></div>
                        <div style={styles.monthlyStat}><span>🏆</span><div><div style={{ fontWeight: 700, fontSize: 18 }}>{perfect}</div><div style={{ fontSize: 11, color: "#888" }}>Perfect Days</div></div></div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        🌿 Right Nutrition &nbsp;•&nbsp; Consistency &nbsp;•&nbsp; Better Results
      </footer>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ mode, setMode, form, setForm, error, setError, onGoogle, onEmail, onMobile }) {
  return (
    <div style={styles.loginRoot}>
      <div style={styles.loginBg} />
      <div style={styles.loginCard}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52 }}>🌿</div>
          <div style={styles.loginTitle}>Weight Gain Diet Plan</div>
          <div style={styles.loginSub}>Target: Healthy Weight Gain</div>
        </div>

        <div style={styles.loginTabs}>
          {[
            { id: "google", label: "🔵 Google" },
            { id: "email", label: "📧 Email" },
            { id: "mobile", label: "📱 Mobile" },
          ].map(t => (
            <button key={t.id} style={{ ...styles.loginTab, ...(mode === t.id ? styles.loginTabActive : {}) }}
              onClick={() => { setMode(t.id); setError(""); }}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div style={styles.loginError}>{error}</div>}

        {mode === "google" && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>Sign in with your Google account to save your diet tracking data permanently.</p>
            <button style={styles.googleBtn} onClick={onGoogle}>
              <span style={{ fontSize: 20, marginRight: 10 }}>🔵</span>
              Continue with Google
            </button>
          </div>
        )}

        {mode === "email" && (
          <div>
            <input style={styles.loginInput} placeholder="Your Name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input style={styles.loginInput} type="email" placeholder="Email Address" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            <input style={styles.loginInput} type="password" placeholder="Password" value={form.pass}
              onChange={e => setForm(p => ({ ...p, pass: e.target.value }))} />
            <button style={styles.loginBtn} onClick={onEmail}>Continue with Email</button>
          </div>
        )}

        {mode === "mobile" && (
          <div>
            <input style={styles.loginInput} placeholder="Your Name" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input style={styles.loginInput} type="tel" placeholder="Mobile Number (+91XXXXXXXXXX)" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <button style={styles.loginBtn} onClick={onMobile}>Continue with Mobile</button>
          </div>
        )}

        <div style={styles.loginFooter}>🌿 Right Nutrition • Consistency • Better Results</div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: { fontFamily: "'Segoe UI', 'Noto Sans', sans-serif", minHeight: "100vh", background: "#F1F8E9", position: "relative", maxWidth: 480, margin: "0 auto" },
  bg: { position: "fixed", inset: 0, background: "linear-gradient(135deg,#E8F5E9 0%,#F9FBE7 50%,#E0F7FA 100%)", zIndex: -1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "linear-gradient(135deg, #1B5E20, #2E7D32)", color: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,.2)" },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerRight: { display: "flex", alignItems: "center", gap: 8 },
  logo: { fontSize: 28 },
  headerTitle: { fontWeight: 800, fontSize: 15, letterSpacing: 0.3 },
  headerSub: { fontSize: 10, opacity: 0.8 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "#A5D6A7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#1B5E20" },
  logoutBtn: { fontSize: 11, padding: "3px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,.4)", background: "transparent", color: "#fff", cursor: "pointer" },
  nav: { display: "flex", background: "#fff", borderBottom: "2px solid #E8F5E9", position: "sticky", top: 60, zIndex: 99 },
  navBtn: { flex: 1, padding: "10px 4px", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#777", cursor: "pointer", transition: "all .2s" },
  navActive: { color: "#2E7D32", borderBottom: "3px solid #4CAF50", background: "#F1F8E9" },
  main: { padding: "12px 12px 80px" },
  dateBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "10px 14px", background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  dateLabel: { fontSize: 13, fontWeight: 700, color: "#2E7D32" },
  progressRing: { position: "relative", width: 56, height: 56 },
  ringText: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#2E7D32" },
  statsRow: { display: "flex", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, background: "#fff", borderRadius: 12, padding: "10px 8px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  taskList: { display: "flex", flexDirection: "column", gap: 8 },
  taskCard: { display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 14, padding: "10px 12px", boxShadow: "0 1px 4px rgba(0,0,0,.07)", cursor: "pointer", transition: "all .2s", border: "2px solid transparent" },
  taskDone: { background: "#E8F5E9", border: "2px solid #A5D6A7" },
  taskCatDot: { width: 6, height: 6, borderRadius: "50%", flexShrink: 0 },
  taskEmoji: { fontSize: 24, flexShrink: 0 },
  taskBody: { flex: 1 },
  taskTime: { fontSize: 10, color: "#888", fontWeight: 700, textTransform: "uppercase" },
  taskLabel: { fontSize: 14, fontWeight: 700, color: "#1B5E20" },
  taskDesc: { fontSize: 11, color: "#666", marginTop: 1 },
  checkBox: { width: 26, height: 26, borderRadius: "50%", border: "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s" },
  checkDone: { background: "#4CAF50", border: "2px solid #4CAF50" },
  avoidBox: { marginTop: 16, background: "#FFF3E0", borderRadius: 14, padding: "12px 14px", border: "1px solid #FFCC80" },
  avoidTitle: { fontWeight: 800, color: "#E65100", marginBottom: 8, fontSize: 14 },
  avoidItem: { fontSize: 12, color: "#BF360C", marginBottom: 4 },
  calHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#fff", borderRadius: 14, marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  calNav: { fontSize: 22, background: "none", border: "none", cursor: "pointer", color: "#2E7D32", fontWeight: 800, padding: "0 8px" },
  calTitle: { fontWeight: 800, color: "#1B5E20", fontSize: 15 },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 },
  calDayHead: { textAlign: "center", fontSize: 11, fontWeight: 700, color: "#888", padding: "4px 0" },
  calDay: { background: "#fff", borderRadius: 10, padding: "6px 4px", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.06)", transition: "all .15s" },
  calDaySelected: { border: "2px solid #4CAF50", background: "#E8F5E9" },
  calDayToday: { fontWeight: 800 },
  calDayNum: { fontSize: 13, fontWeight: 600, color: "#333" },
  calPctBar: { width: "80%", height: 4, background: "#eee", borderRadius: 2, marginTop: 3 },
  calPctText: { fontSize: 9, color: "#888", marginTop: 2 },
  calLegend: { textAlign: "center", fontSize: 12, color: "#888", marginTop: 10 },
  reportNav: { display: "flex", gap: 6, marginBottom: 14 },
  reportTab: { flex: 1, padding: "8px 4px", borderRadius: 10, border: "2px solid #E8F5E9", background: "#fff", fontSize: 12, fontWeight: 700, color: "#888", cursor: "pointer" },
  reportTabActive: { border: "2px solid #4CAF50", color: "#2E7D32", background: "#E8F5E9" },
  reportHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, background: "#fff", borderRadius: 14, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  reportDate: { fontSize: 13, fontWeight: 700, color: "#2E7D32" },
  reportScore: { fontSize: 12, color: "#666", marginTop: 2 },
  downloadBtn: { fontSize: 12, padding: "6px 12px", borderRadius: 10, border: "none", background: "#4CAF50", color: "#fff", cursor: "pointer", fontWeight: 700 },
  chartBox: { background: "#fff", borderRadius: 14, padding: "14px 10px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  chartTitle: { fontSize: 13, fontWeight: 700, color: "#2E7D32", marginBottom: 8 },
  taskSummary: { display: "flex", flexDirection: "column", gap: 4 },
  summaryRow: { display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, fontSize: 12 },
  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 10 },
  weekCell: { borderRadius: 10, padding: "8px 4px", textAlign: "center", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.06)" },
  monthlySummaryBox: { display: "flex", justifyContent: "space-around", background: "#fff", borderRadius: 14, padding: "14px", marginTop: 10, boxShadow: "0 1px 4px rgba(0,0,0,.07)" },
  monthlyStat: { display: "flex", alignItems: "center", gap: 10, fontSize: 22 },
  footer: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "linear-gradient(135deg,#1B5E20,#2E7D32)", color: "#fff", textAlign: "center", padding: "10px", fontSize: 11, fontWeight: 600 },
  // Login
  loginRoot: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  loginBg: { position: "fixed", inset: 0, background: "linear-gradient(135deg,#E8F5E9 0%,#F9FBE7 50%,#E0F7FA 100%)", zIndex: -1 },
  loginCard: { background: "#fff", borderRadius: 20, padding: "28px 22px", width: "100%", maxWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,.12)" },
  loginTitle: { fontWeight: 900, fontSize: 22, color: "#1B5E20", marginTop: 8 },
  loginSub: { fontSize: 13, color: "#4CAF50", marginTop: 4 },
  loginTabs: { display: "flex", gap: 6, marginBottom: 20 },
  loginTab: { flex: 1, padding: "8px 4px", borderRadius: 10, border: "2px solid #E8F5E9", background: "#F9FBE7", fontSize: 12, fontWeight: 700, color: "#888", cursor: "pointer" },
  loginTabActive: { border: "2px solid #4CAF50", color: "#2E7D32", background: "#E8F5E9" },
  loginError: { background: "#FFEBEE", color: "#C62828", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12 },
  googleBtn: { display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "13px", borderRadius: 12, border: "2px solid #4285F4", background: "#fff", color: "#333", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  loginInput: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #E8F5E9", marginBottom: 10, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  loginBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2E7D32,#4CAF50)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" },
  loginFooter: { textAlign: "center", color: "#888", fontSize: 11, marginTop: 24 },
};
