import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assests/portinify_logo.png';
import { 
  HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash, 
  HiArrowRight, HiOutlineDocumentText, HiOutlineGlobeAlt, HiOutlineSparkles, 
  HiOutlineStar 
} from 'react-icons/hi2';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80'
  ];

  return (
    <div className="login-split-container">
      {/* LEFT COLUMN: BRANDING & FEATURES */}
      <div className="login-left-panel">
        <div className="login-left-header">
          <img src={logoImg} alt="Portinity Logo" className="login-brand-logo" />
          <span className="login-brand-name">Portinity</span>
        </div>

        <div className="login-left-body">
          <div className="login-badge">
            <span className="sparkle-emoji">✨</span> AI-Powered Career Platform
          </div>

          <h1 className="login-left-title">
            Build Your Career.<br />
            Showcase Your <span className="highlight-text">Potential.</span>
          </h1>

          <p className="login-left-subtitle">
            Create ATS-optimized resumes, beautiful portfolios, and stand out in your career journey.
          </p>

          {/* Features List */}
          <div className="login-features-list">
            <div className="login-feature-item">
              <div className="login-feature-icon-box purple">
                <HiOutlineDocumentText />
              </div>
              <div className="login-feature-text">
                <h3>AI Resume Builder</h3>
                <p>Create ATS-friendly resumes in minutes</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon-box blue">
                <HiOutlineGlobeAlt />
              </div>
              <div className="login-feature-text">
                <h3>Portfolio Builder</h3>
                <p>Build stunning portfolios that showcase your work</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon-box green">
                <HiOutlineSparkles />
              </div>
              <div className="login-feature-text">
                <h3>Smart Suggestions</h3>
                <p>AI-powered insights to improve your profile</p>
              </div>
            </div>

            <div className="login-feature-item">
              <div className="login-feature-icon-box orange">
                <HiOutlineStar />
              </div>
              <div className="login-feature-text">
                <h3>Professional Templates</h3>
                <p>Choose from recruiter-approved templates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTER FORM */}
      <div className="login-right-panel">
        <div className="login-right-top-nav">
          <span>Already have an account?</span>
          <Link to="/login" className="register-link">Sign in</Link>
        </div>

        <div className="login-form-wrapper">
          <div className="login-card-v2">
            <h2 className="login-card-title">Create your account</h2>
            <p className="login-card-subtitle">Start building your professional profile</p>

            {error && <div className="login-error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form-v2">
              {/* Email field */}
              <div className="login-input-group-v2">
                <label className="login-input-label-v2">Email address</label>
                <div className="login-input-wrapper-v2">
                  <HiOutlineEnvelope className="login-input-prefix-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="login-input-field-v2"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="login-input-group-v2">
                <label className="login-input-label-v2">Password</label>
                <div className="login-input-wrapper-v2">
                  <HiOutlineLockClosed className="login-input-prefix-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="login-input-field-v2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle-btn"
                  >
                    {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="login-input-group-v2">
                <label className="login-input-label-v2">Confirm Password</label>
                <div className="login-input-wrapper-v2">
                  <HiOutlineLockClosed className="login-input-prefix-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="login-input-field-v2"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="login-password-toggle-btn"
                  >
                    {showConfirmPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              {/* Submit Create Account Button */}
              <button type="submit" disabled={loading} className="login-submit-btn-v2">
                {loading ? 'Creating Account...' : 'Create Account'}
                <HiArrowRight className="login-btn-arrow-icon" />
              </button>
            </form>

            <div className="login-terms-text">
              By registering, you agree to our <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
            </div>
          </div>

          {/* Social Proof Ratings Footer */}
          <div className="login-social-proof">
            <p className="social-proof-desc">Trusted by 10,000+ students and professionals</p>
            <div className="social-proof-row">
              <div className="social-avatars-group">
                {avatars.map((url, i) => (
                  <img key={i} src={url} alt={`User review ${i+1}`} className="social-avatar-img" />
                ))}
              </div>
              <div className="social-ratings-info">
                <span className="rating-score">4.9/5</span>
                <div className="rating-stars">
                  <HiOutlineStar className="star-icon filled" />
                  <HiOutlineStar className="star-icon filled" />
                  <HiOutlineStar className="star-icon filled" />
                  <HiOutlineStar className="star-icon filled" />
                  <HiOutlineStar className="star-icon filled" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
