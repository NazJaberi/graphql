import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { useAuth } from '../utils/AuthContext';

// Recharts
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Icons (lucide-react)
import {
  LogOut,
  Award,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';

/**
 * UPDATED GraphQL query:
 *  The user, transaction, and progress relationships must exist in your Hasura schema
 *  under the 'user' table. If you see them in your introspection or relationships,
 *  it will work. If not, adjust the field names accordingly (e.g. "transactions" might
 *  be "transaction" or "xp_transaction"). 
 */
const GET_USER_DATA = gql`
  query GetUserData {
    user {
      id
      login
      firstName
      lastName
      email
      campus

      # Transactions: Filter to XP type, ordered by ascending creation date
      transactions(where: { type: { _eq: "xp" } }, order_by: { createdAt: asc }) {
        amount
        createdAt
        path
      }

      # Recent progress (limit 5) - adjust the 'progresses' field name if needed
      progresses(order_by: { createdAt: desc }, limit: 5) {
        grade
        createdAt
        object {
          name
        }
      }

      # Full progress list for stats
      allProgresses: progresses(order_by: { createdAt: asc }) {
        grade
        createdAt
        path
      }
    }
  }
`;

/**
 * Profile Component:
 *  Displays user info, XP, recent projects, and various charts using Recharts
 */
export default function Profile() {
  const { logout } = useAuth();
  const { loading, error, data } = useQuery(GET_USER_DATA);

  if (loading) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.errorText}>Error loading data</div>
      </div>
    );
  }

  // Safely extract the first user
  const user = data?.user?.[0];
  if (!user) return null;

  //-----------------------
  //   DATA PROCESSING
  //-----------------------

  // 1) XP Data (AreaChart)
  const xpData = (user.transactions || []).map((tx) => ({
    date: new Date(tx.createdAt).toLocaleDateString(),
    xp: tx.amount,
  }));
  const totalXP = xpData.reduce((sum, item) => sum + item.xp, 0);

  // 2) Audit Stats (pass/fail among allProgresses)
  const passedAudits = (user.allProgresses || []).filter((p) => p.grade > 0).length;
  const totalAudits = (user.allProgresses || []).length;
  const auditRatio = totalAudits
    ? ((passedAudits / totalAudits) * 100).toFixed(1)
    : 0;

  // 3) Learning Hours
  const learningHours = Math.round(totalXP / 1000);

  // 4) Recent Projects (limit 5)
  const recentProjects = (user.progresses || []).map((prog) => ({
    name: prog?.object?.name || 'Unnamed Project',
    createdAt: new Date(prog.createdAt).toLocaleDateString(),
    grade: prog.grade,
  }));

  // 5) Grade Over Time (LineChart)
  const gradeOverTimeData = (user.allProgresses || []).map((p) => ({
    date: new Date(p.createdAt).toLocaleDateString(),
    grade: p.grade,
  }));

  // 6) XP by Path (PieChart)
  const xpByPathMap = {};
  (user.transactions || []).forEach((tx) => {
    // Example path structure: "/path/to/something"
    // Adjust indexing if yours is different
    const segments = tx.path ? tx.path.split('/') : [];
    const mainSegment = segments[2] || 'unknown';
    if (!xpByPathMap[mainSegment]) {
      xpByPathMap[mainSegment] = 0;
    }
    xpByPathMap[mainSegment] += tx.amount;
  });
  const xpByPathData = Object.entries(xpByPathMap).map(([name, value]) => ({
    name,
    value,
  }));
  const COLORS = ['#6366F1', '#DB2777', '#F97316', '#10B981', '#1D4ED8', '#9333EA'];

  //-----------------------
  //     JSX RENDERING
  //-----------------------

  return (
    <div style={styles.root}>
      {/* NAVIGATION BAR */}
      <nav style={styles.navbar}>
        <div style={styles.navWrapper}>
          <div style={styles.brandContainer}>
            <Activity style={styles.brandIcon} />
            <span style={styles.brandText}>Learning Analytics</span>
          </div>
          <div style={styles.userInfoContainer}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{user.login}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                ID: {user.id}
              </p>
            </div>
            <button onClick={logout} style={styles.logoutBtn}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Welcome header */}
          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>Welcome back, {user.login}!</h1>
            <p style={styles.welcomeSubtitle}>
              Here&apos;s your learning progress overview
            </p>
          </div>

          {/* USER INFO CARD */}
          <div style={styles.userInfoCard}>
            <h2 style={styles.userInfoTitle}>User Info</h2>
            <div style={styles.userInfoGrid}>
              <div style={styles.userInfoItem}>
                <strong>ID:</strong> {user.id}
              </div>
              <div style={styles.userInfoItem}>
                <strong>First Name:</strong> {user.firstName || 'N/A'}
              </div>
              <div style={styles.userInfoItem}>
                <strong>Last Name:</strong> {user.lastName || 'N/A'}
              </div>
              <div style={styles.userInfoItem}>
                <strong>Email:</strong> {user.email || 'N/A'}
              </div>
              <div style={styles.userInfoItem}>
                <strong>Campus:</strong> {user.campus || 'N/A'}
              </div>
            </div>
          </div>

          {/* STATS GRID */}
          <div style={styles.statsGrid}>
            {/* Total XP */}
            <div style={styles.statsCard}>
              <div style={styles.statsCardInner}>
                <div style={styles.statsCardIcon}>
                  <TrendingUp style={{ color: '#fff' }} />
                </div>
                <div>
                  <p style={styles.statsCardLabel}>Total XP</p>
                  <p style={styles.statsCardValue}>{totalXP.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Learning Hours */}
            <div style={styles.statsCard}>
              <div style={styles.statsCardInner}>
                <div style={styles.statsCardIcon}>
                  <Clock style={{ color: '#fff' }} />
                </div>
                <div>
                  <p style={styles.statsCardLabel}>Learning Hours</p>
                  <p style={styles.statsCardValue}>{learningHours}</p>
                </div>
              </div>
            </div>

            {/* Audit Ratio */}
            <div style={styles.statsCard}>
              <div style={styles.statsCardInner}>
                <div style={styles.statsCardIcon}>
                  <Award style={{ color: '#fff' }} />
                </div>
                <div>
                  <p style={styles.statsCardLabel}>Audit Stats</p>
                  <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    <span><strong>Pass:</strong> {passedAudits}</span>
                    <span><strong>Total:</strong> {totalAudits}</span>
                    <span><strong>Ratio:</strong> {auditRatio}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECENT PROJECTS (limit 5) */}
          <div style={styles.recentProjectsCard}>
            <h2 style={styles.chartTitle}>Recent Projects</h2>
            {recentProjects.length === 0 ? (
              <p>No recent projects found</p>
            ) : (
              <ul style={styles.recentProjectList}>
                {recentProjects.map((proj, i) => (
                  <li key={i} style={styles.recentProjectItem}>
                    <strong>{proj.name}</strong>
                    <span style={styles.projectMeta}>
                      (Grade: {proj.grade}, {proj.createdAt})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* CHARTS GRID */}
          <div style={styles.chartsGrid}>
            {/* XP Progress (AreaChart) */}
            <div style={styles.chartCardWide}>
              <h2 style={styles.chartTitle}>XP Progress</h2>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={xpData}>
                    <defs>
                      <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke="#6366F1"
                      fill="url(#colorXp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grade Over Time (LineChart) */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>Grade Over Time</h2>
              <div style={{ height: '300px', width: '100%' }}>
                {gradeOverTimeData.length === 0 ? (
                  <p style={{ textAlign: 'center' }}>No grade data found</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gradeOverTimeData}>
                      <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '6px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="grade"
                        stroke="#F97316"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* XP by Path (PieChart) */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>XP by Path</h2>
            <div style={{ height: '300px', width: '100%' }}>
              {xpByPathData.length === 0 ? (
                <p style={{ textAlign: 'center' }}>No XP path data found</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={xpByPathData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      fill="#6366F1"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {xpByPathData.map((_entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    color: '#111'
  },
  centeredScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingText: {
    fontSize: '24px',
    color: '#555',
    opacity: 0.8,
    animation: 'pulse 2s infinite'
  },
  errorText: {
    fontSize: '24px',
    color: 'red'
  },
  navbar: {
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #e2e8f0',
    zIndex: 50,
    height: '64px',
    display: 'flex',
    alignItems: 'center'
  },
  navWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  brandIcon: {
    width: '32px',
    height: '32px',
    color: '#6b21a8'
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #6b21a8, #6366F1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(90deg, #ef4444, #ec4899)',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  main: {
    paddingTop: '80px',
    paddingBottom: '1rem'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#1e293b'
  },
  welcomeSubtitle: {
    marginTop: '0.5rem',
    color: '#475569'
  },
  userInfoCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    marginBottom: '2rem'
  },
  userInfoTitle: {
    fontSize: '1.25rem',
    margin: '0 0 1rem',
    color: '#1e293b',
    textAlign: 'center'
  },
  userInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.5rem'
  },
  userInfoItem: {
    fontSize: '1rem',
    padding: '0.5rem 0'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statsCard: {
    transition: 'transform 0.2s'
  },
  statsCardInner: {
    background: 'linear-gradient(135deg, #6b21a8, #4c1d95)',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '1rem',
    color: '#fff',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  statsCardIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    padding: '0.5rem',
    backdropFilter: 'blur(2px)'
  },
  statsCardLabel: {
    margin: 0,
    opacity: 0.8
  },
  statsCardValue: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  recentProjectsCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    marginBottom: '2rem'
  },
  recentProjectList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  recentProjectItem: {
    marginBottom: '0.5rem'
  },
  projectMeta: {
    marginLeft: '0.5rem',
    color: '#666',
    fontSize: '0.9rem'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    marginBottom: '2rem'
  },
  chartCardWide: {
    gridColumn: '1 / -1',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem'
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    padding: '1rem',
    border: '1px solid #e2e8f0',
    marginBottom: '1rem'
  },
  chartTitle: {
    fontSize: '1.25rem',
    margin: '0 0 1rem',
    color: '#1e293b',
    textAlign: 'center'
  }
};