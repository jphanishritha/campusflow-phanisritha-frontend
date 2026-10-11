import { useState } from 'react';
import { ProjectAPI, errMsg, fieldErrors } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { PROJECT_STATUSES } from '../utils/format.js';
import { Button, Field, Modal } from './ui.jsx';

export default function ProjectFormModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    deadline: project?.deadline || '',
    status: project?.status || 'ACTIVE',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Project name is required' }); return; }
    setSaving(true);
    setErrors({});
    const payload = { ...form, name: form.name.trim(), deadline: form.deadline || null };
    try {
      const saved = project ? await ProjectAPI.update(project.id, payload) : await ProjectAPI.create(payload);
      toast.success(project ? 'Project updated' : 'Project created');
      onSaved(saved);
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={project ? 'Edit project' : 'New project'} onClose={onClose}>
      <form onSubmit={submit} className="form" noValidate>
        <Field label="Project name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} maxLength={120} placeholder="e.g. Final-year capstone" autoFocus />
        </Field>
        <Field label="Description" error={errors.description}>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} maxLength={2000} placeholder="What is this project about?" />
        </Field>
        <div className="form-row">
          <Field label="Deadline" error={errors.deadline}>
            <input className="input" type="date" value={form.deadline} onChange={set('deadline')} />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set('status')}>
              {PROJECT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{project ? 'Save changes' : 'Create project'}</Button>
        </div>
      </form>
    </Modal>
  );
}
