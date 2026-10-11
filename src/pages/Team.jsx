import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { InsightAPI, TaskAPI } from '../api/client.js';
import { useFetch } from '../utils/hooks.js';
import { formatDate } from '../utils/format.js';
import { Avatar, EmptyState, ErrorState, PageLoader, PriorityBadge, StatusBadge } from '../components/ui.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Team() {
  const { user } = useAuth();
  const team = useFetch(() => InsightAPI.team(), []);
  const mine = useFetch(() => TaskAPI.mine(), []);

  if (team.loading || mine.loading) return <PageLoader label="Loading team…" />;
  if (team.error) return <ErrorState message={team.error} onRetry={team.reload} />;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="muted">Everyone you collaborate with across your projects, and the work assigned to you.</p>
        </div>
      </div>

      {team.data.length === 0 ? (
        <div className="card"><EmptyState icon={Users} title="No teammates yet" text="Create a project and add registered users to see your team here."
          action={<Link to="/projects?new=1" className="btn btn-primary">Create a project</Link>} /></div>
      ) : (
        <div className="cards-grid">
          {team.data.map((m) => (
            <div className="card member-card" key={m.userId}>
              <div className="member-card-head">
                <Avatar name={m.name} size={44} />
                <div>
                  <strong>{m.name}{m.userId === user.id ? ' (you)' : ''}</strong>
                  <div className="muted small">{m.email}</div>
                </div>
              </div>
              <div className="chips">
                {m.projects.map((p) => <span className="chip" key={p}>{p}</span>)}
              </div>
              {m.responsibilities.length > 0 && <p className="small"><b>Responsibilities:</b> {m.responsibilities.join(', ')}</p>}
              <div className="mini-stats">
                <div><b>{m.assignedTasks}</b><span>Assigned</span></div>
                <div><b>{m.openTasks}</b><span>Open</span></div>
                <div><b>{m.completedTasks}</b><span>Done</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="card table-card">
        <h3 className="card-title pad">Tasks assigned to me</h3>
        {mine.error ? <ErrorState message={mine.error} onRetry={mine.reload} /> : mine.data.length === 0 ? (
          <EmptyState title="Nothing assigned to you" text="Tasks assigned to you will appear here." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead>
              <tbody>
                {mine.data.map((t) => (
                  <tr key={t.id} className={t.overdue ? 'row-overdue' : ''}>
                    <td><Link className="link-btn" to={`/projects/${t.projectId}`}>{t.title}</Link></td>
                    <td className="muted">{t.projectName}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td className={t.overdue ? 'text-danger' : ''}>{formatDate(t.dueDate)}{t.overdue && <b className="overdue-tag">Overdue</b>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
