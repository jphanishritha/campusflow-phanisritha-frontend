import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, FolderKanban, ListChecks, Plus, Search, Users } from 'lucide-react';
import { ProjectAPI } from '../api/client.js';
import { useDebounced, useFetch } from '../utils/hooks.js';
import { PROJECT_STATUSES, daysUntil, formatDate } from '../utils/format.js';
import { Button, EmptyState, ErrorState, PageLoader, ProgressBar, StatusBadge } from '../components/ui.jsx';
import ProjectFormModal from '../components/ProjectFormModal.jsx';

export default function Projects() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(params.get('new') === '1');
  const debounced = useDebounced(search);

  const { data, loading, error, reload } = useFetch(
    () => ProjectAPI.list({ search: debounced || undefined, status: status || undefined }),
    [debounced, status],
  );

  useEffect(() => {
    if (params.get('new') === '1') {
      setShowForm(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const filtering = useMemo(() => Boolean(debounced || status), [debounced, status]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="muted">Everything you own or collaborate on.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm(true)}>New project</Button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input className="input" placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search projects" />
        </div>
        <select className="input select-sm" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : data.length === 0 ? (
        <div className="card">
          <EmptyState icon={FolderKanban}
            title={filtering ? 'No matching projects' : 'No projects yet'}
            text={filtering ? 'Try a different search or status filter.' : 'Create a project to start planning tasks with your team.'}
            action={!filtering && <Button icon={Plus} onClick={() => setShowForm(true)}>Create project</Button>} />
        </div>
      ) : (
        <div className="cards-grid">
          {data.map((p) => {
            const left = daysUntil(p.deadline);
            return (
              <Link to={`/projects/${p.id}`} className="card project-card" key={p.id}>
                <div className="project-card-head">
                  <h3>{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="project-desc">{p.description || 'No description'}</p>
                <div className="progress-row-head"><span className="muted small">Progress</span><b>{p.progress}%</b></div>
                <ProgressBar value={p.progress} />
                <div className="project-meta">
                  <span><ListChecks size={14} /> {p.doneTasks}/{p.totalTasks} tasks</span>
                  <span><Users size={14} /> {p.memberCount}</span>
                  <span className={left !== null && left < 0 && p.status !== 'COMPLETED' ? 'text-danger' : ''}>
                    <CalendarDays size={14} /> {formatDate(p.deadline)}
                  </span>
                </div>
                {p.overdueTasks > 0 && <span className="badge prio-URGENT">{p.overdueTasks} overdue</span>}
              </Link>
            );
          })}
        </div>
      )}

      {showForm && (
        <ProjectFormModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); reload(); }} />
      )}
    </div>
  );
}
