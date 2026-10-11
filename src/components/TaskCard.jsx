import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { daysUntil, formatDate, TASK_STATUSES } from '../utils/format.js';
import { Avatar, PriorityBadge } from './ui.jsx';

export default function TaskCard({ task, onEdit, onDelete, onStatus, draggable = false, onDragStart, onDragEnd }) {
  const left = daysUntil(task.dueDate);
  return (
    <div className={`task-card ${task.overdue ? 'is-overdue' : ''}`} draggable={draggable}
      onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="task-card-top">
        <PriorityBadge priority={task.priority} />
        <div className="task-actions">
          <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task"><Pencil size={14} /></button>
          <button className="icon-btn" onClick={() => onDelete(task)} aria-label="Delete task"><Trash2 size={14} /></button>
        </div>
      </div>
      <button className="task-title" onClick={() => onEdit(task)}>{task.title}</button>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-foot">
        <span className={`task-due ${task.overdue ? 'text-danger' : left !== null && left <= 2 && task.status !== 'DONE' ? 'text-warn' : ''}`}>
          <CalendarDays size={13} /> {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
          {task.overdue && <b className="overdue-tag">Overdue</b>}
        </span>
        {task.assigneeName ? <Avatar name={task.assigneeName} size={24} /> : <span className="muted small">Unassigned</span>}
      </div>
      <select className="input status-select" value={task.status} onChange={(e) => onStatus(task, e.target.value)} aria-label="Change status">
        {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
    </div>
  );
}
