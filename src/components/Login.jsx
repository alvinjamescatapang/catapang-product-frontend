import { useState } from 'react';
import { ArrowUpRight, Eye, EyeOff, PackageCheck, Sparkles } from 'lucide-react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-art" aria-label="Form and Field stockroom">
        <div className="auth-art-top">
          <a className="brand brand-light" href="#"><span className="brand-mark"><PackageCheck size={19} /></span><span className="brand-name">form<span>&</span>field</span></a>
          <span className="art-edition">STOCKROOM EDITION <i>01</i></span>
        </div>
        <div className="art-caption">
          <span className="art-index"><Sparkles size={14} /> MADE FOR THE EVERYDAY</span>
          <h2>Good things,<br /><em>well kept.</em></h2>
          <p>Form & Field Stockroom</p>
        </div>
        <div className="art-bottom"><span>PHILIPPINES</span><span>EST. 2026 <i>•</i> INVENTORY DESK</span></div>
      </section>

      <section className="auth-side">
        <div className="auth-side-top"><span className="secure-mark"><PackageCheck size={16} /></span><span>STOCKROOM / ACCESS</span></div>
        <div className="auth-panel">
          <div className="auth-kicker">{mode === 'login' ? 'WELCOME BACK' : 'JOIN THE STOCKROOM'}</div>
          <h1>{mode === 'login' ? <>Sign in to your<br /><span>workspace.</span></> : <>Create your<br /><span>account.</span></>}</h1>
          <p className="auth-intro">{mode === 'login' ? 'Your inventory desk is ready when you are.' : 'Set up your account to get started.'}</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form className="auth-form" onSubmit={submit}>
            <label>Username
              <input className="field-input" value={form.username} onChange={set('username')} autoComplete="username" required autoFocus />
            </label>
            {mode === 'register' && (
              <label>Email address
                <input className="field-input" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
              </label>
            )}
            <label>Password
              <span className="password-field">
                <input className="field-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} />
                <button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}<ArrowUpRight size={17} /></button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? 'No account yet?' : 'Already registered?'}
            <a href="#" onClick={(event) => { event.preventDefault(); setError(''); setNotice(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </a>
          </p>
        </div>
        <footer className="auth-footer"><span>© 2026 FORM & FIELD</span><span>THOUGHTFULLY IN ORDER</span></footer>
      </section>
    </main>
  );
}
