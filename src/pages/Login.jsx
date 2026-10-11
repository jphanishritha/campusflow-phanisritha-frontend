import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../api/client.js';
import { Button, Field, Logo } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <Link to="/" className="auth-logo"><Logo /></Link>
        <h1>Welcome back</h1>
        <p className="muted">Log in to continue to your workspace.</p>
        <form onSubmit={submit} className="form" noValidate>
          <Field label="Email" error={errors.email}>
            <input className="input" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" autoFocus />
          </Field>
          <Field label="Password" error={errors.password}>
            <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
          </Field>
          <Button type="submit" loading={loading} icon={LogIn} className="btn-block">Log in</Button>
        </form>
        <p className="auth-switch">New to CampusFlow? <Link to="/register">Create an account</Link></p>
      </div>
    </div>
  );
}
