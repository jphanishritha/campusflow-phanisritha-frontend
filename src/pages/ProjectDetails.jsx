import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, KanbanSquare, ListChecks, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { ProjectAPI, TaskAPI, errMsg } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../utils/hooks.js';
import { PRIORITIES, TASK_STATUSES, formatDate } from '../utils/format.js';
import { Avatar, Button, ConfirmDialog, EmptyState, ErrorState, PageLoader, PriorityBadge, ProgressBar, StatusBadge } from '../components/ui.jsx';
import ProjectFormModal from '../components/ProjectFormModal.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import TaskCard from '../components/TaskCard.jsx';
import MembersPanel from '../components/MembersPanel.jsx';

const TABS = [
  { id: 'board', label: 'Board', icon: KanbanSquare },
  { id: 'list', label: 'List', icon: ListChecks },
  { id: 'team', label: 'Team', icon: Users },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const project = useFetch(() => ProjectAPI.get(id), [id]);
  const tasks = useFetch(() => ProjectAPI.tasks(id), [id]);
  const members = useFetch(() => ProjectAPI.members(id), [id]);

  const [tab, setTab] = useState('board');
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [taskModal, setTaskModal] = useState(null); // { task?, status? }
  const [editProject, setEditProject] = useState(false);
  const [confirmProject, setConfirmProject] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const refreshAll = useCallback(() => {
    project.reload(true); tasks.reload(true); members.reload(true);
  }, [project, tasks, members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (tasks.data || []).filter((t) =>
      (!priority || t.priority === priority)
      && (!assignee || (assignee === 'none' ? !t.assigneeId : String(t.assigneeId) === assignee))
      && (!q || t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)));
  }, [tasks.data, search, priority, assignee]);

  const changeStatus = async (task, status) => {
    if (task.status === status) return;
    const previous = tasks.data;
    tasks.setData(previous.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const saved = await TaskAPI.setStatus(task.id, status);
      tasks.setData((cur) => (cur || previous).map((t) => (t.id === saved.id ? saved : t)));
      project.reload(true);
    } catch (err) {
      tasks.setData(previous);
      toast.error(errMsg(err));
    }
  };

  const deleteTask = async () => {
    setBusy(true);
    try {
      await TaskAPI.remove(confirmTask.id);
      toast.success('Task deleted');
      setConfirmTask(null);
      refreshAll();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const deleteProject = async () => {
    setBusy(true);
    try {
      await ProjectAPI.remove(id);
      toast.success('Project deleted');
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
      setBusy(false);
    }
  };

  if (project.loading && !project.data) return <PageLoader label="Loading project…" />;
  if (project.error) {
    return (
      <div className="page">
        <Link to="/projects" className="back-link"><ArrowLeft size={16} /> Back to projects</Link>
        <ErrorState message={project.error} onRetry={() => project.reload()} />
      </div>
    );
  }

  const p = project.data;
  const isOwner = p.myRole === 'OWNER';
  const memberList = members.data || [];

  const onDrop = (status) => {
    const task = (tasks.data || []).find((t) => t.id === dragId);
    setDragId(null); setOverCol(null);
    if (task) changeStatus(task, status);
  };

  return (
    <div className="page">
      <Link to="/projects" className="back-link"><ArrowLeft size={16} /> Back to projects</Link>

      <div className="card project-head">
        <div className="project-head-main">
          <div className="project-head-title">
            <h1>{p.name}</h1>
            <StatusBadge status={p.status} />
          </div>
          <p className="muted">{p.description || 'No description provided.'}</p>
          <div className="project-meta">
            <span><CalendarDays size={14} /> Deadline: {formatDate(p.deadline)}</span>
            <span><Users size={14} /> {p.memberCount} members</span>
            <span><ListChecks size={14} /> {p.doneTasks}/{p.totalTasks} tasks done</span>
            {p.overdueTasks > 0 && <span className="text-danger">{p.overdueTasks} overdue</span>}
            <span>Owner: {p.ownerName}</span>
          </div>
          <div className="project-progress">
            <ProgressBar value={p.progress} height={10} /><b>{p.progress}%</b>
          </div>
        </div>
        {isOwner && (
          <div className="project-head-actions">
            <Button variant="secondary" icon={Pencil} onClick={() => setEditProject(true)}>Edit</Button>
            <Button variant="danger-outline" icon={Trash2} onClick={() => setConfirmProject(true)}>Delete</Button>
          </div>
        )}
      </div>

      <div className="tabs-row">
        <div className="tabs" role="tablist">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} role="tab" aria-selected={tab === tid} className={`tab ${tab === tid ? 'active' : ''}`} onClick={() => setTab(tid)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
        {tab !== 'team' && <Button icon={Plus} onClick={() => setTaskModal({ status: 'TODO' })}>New task</Button>}
      </div>

      {tab !== 'team' && (
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input className="input" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search tasks" />
          </div>
          <select className="input select-sm" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
            <option value="">All priorities</option>
            {PRIORITIES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
          <select className="input select-sm" value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Filter by assignee">
            <option value="">Everyone</option>
            <option value="none">Unassigned</option>
            {memberList.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
          </select>
        </div>
      )}

      {tab === 'team' && (
        members.loading && !members.data ? <PageLoader /> :
          <MembersPanel projectId={p.id} members={memberList} isOwner={isOwner} onChanged={refreshAll} />
      )}

      {tab !== 'team' && (tasks.loading && !tasks.data ? <PageLoader /> : tasks.error ? <ErrorState message={tasks.error} onRetry={() => tasks.reload()} /> : (
        tab === 'board' ? (
          <div className="kanban">
            {TASK_STATUSES.map((col) => {
              const items = filtered.filter((t) => t.status === col.value);
              return (
                <div key={col.value}
                  className={`kanban-col col-${col.value} ${overCol === col.value ? 'drag-over' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setOverCol(col.value); }}
                  onDragLeave={() => setOverCol((c) => (c === col.value ? null : c))}
                  onDrop={() => onDrop(col.value)}>
                  <div className="kanban-head">
                    <span className="kanban-title"><i className="col-dot" /> {col.label}</span>
                    <span className="count">{items.length}</span>
                    <button className="icon-btn" onClick={() => setTaskModal({ status: col.value })} aria-label={`Add task to ${col.label}`}><Plus size={16} /></button>
                  </div>
                  <div className="kanban-body">
                    {items.length === 0 && <div className="kanban-empty">Drop tasks here</div>}
                    {items.map((t) => (
                      <TaskCard key={t.id} task={t} draggable
                        onDragStart={() => setDragId(t.id)} onDragEnd={() => { setDragId(null); setOverCol(null); }}
                        onEdit={(task) => setTaskModal({ task })} onDelete={setConfirmTask} onStatus={changeStatus} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card table-card">
            {filtered.length === 0 ? (
              <EmptyState icon={ListChecks} title={(tasks.data || []).length ? 'No tasks match your filters' : 'No tasks yet'}
                text={(tasks.data || []).length ? 'Clear the search or filters to see everything.' : 'Create the first task for this project.'}
                action={!(tasks.data || []).length && <Button icon={Plus} onClick={() => setTaskModal({ status: 'TODO' })}>New task</Button>} />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th><th /></tr></thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className={t.overdue ? 'row-overdue' : ''}>
                        <td><button className="link-btn" onClick={() => setTaskModal({ task: t })}>{t.title}</button></td>
                        <td>
                          <select className="input select-sm" value={t.status} onChange={(e) => changeStatus(t, e.target.value)} aria-label="Change status">
                            {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </td>
                        <td><PriorityBadge priority={t.priority} /></td>
                        <td>{t.assigneeName ? <span className="member-cell"><Avatar name={t.assigneeName} size={24} /> {t.assigneeName}</span> : <span className="muted">Unassigned</span>}</td>
                        <td className={t.overdue ? 'text-danger' : ''}>{formatDate(t.dueDate)}{t.overdue && <b className="overdue-tag">Overdue</b>}</td>
                        <td className="row-actions">
                          <button className="icon-btn" onClick={() => setTaskModal({ task: t })} aria-label="Edit task"><Pencil size={15} /></button>
                          <button className="icon-btn" onClick={() => setConfirmTask(t)} aria-label="Delete task"><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ))}

      {taskModal && (
        <TaskFormModal projectId={p.id} task={taskModal.task} defaultStatus={taskModal.status} members={memberList}
          onClose={() => setTaskModal(null)} onSaved={() => { setTaskModal(null); refreshAll(); }} />
      )}
      {editProject && (
        <ProjectFormModal project={p} onClose={() => setEditProject(false)} onSaved={() => { setEditProject(false); refreshAll(); }} />
      )}
      {confirmTask && (
        <ConfirmDialog title="Delete task" message={`Delete "${confirmTask.title}"? This cannot be undone.`} loading={busy}
          onConfirm={deleteTask} onCancel={() => setConfirmTask(null)} />
      )}
      {confirmProject && (
        <ConfirmDialog title="Delete project" message={`Delete "${p.name}" with all of its tasks and members? This cannot be undone.`} loading={busy}
          onConfirm={deleteProject} onCancel={() => setConfirmProject(false)} />
      )}
    </div>
  );
}
