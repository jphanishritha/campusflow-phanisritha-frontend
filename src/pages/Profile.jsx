import { useState } from 'react';
import { KeyRound, LogOut, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI, errMsg, fieldErrors } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/format.js';
import { Avatar, Button, Field } from '../components/ui.jsx';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (pw.newPassword) {
      if (!pw.currentPassword) errs.currentPassword = 'Enter your current password';
      if (pw.newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters';
      if (pw.newPassword !== pw.confirm) errs.confirm = 'Passwords do not match';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      const updated = await AuthAPI.updateMe({
        name: name.trim(),
        currentPassword: pw.currentPassword || null,
        newPassword: pw.newPassword || null,
      });
      setUser(updated);
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Profile updated');
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page narrow">
      <h1 className="page-title">Profile</h1>
      <div className="card profile-head">
        <Avatar name={user.name} size={64} />
        <div>
          <h2>{user.name}</h2>
          <div className="muted">{user.email}</div>
          <div className="muted small">Member since {formatDate(user.createdAt)}</div>
        </div>
      </div>

      <form className="card form" onSubmit={submit} noValidate>
        <h3 className="card-title">Account details</h3>
        <Field label="Full name" error={errors.name}>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
        </Field>
        <Field label="Email" hint="Your email is your login and cannot be changed.">
          <input className="input" value={user.email} disabled />
        </Field>

        <h3 className="card-title"><KeyRound size={18} /> Change password</h3>
        <p className="muted small">Leave blank to keep your current password.</p>
        <Field label="Current password" error={errors.currentPassword}>
          <input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        </Field>
        <div className="form-row">
          <Field label="New password" error={errors.newPassword}>
            <input className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </Field>
        </div>
        <div className="form-actions">
          <Button type="button" variant="secondary" icon={LogOut} onClick={() => { logout(); navigate('/login', { replace: true }); }}>Log out</Button>
          <Button type="submit" icon={Save} loading={saving}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
