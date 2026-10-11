import { useEffect, useState } from 'react';
import { Check, Crown, Pencil, Trash2, UserPlus, X } from 'lucide-react';
import { ProjectAPI, UserAPI, errMsg } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDebounced } from '../utils/hooks.js';
import { formatDate } from '../utils/format.js';
import { Avatar, Button, ConfirmDialog, EmptyState } from './ui.jsx';

export default function MembersPanel({ projectId, members, isOwner, onChanged }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const query = useDebounced(email, 250);

  useEffect(() => {
    let cancelled = false;
    if (!isOwner || query.trim().length < 2 || query.includes('@') && query.includes('.')) {
      setSuggestions([]);
      return undefined;
    }
    UserAPI.search(query).then((r) => {
      if (!cancelled) setSuggestions(r.filter((u) => !members.some((m) => m.userId === u.id)));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [query, isOwner, members]);

  const add = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error('Enter the full email of a registered user'); return; }
    setAdding(true);
    try {
      await ProjectAPI.addMember(projectId, { email: email.trim(), responsibility });
      toast.success('Member added');
      setEmail(''); setResponsibility(''); setSuggestions([]);
      onChanged();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setAdding(false);
    }
  };

  const saveResponsibility = async (m) => {
    setBusy(true);
    try {
      await ProjectAPI.updateMember(projectId, m.id, { responsibility: editText });
      toast.success('Responsibility updated');
      setEditingId(null);
      onChanged();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = async () => {
    setBusy(true);
    try {
      await ProjectAPI.removeMember(projectId, removing.id);
      toast.success('Member removed');
      setRemoving(null);
      onChanged();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack">
      {isOwner && (
        <form className="card add-member" onSubmit={add}>
          <h3 className="card-title"><UserPlus size={18} /> Add a team member</h3>
          <p className="muted small">The person must already have a CampusFlow account. Start typing a name or email.</p>
          <div className="form-row">
            <div className="suggest-wrap">
              <input className="input" type="text" placeholder="Name or email of a registered user" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Member email" />
              {suggestions.length > 0 && (
                <ul className="suggest">
                  {suggestions.map((u) => (
                    <li key={u.id}><button type="button" onClick={() => { setEmail(u.email); setSuggestions([]); }}>
                      <Avatar name={u.name} size={24} /> <span>{u.name}</span> <em>{u.email}</em>
                    </button></li>
                  ))}
                </ul>
              )}
            </div>
            <input className="input" placeholder="Responsibility (e.g. Backend, Research)" value={responsibility} onChange={(e) => setResponsibility(e.target.value)} maxLength={150} aria-label="Responsibility" />
            <Button type="submit" loading={adding} icon={UserPlus}>Add</Button>
          </div>
        </form>
      )}

      <div className="card table-card">
        {members.length === 0 ? <EmptyState title="No members" /> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Member</th><th>Responsibility</th><th>Assigned</th><th>Done</th><th>Joined</th>{isOwner && <th />}</tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member-cell">
                        <Avatar name={m.name} />
                        <div>
                          <strong>{m.name} {m.role === 'OWNER' && <span className="owner-tag"><Crown size={12} /> Owner</span>}</strong>
                          <div className="muted small">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingId === m.id ? (
                        <div className="inline-edit">
                          <input className="input" value={editText} onChange={(e) => setEditText(e.target.value)} maxLength={150} autoFocus />
                          <button className="icon-btn" onClick={() => saveResponsibility(m)} disabled={busy} aria-label="Save"><Check size={16} /></button>
                          <button className="icon-btn" onClick={() => setEditingId(null)} aria-label="Cancel"><X size={16} /></button>
                        </div>
                      ) : (
                        <span>{m.responsibility || <span className="muted">—</span>}</span>
                      )}
                    </td>
                    <td>{m.assignedTasks}</td>
                    <td>{m.completedTasks}</td>
                    <td className="muted">{formatDate(m.joinedAt)}</td>
                    {isOwner && (
                      <td className="row-actions">
                        <button className="icon-btn" onClick={() => { setEditingId(m.id); setEditText(m.responsibility || ''); }} aria-label="Edit responsibility"><Pencil size={15} /></button>
                        {m.role !== 'OWNER' && <button className="icon-btn" onClick={() => setRemoving(m)} aria-label="Remove member"><Trash2 size={15} /></button>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {removing && (
        <ConfirmDialog title="Remove member" confirmLabel="Remove" loading={busy}
          message={`Remove ${removing.name} from this project? Their tasks will become unassigned.`}
          onConfirm={confirmRemove} onCancel={() => setRemoving(null)} />
      )}
    </div>
  );
}
