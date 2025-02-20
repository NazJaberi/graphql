import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useAuth } from '../utils/AuthContext'; 
import { useNavigate } from 'react-router-dom';

/* --------------------------------------------------
   NEW QUERIES (provided by your friend)
   These may overlap with existing queries, 
   but we'll include them here for completeness.
-------------------------------------------------- */
export const GET_USER = gql`
  query {
    user {
      id
      login
      email
      campus
      lastName
      firstName
      attrs(path: "gender")
    }
  }
`;

export const GET_USER_WITH_AUDIT = gql`
  query {
    user {
      id
      login
      firstName
      lastName
      auditRatio
      totalUp
      totalDown
      attrs(path: "gender")
    }
  }
`;

export const GET_XP = gql`
  query totalXP($userId: Int!, $rootEventId: Int!) {
    xp: transaction_aggregate(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        eventId: { _eq: $rootEventId }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const GET_LEVEL_INFO = gql`
  query getLevelInfo($userId: Int!, $modulePath: String!) {
    user(where: { id: { _eq: $userId } }) {
      events(where: { event: { path: { _eq: $modulePath } } }) {
        eventId
        level
        event {
          path
        }
      }
      progresses(
        where: { event: { path: { _eq: $modulePath } } }
      ) {
        grade
        isDone
        path
        object {
          name
          type
        }
      }
    }
  }
`;

export const GET_MODULE_EVENT = gql`
  query user($userId: Int!, $modulePath: String!) {
    user(where: { id: { _eq: $userId } }) {
      events(where: { event: { path: { _eq: $modulePath } } }) {
        eventId
        level
        event {
          campus
          createdAt
          endAt
          id
          path
          registrations {
            id
          }
        }
      }
    }
  }
`;

export const GET_PROJECTS_TRANSACTIONS = gql`
  query Transaction($userId: Int!, $eventId: Int!) {
    transaction(
      where: {
        type: { _eq: "xp" }
        eventId: { _eq: $eventId }
        originEventId: { _eq: $eventId }
        userId: { _eq: $userId }
      }
    ) {
      amount
      createdAt
      object {
        name
      }
    }
  }
`;

export const GET_SKILLS = gql`
  query Transaction($userId: Int!) {
    transaction(
      order_by: [{ type: desc }, { amount: desc }]
      distinct_on: [type]
      where: { userId: { _eq: $userId }, type: { _like: "skill_%" } }
    ) {
      type
      amount
    }
  }
`;

export const GET_MODULE_CHILDREN = gql`
  query Object($eventId: Int!, $registrationId: Int!) {
    object(
      where: {
        type: { _eq: "module" }
        events: { id: { _eq: $eventId } }
        registrations: { id: { _eq: $registrationId } }
      }
    ) {
      type
      name
      childrenRelation {
        attrs
        key
        paths {
          object {
            name
          }
        }
      }
    }
  }
`;

/* 
  We remove the CardDataStats/LevelCard usage for XP and audit ratio,
  and revert to the old style or better style as requested.
*/

/* --------------------------------------------------
   TABLE COMPONENT (slightly improved look)
-------------------------------------------------- */
function TableComponent({ transactions = [] }) {
  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Transaction History
      </h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">No recent transactions.</p>
      ) : (
        <div className="max-h-72 overflow-auto rounded-md border border-gray-200">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-4 py-2 font-medium">
                  Project
                </th>
                <th scope="col" className="px-4 py-2 font-medium text-center">
                  XP
                </th>
                <th scope="col" className="px-4 py-2 font-medium text-center">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((txn, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {txn.object?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-center text-green-600">
                      +{(txn.amount / 1000).toFixed(1)}kB
                    </td>
                    <td className="px-4 py-2 text-center">
                      {new Date(txn.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   OTHER EXISTING QUERIES & CODE
-------------------------------------------------- */

// Basic user info
const BASIC_INFO_QUERY = gql`
  query {
    user {
      id
      login
      firstName
      lastName
      email
      campus
    }
  }
`;

// Last Projects
const LAST_PROJECTS_QUERY = gql`
  query {
    transaction(
      where: {
        type: { _eq: "xp" }
        _and: [
          { path: { _like: "/bahrain/bh-module%" } }
          { path: { _nlike: "/bahrain/bh-module/checkpoint%" } }
          { path: { _nlike: "/bahrain/bh-module/piscine%" } }
        ]
      }
      order_by: { createdAt: desc }
      limit: 4
    ) {
      amount
      createdAt
      object {
        name
      }
    }
  }
`;

// XP
const XP_QUERY = gql`
  query xpAggregate($userId: Int!) {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
        userId: { _eq: $userId }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

// Audit
const AUDIT_RATIO_QUERY = gql`
  query {
    user {
      totalUp
      totalDown
      auditRatio
    }
  }
`;

// Skills
const SKILLS_QUERY = gql`
  query {
    user {
      transactions(
        where: { type: { _ilike: "%skill%" } }
        order_by: { amount: desc }
      ) {
        type
        amount
      }
    }
  }
`;

// Tech Skills
const TECH_SKILLS_QUERY = gql`
  query {
    user {
      transactions(where: { type: { _ilike: "%skill%" } }) {
        type
        amount
      }
    }
  }
`;

// Pending or Upcoming Projects
const PENDING_PROJECTS_QUERY = gql`
  query {
    progress(
      where: {
        grade: { _is_null: true }
        path: { _like: "/bahrain/bh-module%" }
      }
      order_by: { updatedAt: desc }
      limit: 5
    ) {
      id
      object {
        name
      }
    }
  }
`;

function SkillsRadar({ skills }) {
  if (!skills || skills.length === 0) {
    return <p style={styles.infoText}>No skills data available.</p>;
  }

  const size = 320;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.3;
  const maxAmount = Math.max(...skills.map((s) => s.amount));

  const points = skills.map((skill, i) => {
    const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
    const value = (skill.amount / maxAmount) * radius;
    return {
      x: centerX + value * Math.cos(angle),
      y: centerY + value * Math.sin(angle),
      label: skill.type.replace('skill_', ''),
      amount: skill.amount,
    };
  });

  const polygonPath =
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
    ' Z';

  const circles = [0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
    <circle
      key={scale}
      cx={centerX}
      cy={centerY}
      r={radius * scale}
      fill="none"
      stroke="#D1D5DB"
      strokeWidth="1"
    />
  ));

  const lines = points.map((_, i) => {
    const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
    return (
      <line
        key={i}
        x1={centerX}
        y1={centerY}
        x2={centerX + radius * Math.cos(angle)}
        y2={centerY + radius * Math.sin(angle)}
        stroke="#D1D5DB"
        strokeWidth="1"
      />
    );
  });

  const skillPoints = points.map((p, i) => (
    <circle key={i} cx={p.x} cy={p.y} r="4" fill="#F97316" />
  ));

  const labels = points.map((p, i) => {
    const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
    const labelRadius = radius + 30;
    const labelX = centerX + labelRadius * Math.cos(angle);
    const labelY = centerY + labelRadius * Math.sin(angle);
    let textAnchor = 'start';
    if (angle < -Math.PI / 2 || angle > Math.PI / 2) {
      textAnchor = 'end';
    } else if (Math.abs(angle) === Math.PI / 2) {
      textAnchor = 'middle';
    }
    return (
      <text
        key={i}
        x={labelX}
        y={labelY}
        textAnchor={textAnchor}
        style={styles.radarLabel}
        dominantBaseline="middle"
      >
        {p.label}
      </text>
    );
  });

  return (
    <div style={styles.radarContainer}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={styles.radarSvg}
      >
        {circles}
        {lines}
        <path
          d={polygonPath}
          fill="rgba(249,115,22,0.2)"
          stroke="#F97316"
          strokeWidth="2"
        />
        {skillPoints}
        {labels}
      </svg>
      <div style={styles.radarValues}>
        {skills.map((skill, idx) => (
          <div
            key={idx}
            style={{ fontSize: '0.9rem', marginBottom: '4px' }}
          >
            <strong>{skill.type.replace('skill_', '')}</strong>: {skill.amount}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechSkillsBarChart({ skills }) {
  if (!skills || skills.length === 0) {
    return <p style={styles.infoText}>No tech skills available.</p>;
  }

  const totalHeight = 300;
  const barWidth = 40;
  const gap = 20;
  const maxBarHeight = 200;
  const maxAmount = Math.max(...skills.map((s) => s.amount), 1);
  const scale = maxBarHeight / maxAmount;
  const svgWidth = skills.length * (barWidth + gap);

  return (
    <div style={styles.barContainer}>
      <svg
        width={svgWidth}
        height={totalHeight}
        viewBox={`0 0 ${svgWidth} ${totalHeight}`}
        style={styles.barSvg}
      >
        {skills.map((skill, i) => {
          const barHeight = skill.amount * scale;
          const barX = i * (barWidth + gap);
          const barY = 20 + (maxBarHeight - barHeight);

          return (
            <g key={i}>
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#8B5CF6"
                rx="3"
              />
              <text
                x={barX + barWidth / 2}
                y={barY - 5}
                textAnchor="middle"
                fill="#111827"
                fontSize="13"
                fontWeight="bold"
              >
                {skill.amount}
              </text>
              <text
                x={barX + barWidth / 2}
                y={maxBarHeight + 35}
                textAnchor="middle"
                fill="#111827"
                fontSize="12"
              >
                {skill.skill}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  /* Queries for user data */
  const {
    data: basicInfoData,
    loading: basicInfoLoading,
    error: basicInfoError,
  } = useQuery(BASIC_INFO_QUERY);

  const {
    data: lastProjectsData,
    loading: lastProjectsLoading,
    error: lastProjectsError,
  } = useQuery(LAST_PROJECTS_QUERY);

  const userId = parseInt(basicInfoData?.user?.[0]?.id || 0, 10);

  const {
    data: xpData,
    loading: xpLoading,
    error: xpError,
  } = useQuery(XP_QUERY, {
    variables: { userId },
    skip: !userId,
  });

  const {
    data: auditData,
    loading: auditLoading,
    error: auditError,
  } = useQuery(AUDIT_RATIO_QUERY);

  const {
    data: skillsData,
    loading: skillsLoading,
    error: skillsError,
  } = useQuery(SKILLS_QUERY);

  const {
    data: techSkillsData,
    loading: techLoading,
    error: techError,
  } = useQuery(TECH_SKILLS_QUERY);

  const {
    data: pendingData,
    loading: pendingLoading,
    error: pendingError,
  } = useQuery(PENDING_PROJECTS_QUERY);

  // Combine loadings
  const isLoading =
    basicInfoLoading ||
    lastProjectsLoading ||
    xpLoading ||
    auditLoading ||
    skillsLoading ||
    techLoading ||
    pendingLoading;

  // Combine errors
  const anyError =
    basicInfoError ||
    lastProjectsError ||
    xpError ||
    auditError ||
    skillsError ||
    techError ||
    pendingError;

  if (isLoading) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (anyError) {
    return (
      <div style={styles.centeredScreen}>
        <div style={styles.errorText}>
          Error:{' '}
          {basicInfoError?.message ||
            lastProjectsError?.message ||
            xpError?.message ||
            auditError?.message ||
            skillsError?.message ||
            techError?.message ||
            pendingError?.message ||
            'Unknown error'}
        </div>
      </div>
    );
  }

  // Data extraction
  const user = basicInfoData?.user?.[0] || {};
  const transactionsForLastProjects = lastProjectsData?.transaction || [];
  const totalXP = xpData?.transaction_aggregate?.aggregate?.sum?.amount || 0;
  const { totalUp = 0, totalDown = 0, auditRatio } = auditData?.user?.[0] || {};
  const ratio = (auditRatio ?? 0).toFixed(2);
  const upMB = (totalUp / 1000000).toFixed(2);
  const downMB = (totalDown / 1000000).toFixed(2);

  const rawSkills = skillsData?.user?.[0]?.transactions || [];
  const uniqueSkills = rawSkills.reduce((acc, curr) => {
    if (!acc.some((skill) => skill.type === curr.type)) {
      acc.push(curr);
    }
    return acc;
  }, []);
  const displayedSkills = uniqueSkills.slice(0, 6);

  const transactions = techSkillsData?.user?.[0]?.transactions || [];
  const techKeys = {
    go: 'skill_go',
    javascript: 'skill_js',
    html: 'skill_html',
    css: 'skill_css',
    unix: 'skill_unix',
    docker: 'skill_docker',
    sql: 'skill_sql',
  };
  const techSkills = Object.entries(techKeys).map(([key, skillType]) => {
    const skillObj = transactions.find((t) => t.type === skillType);
    return {
      skill: key.toUpperCase(),
      amount: skillObj ? skillObj.amount : 0,
    };
  });

  // Pending/upcoming projects
  const pendingProjects = pendingData?.progress || [];

  // Format XP
  let xpDisplayValue;
  let xpUnit;
  if (totalXP >= 1000000) {
    xpDisplayValue = (totalXP / 1000000).toFixed(2);
    xpUnit = 'MB';
  } else {
    xpDisplayValue = Math.round(totalXP / 1000);
    xpUnit = 'kB';
  }

  // XP progression
  const nextThreshold = 100000;
  const xpProgressRatio = Math.min(totalXP / nextThreshold, 1);

  // Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.root}>
      <nav style={styles.navbar}>
        <div style={styles.navWrapper}>
          <div style={styles.brandContainer}>
            <div style={styles.brandIconPlaceholder}>R</div>
            <span style={styles.brandText}>reboot01</span>
          </div>
          <div style={styles.navRight}>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Welcome, {user.login || 'User'}!</h1>
            <p style={styles.subtitle}>Here’s your profile overview</p>
          </div>

          {/* Basic user info */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>User Basic Info</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <strong>ID:</strong> {user.id ?? 'N/A'}
              </div>
              <div style={styles.infoItem}>
                <strong>Login:</strong> {user.login ?? 'N/A'}
              </div>
              <div style={styles.infoItem}>
                <strong>First Name:</strong> {user.firstName ?? 'N/A'}
              </div>
              <div style={styles.infoItem}>
                <strong>Last Name:</strong> {user.lastName ?? 'N/A'}
              </div>
              <div style={styles.infoItem}>
                <strong>Email:</strong> {user.email ?? 'N/A'}
              </div>
              <div style={styles.infoItem}>
                <strong>Campus:</strong> {user.campus ?? 'N/A'}
              </div>
            </div>
          </div>

          {/* Pending or Upcoming Projects */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Pending / Upcoming Projects</h2>
            {pendingProjects.length > 0 ? (
              <ul style={styles.projectList}>
                {pendingProjects.map((item) => (
                  <li key={item.id} style={styles.projectItem}>
                    {item.object?.name || 'Unknown'}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.infoText}>No pending projects found.</p>
            )}
          </div>

          {/* Last Projects & Transactions */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Last Projects & Transactions</h2>
            <TableComponent transactions={transactionsForLastProjects} />
          </div>

          {/* XP (reverting to old style) */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>XP</h2>
            <div style={styles.xpWrapper}>
              <div style={styles.xpValue}>{xpDisplayValue}</div>
              <div style={styles.xpUnit}>{xpUnit}</div>
            </div>
            <div style={styles.progressBarContainer}>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${xpProgressRatio * 100}%`,
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginTop: '0.5rem',
                }}
              >
                {Math.round(xpProgressRatio * 100)}% of {nextThreshold} XP
              </p>
            </div>
          </div>

          {/* Audit Ratio (reverting to old style, but keep extra text) */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Audit Ratio</h2>
            <p style={styles.infoText}>
              (Remember: Done is totalUp, Received is totalDown, ratio is 
              <strong> {ratio}</strong>)
            </p>
            <div style={styles.auditWrapper}>
              <div style={styles.auditBlock}>
                <p style={styles.auditLabel}>
                  Done: <span style={{ color: '#2563EB' }}>{upMB} MB</span>
                </p>
                <div style={styles.auditBarBg}>
                  <div
                    style={{
                      ...styles.auditBarFill,
                      width: totalUp
                        ? `${(totalUp / Math.max(totalUp, totalDown, 1)) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
              <div style={styles.auditBlock}>
                <p style={styles.auditLabel}>
                  Received: <span style={{ color: '#2563EB' }}>{downMB} MB</span>
                </p>
                <div style={styles.auditBarBg}>
                  <div
                    style={{
                      ...styles.auditBarFill,
                      width: totalDown
                        ? `${(totalDown / Math.max(totalUp, totalDown, 1)) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
              <div style={styles.auditRatioText}>Ratio: {ratio}</div>
            </div>
          </div>

          {/* Skills Radar */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Skills Radar</h2>
            <SkillsRadar skills={displayedSkills} />
          </div>

          {/* Tech Skills Bar Chart */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Tech Skills Bar Chart</h2>
            <TechSkillsBarChart skills={techSkills} />
          </div>

          {/* Remove the LevelCard at the bottom */}
        </div>
      </main>
    </div>
  );
}

export default Profile;

const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#FAFAFA',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    color: '#111',
  },
  centeredScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    fontSize: '24px',
    color: '#555',
  },
  errorText: {
    fontSize: '18px',
    color: '#DC2626',
    textAlign: 'center',
    padding: '1rem',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: '#FFF',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderBottom: '1px solid #E5E7EB',
    zIndex: 50,
    height: '64px',
    display: 'flex',
    alignItems: 'center',
  },
  navWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandIconPlaceholder: {
    width: '32px',
    height: '32px',
    backgroundColor: '#06B6D4',
    borderRadius: '50%',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #06B6D4, #9333EA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  main: {
    paddingTop: '80px',
    paddingBottom: '1rem',
  },
  container: {
    maxWidth: '1024px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#374151',
  },
  subtitle: {
    marginTop: '0.5rem',
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    padding: '1rem',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    margin: '0 0 1rem',
    color: '#1F2937',
    textAlign: 'center',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  infoItem: {
    fontSize: '0.95rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '0.5rem',
    backgroundColor: '#fff',
  },
  projectList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  projectItem: {
    margin: '0.5rem 0',
    padding: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  infoText: {
    margin: '0.5rem 0',
    color: '#6B7280',
  },
  xpWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  xpValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#EC4899',
  },
  xpUnit: {
    fontSize: '0.9rem',
    color: '#6B7280',
  },
  progressBarContainer: {
    marginTop: '1rem',
  },
  progressBarBg: {
    width: '100%',
    height: '10px',
    backgroundColor: '#E5E7EB',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '10px',
    backgroundColor: '#EC4899',
    borderRadius: '6px',
    transition: 'width 0.3s ease-in-out',
  },
  auditWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  auditBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  auditLabel: {
    margin: '0 0 0.25rem',
    fontWeight: '500',
  },
  auditBarBg: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: '6px',
    height: '8px',
    overflow: 'hidden',
  },
  auditBarFill: {
    backgroundColor: '#F97316',
    height: '8px',
    borderRadius: '6px',
  },
  auditRatioText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#F97316',
    marginTop: '0.5rem',
  },
  radarContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  radarSvg: {
    flexShrink: 0,
  },
  radarLabel: {
    fontSize: '0.75rem',
    fill: '#374151',
  },
  radarValues: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.95rem',
  },
  barContainer: {
    overflowX: 'auto',
    textAlign: 'center',
  },
  barSvg: {
    margin: '0 auto',
    display: 'block',
  },
};