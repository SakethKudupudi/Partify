import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState('customer');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success('Login successful!');

        // Redirect based on role
        const role = data.user?.role;
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'vendor') {
          navigate('/vendor');
        } else if (role === 'customer') {
          navigate('/');
        } else {
          toast.error('Invalid user role');
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, role })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Account created successfully! Please login.');
        setIsSignup(false);
        setPassword('');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f7'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '8px', color: '#1d1d1f' }}>Partify</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>
          {isSignup ? 'Create your account' : 'Sign in to your account'}
        </p>

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
          {isSignup && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Type</label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={loading}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '16px' }}
            disabled={loading}
          >
            {loading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setPassword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
              disabled={loading}
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignup && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: '1.8',
              color: '#666'
            }}>
              <strong style={{ color: '#1d1d1f' }}>Test Accounts:</strong><br/>
              <br/>
              <div style={{ marginBottom: '8px' }}>
                <strong>Admin:</strong><br/>
                admin@test.com
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Vendor:</strong><br/>
                vendor@test.com
              </div>
              <div>
                <strong>Customer:</strong><br/>
                customer@test.com
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

