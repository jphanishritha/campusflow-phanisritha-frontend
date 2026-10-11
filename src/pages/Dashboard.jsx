import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlarmClock, CalendarClock, CheckCircle2, FolderKanban, FolderOpen, ListTodo, Plus } from 'lucide-react';
import { InsightAPI } from '../api/client.js';
import { useFetch } from '../utils/hooks.js';
import { daysUntil, formatDate, timeAgo } from '../utils/format.js';
import { EmptyState, ErrorState, PageLoader, PriorityBadge, ProgressBar, StatCard } from '../components/ui.jsx';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(() => InsightAPI.dashboard(), []);

  if (loading) return <PageLoader label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const d = data;
  if (d.totalProjects === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="card">
          <EmptyState icon={FolderOpen} title="No projects yet" text="Create your first project to start adding tasks and tracking progress."
            action={<Link to="/projects?new=1" className="btn btn-primary"><Plus size={16} /> Create a project</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">Your work across all projects at a glance.</p>
        </div>
        <Link to="/projects" className="btn btn-secondary">View projects</Link>
      </div>

      <div className="stats-grid">
        <StatCard icon={FolderKanban} label="Total projects" value={d.totalProjects} tone="indigo" />
        <StatCard icon={Activity} label="Active projects" value={d.activeProjects} tone="violet" />
        <StatCard icon={ListTodo} label="Pending tasks" value={d.pendingTasks} tone="cyan" />
        <StatCard icon={CheckCircle2} label="Completed tasks" value={d.completedTasks} tone="green" />
        <StatCard icon={AlarmClock} label="Overdue tasks" value={d.overdueTasks} tone="red" />
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="card-title">Weekly productivity</h3>
          <p className="muted small">Tasks created vs completed in the last 7 days</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.weeklyProductivity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7f0" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="created" name="Created" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h3 className="card-title">Project progress</h3>
          <p className="muted small">Share of tasks completed per project</p>
          <div className="progress-list">
            {d.projectProgress.map((p) => (
              <Link to={`/projects/${p.projectId}`} className="progress-row" key={p.projectId}>
                <div className="progress-row-head"><span>{p.name}</span><b>{p.progress}%</b></div>
                <ProgressBar value={p.progress} />
                <span className="muted small">{p.done} of {p.total} tasks done</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="card-title"><CalendarClock size={18} /> Upcoming deadlines</h3>
          <p className="muted small">Next 14 days</p>
          {d.upcomingDeadlines.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing due soon" text="You are all caught up for the next two weeks." />
          ) : (
            <ul className="list">
              {d.upcomingDeadlines.map((x) => {
                const left = daysUntil(x.dueDate);
                return (
                  <li key={`${x.type}-${x.id}`}>
                    <Link to={`/projects/${x.projectId}`} className="list-row">
                      <div>
                        <strong>{x.title}</strong>
                        <div className="muted small">{x.type === 'PROJECT' ? 'Project deadline' : x.projectName}</div>
                      </div>
                      <div className="list-right">
                        {x.priority && <PriorityBadge priority={x.priority} />}
                        <span className={`due ${left <= 1 ? 'due-soon' : ''}`}>{left === 0 ? 'Today' : left === 1 ? 'Tomorrow' : formatDate(x.dueDate)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <h3 className="card-title"><Activity size={18} /> Recent activity</h3>
          {d.recentActivity.length === 0 ? (
            <EmptyState icon={Activity} title="No activity yet" text="Actions in your projects will show up here." />
          ) : (
            <ul className="timeline">
              {d.recentActivity.map((a) => (
                <li key={a.id}>
                  <span className="dot" />
                  <div>
                    <div>{a.message}</div>
                    <div className="muted small">{a.projectName} · {timeAgo(a.createdAt)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
