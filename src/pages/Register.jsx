import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg, fieldErrors } from '../api/client.js';
import { Button, Field, Logo } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created. Welcome to CampusFlow!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors((prev) => ({ ...prev, ...fieldErrors(err) }));
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <Link to="/" className="auth-logo"><Logo /></Link>
        <h1>Create your account</h1>
        <p className="muted">Start organising your projects in under a minute.</p>
        <form onSubmit={submit} className="form" noValidate>
          <Field label="Full name" error={errors.name}>
            <input className="input" autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" autoFocus />
          </Field>
          <Field label="Email" error={errors.email}>
            <input className="input" type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" />
          </Field>
          <Field label="Password" error={errors.password} hint="At least 8 characters">
            <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <input className="input" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
          </Field>
          <Button type="submit" loading={loading} icon={UserPlus} className="btn-block">Create account</Button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
