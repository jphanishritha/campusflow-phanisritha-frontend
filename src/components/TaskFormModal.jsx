import { useState } from 'react';
import { ProjectAPI, TaskAPI, errMsg, fieldErrors } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PRIORITIES, TASK_STATUSES } from '../utils/format.js';
import { Button, Field, Modal } from './ui.jsx';

export default function TaskFormModal({ projectId, task, members, defaultStatus = 'TODO', onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || defaultStatus,
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate || '',
    assigneeId: task?.assigneeId ? String(task.assigneeId) : '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return; }
    setSaving(true);
    setErrors({});
    const payload = {
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
    };
    try {
      const saved = task ? await TaskAPI.update(task.id, payload) : await ProjectAPI.createTask(projectId, payload);
      toast.success(task ? 'Task updated' : 'Task created');
      onSaved(saved);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={submit} className="form" noValidate>
        <Field label="Title" error={errors.title}>
          <input className="input" value={form.title} onChange={set('title')} maxLength={160} placeholder="What needs to be done?" autoFocus />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} maxLength={2000} />
        </Field>
        <div className="form-row">
          <Field label="Status">
            <select className="input" value={form.status} onChange={set('status')}>
              {TASK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <Field label="Priority">
            <select className="input" value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-row">
          <Field label="Due date">
            <input className="input" type="date" value={form.dueDate} onChange={set('dueDate')} />
          </Field>
          <Field label="Assignee" error={errors.assigneeId}>
            <select className="input" value={form.assigneeId} onChange={set('assigneeId')}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.userId} value={m.userId}>{m.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{task ? 'Save changes' : 'Create task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
