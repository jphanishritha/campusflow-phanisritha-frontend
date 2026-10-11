import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, CheckCircle2, Clock, Gauge, ListTodo, TriangleAlert } from 'lucide-react';
import { InsightAPI } from '../api/client.js';
import { useFetch } from '../utils/hooks.js';
import { PRIORITIES, TASK_STATUSES, labelOf } from '../utils/format.js';
import { EmptyState, ErrorState, PageLoader, StatCard } from '../components/ui.jsx';

const STATUS_COLORS = { TODO: '#94a3b8', IN_PROGRESS: '#06b6d4', DONE: '#4f46e5' };
const PRIO_COLORS = { LOW: '#06b6d4', MEDIUM: '#4f46e5', HIGH: '#7c3aed', URGENT: '#e11d48' };
const grid = <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7f0" />;

export default function Analytics() {
  const { data, loading, error, reload } = useFetch(() => InsightAPI.analytics(), []);
  if (loading) return <PageLoader label="Crunching your numbers…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const a = data;
  if (a.totalTasks === 0) {
    return (
      <div className="page">
        <h1 className="page-title">Productivity analytics</h1>
        <div className="card"><EmptyState icon={BarChart3} title="No data to analyse yet" text="Create projects and tasks. Charts appear as soon as you have task data." /></div>
      </div>
    );
  }

  const statusData = a.tasksByStatus.map((x) => ({ ...x, label: labelOf(TASK_STATUSES, x.name) }));
  const prioData = a.tasksByPriority.map((x) => ({ ...x, label: labelOf(PRIORITIES, x.name) }));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Productivity analytics</h1>
          <p className="muted">Calculated live from your saved tasks.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={ListTodo} label="Total tasks" value={a.totalTasks} tone="indigo" />
        <StatCard icon={CheckCircle2} label="Completed" value={a.completedTasks} tone="green" />
        <StatCard icon={Gauge} label="Completion rate" value={`${a.completionRate}%`} tone="violet" />
        <StatCard icon={TriangleAlert} label="Overdue" value={a.overdueTasks} tone="red" />
        <StatCard icon={Clock} label="Avg. days to finish" value={a.avgCompletionDays ?? '—'} tone="cyan" />
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="card-title">Tasks by status</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statusData.map((x) => <Cell key={x.name} fill={STATUS_COLORS[x.name]} />)}
                </Pie>
                <Tooltip /><Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card">
          <h3 className="card-title">Tasks by priority</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prioData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                {grid}
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                  {prioData.map((x) => <Cell key={x.name} fill={PRIO_COLORS[x.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="card-title">Last 14 days</h3>
          <p className="muted small">Tasks created and completed per day</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.last14Days.map((d) => ({ ...d, label: d.date.slice(5) }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                {grid}
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip /><Legend iconType="circle" />
                <Area type="monotone" dataKey="created" name="Created" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="card">
          <h3 className="card-title">Weekly trend</h3>
          <p className="muted small">Last 8 weeks (weeks start Monday)</p>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.weekly} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                {grid}
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.06)' }} /><Legend iconType="circle" />
                <Bar dataKey="created" name="Created" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="card-title">Workload by member</h3>
          {a.workload.length === 0 ? <EmptyState title="No assigned tasks" text="Assign tasks to members to compare workloads." /> : (
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.workload} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7f0" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip cursor={{ fill: 'rgba(99,102,241,0.06)' }} /><Legend iconType="circle" />
                  <Bar dataKey="done" name="Done" stackId="w" fill="#4f46e5" />
                  <Bar dataKey="open" name="Open" stackId="w" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
        <section className="card">
          <h3 className="card-title">Project progress</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.projectProgress} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                {grid}
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} interval={0} tickFormatter={(v) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)} />
                <YAxis domain={[0, 100]} unit="%" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(v) => `${v}%`} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="progress" name="Progress" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
