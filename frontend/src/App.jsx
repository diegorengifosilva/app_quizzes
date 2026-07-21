import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import axios from 'axios';
import XLSX from 'xlsx-js-style';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Trophy, Play, LogOut, Plus, QrCode, Users, BookOpen, 
  ArrowRight, Clock, ArrowLeft, Check, X, Award, 
  Sparkles, CheckCircle, AlertCircle, Settings, ShieldAlert,
  Trash2, Download, User, Lock, Image, Upload
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8010/api';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import avatar1 from './avatar/avatar 1.gif';
import avatar2 from './avatar/avatar 2.gif';
import avatar3 from './avatar/avatar 3.gif';
import avatar4 from './avatar/avatar 4.gif';
import avatar5 from './avatar/avatar 5.gif';
import avatar6 from './avatar/avatar 6.gif';
import avatar7 from './avatar/avatar 7.gif';
import avatar8 from './avatar/avatar 8.gif';
import avatar9 from './avatar/avatar 9.gif';

const AVATARS = [
  { id: 'avatar 1.gif', src: avatar1, label: 'GIF 1' },
  { id: 'avatar 2.gif', src: avatar2, label: 'GIF 2' },
  { id: 'avatar 3.gif', src: avatar3, label: 'GIF 3' },
  { id: 'avatar 4.gif', src: avatar4, label: 'GIF 4' },
  { id: 'avatar 5.gif', src: avatar5, label: 'GIF 5' },
  { id: 'avatar 6.gif', src: avatar6, label: 'GIF 6' },
  { id: 'avatar 7.gif', src: avatar7, label: 'GIF 7' },
  { id: 'avatar 8.gif', src: avatar8, label: 'GIF 8' },
  { id: 'avatar 9.gif', src: avatar9, label: 'GIF 9' }
];



const getRandomAvatarSrc = (username, fallbackName) => {
  const seed = username || fallbackName || 'default';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATARS.length;
  return AVATARS[index].src;
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const AREAS_GROUPED = [
  {
    label: 'Operaciones e Ingeniería',
    options: [
      { value: 'Industria', label: 'Industria' },
      { value: 'Mineria', label: 'Minería' },
      { value: 'Mantenimiento', label: 'Mantenimiento' },
      { value: 'Petroquimica', label: 'Petroquímica' },
      { value: 'Seguridad Maquinaria', label: 'Seguridad de Maquinaria' }
    ]
  },
  {
    label: 'Administración y Finanzas',
    options: [
      { value: 'Administracion', label: 'Administración' },
      { value: 'Contabilidad', label: 'Contabilidad' },
      { value: 'Recursos Humanos', label: 'Recursos Humanos' },
      { value: 'Gerencia General', label: 'Gerencia General' }
    ]
  },
  {
    label: 'Especialidades y Tecnología',
    options: [
      { value: 'SIG HESQ', label: 'SIG. HESQ' },
      { value: 'TI', label: 'Tecnologías de la Información (TI)' }
    ]
  },
  {
    label: 'Comercial y Logística',
    options: [
      { value: 'Comercial', label: 'Comercial' },
      { value: 'Logistica Almacen', label: 'Logística - Almacén' }
    ]
  }
];

// Configurar interceptor de Axios para incluir JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- COMPONENTES AUXILIARES ---

function Navbar({ user, onLogout, onUserUpdate }) {
  const location = useLocation();
  const isCapacitadorPath = location.pathname.startsWith('/admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Edit fields
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load user data into edit fields when modal opens
  useEffect(() => {
    if (user) {
      setEditNombre(user.nombre || '');
      setEditCorreo(user.correo || '');
      setEditArea(user.area || '');
    }
  }, [user, showEditModal]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/auth/profile/update/`, {
        nombre: editNombre,
        correo: editCorreo,
        area: editArea
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onUserUpdate(res.data.user);
      setShowEditModal(false);
      alert('Perfil actualizado con éxito');
    } catch (err) {
      setEditError(err.response?.data?.error || 'Error al actualizar el perfil.');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/auth/profile/password/`, {
        password: newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess('Contraseña cambiada con éxito.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Error al cambiar la contraseña.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <BookOpen size={28} className="text-secondary" />
          <span>CORPORATE<span>QUIZ</span></span>
        </Link>
        <div className="user-nav">
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {isCapacitadorPath ? (
                <Link to="/" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <Play size={16} className="text-secondary" /> <span className="nav-btn-text">Responder Quizzes</span>
                </Link>
              ) : (
                <Link to="/admin" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <Settings size={16} /> <span className="nav-btn-text">Modo Capacitador</span>
                </Link>
              )}

              {/* Profile Pill with Dropdown Menu */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.6rem', 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderRadius: 'var(--radius-full)', 
                    padding: '0.4rem 1.2rem', 
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: dropdownOpen ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none',
                    borderColor: dropdownOpen ? 'var(--secondary)' : 'rgba(255,255,255,0.08)'
                  }}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--secondary), var(--primary))', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    color: 'white'
                  }}>
                    {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.2', color: 'var(--text-primary)' }}>{user.nombre}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.7, color: 'var(--text-secondary)' }}>{user.area_display || user.area}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', opacity: 0.6, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▼</span>
                </div>

                {dropdownOpen && (
                  <>
                    <div 
                      onClick={() => setDropdownOpen(false)} 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                    />
                    <div 
                      className="glass-panel" 
                      style={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: '120%', 
                        width: '220px', 
                        padding: '0.6rem 0', 
                        zIndex: 999, 
                        animation: 'fade-in 0.2s ease',
                        boxShadow: 'var(--shadow-lg)',
                        background: '#17183b',
                        borderColor: 'rgba(255,255,255,0.12)'
                      }}
                    >
                      <button 
                        onClick={() => { setShowEditModal(true); setDropdownOpen(false); }}
                        style={{ 
                          width: '100%', 
                          background: 'none', 
                          border: 'none', 
                          padding: '0.6rem 1.2rem', 
                          textAlign: 'left', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.6rem',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <User size={15} style={{ color: 'var(--secondary)' }} />
                        Ver / Editar Datos
                      </button>
                      <button 
                        onClick={() => { setShowPasswordModal(true); setDropdownOpen(false); }}
                        style={{ 
                          width: '100%', 
                          background: 'none', 
                          border: 'none', 
                          padding: '0.6rem 1.2rem', 
                          textAlign: 'left', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.6rem',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <Lock size={15} style={{ color: 'var(--secondary)' }} />
                        Cambiar Contraseña
                      </button>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.4rem 0' }} />
                      <button 
                        onClick={() => { onLogout(); setDropdownOpen(false); }}
                        style={{ 
                          width: '100%', 
                          background: 'none', 
                          border: 'none', 
                          padding: '0.6rem 1.2rem', 
                          textAlign: 'left', 
                          color: '#fca5a5', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.6rem',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        <LogOut size={15} />
                        Salir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>Registrarse</Link>
            </>
          )}
        </div>
      </div>

      {/* Profile edit modal */}
      {showEditModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,16,38,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative', background: '#1e2049' }}>
            <button 
              type="button"
              onClick={() => setShowEditModal(false)}
              style={{ position: 'absolute', right: '1.2rem', top: '1.2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} className="text-secondary" /> Editar Datos de Perfil
            </h3>
            {editError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{editError}</span>
              </div>
            )}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Nombre Completo</label>
                <input type="text" required className="form-input" style={{ width: '100%' }} value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Correo Electrónico</label>
                <input type="email" required className="form-input" style={{ width: '100%' }} value={editCorreo} onChange={(e) => setEditCorreo(e.target.value.trim())} placeholder="jperez@vc-corporation.com" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Área / Departamento</label>
                <select className="form-select" style={{ width: '100%' }} value={editArea} onChange={(e) => setEditArea(e.target.value)}>
                  {AREAS_GROUPED.map((group, idx) => (
                    <optgroup key={idx} label={group.label}>
                      {group.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={editLoading} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Password edit modal */}
      {showPasswordModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15,16,38,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '480px', position: 'relative', background: '#1e2049' }}>
            <button 
              type="button"
              onClick={() => setShowPasswordModal(false)}
              style={{ position: 'absolute', right: '1.2rem', top: '1.2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={22} className="text-secondary" /> Cambiar Contraseña
            </h3>
            {passwordError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--success)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                <CheckCircle size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label className="form-label">Nueva Contraseña</label>
                <input type="password" required className="form-input" style={{ width: '100%' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirmar Contraseña</label>
                <input type="password" required className="form-input" style={{ width: '100%' }} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={passwordLoading} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                  {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

// --- VISTAS: AUTENTICACIÓN ---

function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login/`, { usuario, password });
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
      
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError('Credenciales inválidas. Revisa tu usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Iniciar Sesión</h2>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre completo o Usuario</label>
            <input type="text" required className="form-input" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="Ej: Juan Pérez o jperez" />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Contraseña</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--secondary)', textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Iniciando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailOrUser, setEmailOrUser] = useState('');
  const [codigo, setCodigo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/password-reset/request/`, {
        email_or_user: emailOrUser
      });
      setMessage(res.data.message);
      if (res.data.debug_code) {
        console.log("Código generado (Modo Debug Local):", res.data.debug_code);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (codigo.trim().length !== 5) {
      setError('El código debe tener 5 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/password-reset/confirm/`, {
        email_or_user: emailOrUser,
        codigo: codigo.trim(),
        new_password: newPassword
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Recuperar Contraseña</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {step === 1 
            ? 'Ingresa tu correo o nombre de usuario para recibir un código de 5 dígitos.'
            : 'Ingresa el código de 5 dígitos enviado a tu correo y tu nueva contraseña.'}
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--success)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <CheckCircle size={20} />
            <span>{message}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div className="form-group">
              <label className="form-label">Correo Electrónico o Nombre de Usuario</label>
              <input
                type="text"
                required
                className="form-input"
                value={emailOrUser}
                onChange={(e) => setEmailOrUser(e.target.value)}
                placeholder="ejemplo@correo.com o usuario"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Enviando código...' : 'Enviar Código de 5 Dígitos'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset}>
            <div className="form-group">
              <label className="form-label">Código de 5 Dígitos</label>
              <input
                type="text"
                maxLength={5}
                required
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 'bold' }}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="12345"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input
                type="password"
                required
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                required
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
            <button 
              type="button" 
              onClick={() => { setStep(1); setError(''); setMessage(''); }}
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Volver / Solicitar nuevo código
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 'bold' }}>
            ← Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function Register({ onLoginSuccess }) {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [correo, setCorreo] = useState('');
  const [area, setArea] = useState('Industria');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Registro
      await axios.post(`${API_BASE_URL}/auth/register/`, { 
        nombre, 
        usuario,
        correo,
        area, 
        password
      });
      // 2. Login automático
      const res = await axios.post(`${API_BASE_URL}/auth/login/`, { usuario, password });
      localStorage.setItem('token', res.data.access);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
      
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        navigate(redirectTo);
      } else {
        navigate('/admin');
      }
    } catch (err) {
      if (err.response?.data?.usuario) {
        setError('El nombre de usuario ingresado ya existe.');
      } else if (err.response?.data?.correo) {
        setError('El correo electrónico ingresado ya está registrado.');
      } else {
        setError(err.response?.data?.error || 'Error al registrar. Por favor verifica los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Registro de Colaborador</h2>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input type="text" required className="form-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez" />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre de Usuario (Login)</label>
            <input type="text" required className="form-input" value={usuario} onChange={(e) => setUsuario(e.target.value.trim())} placeholder="Ej: jperez" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input type="email" required className="form-input" value={correo} onChange={(e) => setCorreo(e.target.value.trim())} placeholder="Ej: jperez@vc-corporation.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Área / Departamento</label>
            <select className="form-select" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS_GROUPED.map((group, idx) => (
                <optgroup key={idx} label={group.label}>
                  {group.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" required className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Creando cuenta...' : 'Registrarse y Comenzar'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}

// --- VISTAS: COLABORADOR ---

function Home({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [errorBusqueda, setErrorBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE_URL}/quizzes/active/`)
        .then(res => setQuizzes(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleBuscarQuiz = async (e) => {
    e.preventDefault();
    if (!codigoIngresado.trim()) return;
    setErrorBusqueda('');
    try {
      const res = await axios.get(`${API_BASE_URL}/quizzes/join/${codigoIngresado.toUpperCase()}/`);
      navigate(`/quiz/${res.data.codigo_acceso}`);
    } catch (err) {
      setErrorBusqueda('Código de acceso no válido o cuestionario inactivo.');
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ textAlign: 'center', margin: '1.5rem 0 2rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Demuestra tu Conocimiento
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          Participa en las evaluaciones de la empresa, responde preguntas en tiempo real y compite por los primeros lugares del ranking.
        </p>

        {/* Buscador de código de acceso */}
        <form onSubmit={handleBuscarQuiz} style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', maxWidth: '500px', margin: '0 auto' }}>
          <input type="text" className="form-input" style={{ width: '250px', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em' }} placeholder="CÓDIGO DE ACCESO" value={codigoIngresado} onChange={(e) => setCodigoIngresado(e.target.value)} />
          <button type="submit" className="btn btn-secondary">
            Ingresar <ArrowRight size={20} />
          </button>
        </form>
        {errorBusqueda && <p style={{ color: 'var(--danger)', marginTop: '0.8rem', fontSize: '0.9rem' }}>{errorBusqueda}</p>}
      </div>

      {user ? (
        <div>
          <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Cuestionarios Disponibles</h2>
          {quizzes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <Award size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Por el momento no hay cuestionarios publicados de acceso general.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ingresa un código de acceso proporcionado por el presentador en la parte superior.</p>
            </div>
          ) : (
            <div className="grid-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="tag-badge tag-badge-primary" style={{ marginBottom: '0.8rem' }}>Código: {quiz.codigo_acceso}</span>
                    <h3 style={{ marginBottom: '0.8rem' }}>{quiz.titulo}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                      {quiz.descripcion || 'Sin descripción disponible.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Clock size={16} />
                      <span>{quiz.tiempo_limite > 0 ? `${quiz.tiempo_limite} min` : 'Sin tiempo'}</span>
                    </div>
                    <Link to={`/quiz/${quiz.codigo_acceso}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                      Entrar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h3>¿Listo para participar?</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
            Para poder registrar tu calificación y competir en el Ranking de áreas, por favor inicia sesión o crea una cuenta de colaborador.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link>
            <Link to="/register" className="btn btn-primary">Registrarse ahora</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizWelcome({ user }) {
  const { code } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/quizzes/join/${code}/`)
      .then(res => {
        setQuiz(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('El cuestionario no está disponible o el código es incorrecto.');
        setLoading(false);
      });
  }, [code]);

  const handleStart = async () => {
    if (!user) {
      // Redirigir al registro/login con el parámetro de redirección
      navigate(`/register?redirect=/quiz/${code}`);
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/quizzes/${quiz.id}/start/`);
      // Redirigir a la interfaz de juego pasando el intento_id en state
      navigate(`/quiz/${code}/play`, { state: { intentoId: res.data.intento_id, quizData: res.data.quiz } });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar el cuestionario. Por favor intenta de nuevo.');
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando información...</div>;
  
  if (error) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1.2rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>¡Ups! Ocurrió un error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
          <Link to="/" className="btn btn-outline"><ArrowLeft size={16} /> Volver al Inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <Sparkles size={48} className="text-secondary" style={{ marginBottom: '1rem', animation: 'pulse-glow 2s infinite' }} />
        <h1 style={{ marginBottom: '1rem' }}>{quiz.titulo}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          {quiz.descripcion || 'Bienvenido a esta evaluación corporativa. ¡Da tu mejor esfuerzo!'}
        </p>

        <div className="grid-2" style={{ margin: '0 auto 2.5rem auto', maxWidth: '400px', backgroundColor: 'rgba(15,16,38,0.4)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PREGUNTAS</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{quiz.total_preguntas}</span>
          </div>
          <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TIEMPO LÍMITE</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
              {quiz.tiempo_limite > 0 ? `${quiz.tiempo_limite} min` : 'Sin Límite'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button onClick={handleStart} className="btn btn-primary" style={{ width: '100%', maxWidth: '300px', padding: '1rem 2rem', fontSize: '1.2rem' }}>
            <Play size={20} /> {user ? 'Comenzar Ahora' : 'Registrarse y Comenzar'}
          </button>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}

function StarRating({ value, onChange }) {
  const [hoverVal, setHoverVal] = useState(null);
  
  return (
    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', margin: '0.8rem 0' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hoverVal !== null ? star <= hoverVal : star <= value);
        return (
          <span
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverVal(star)}
            onMouseLeave={() => setHoverVal(null)}
            style={{
              cursor: 'pointer',
              fontSize: '2.2rem',
              color: active ? '#f59e0b' : 'rgba(255, 255, 255, 0.15)',
              filter: active ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' : 'none',
              transition: 'all 0.15s ease',
              userSelect: 'none'
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

function QuizPlay() {
  const { code } = useParams();
  const navigate = useNavigate();
  // Obtener parámetros enviados por el state del router
  const [intentoId, setIntentoId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({}); // { pregunta_id: opcion_id }
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // en segundos

  // Estados para la encuesta de satisfacción del Google Form
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);
  const [feedbackTema, setFeedbackTema] = useState(0);
  const [feedbackCapacitador, setFeedbackCapacitador] = useState(0);
  const [feedbackComprension, setFeedbackComprension] = useState(0);
  const [feedbackMateriales, setFeedbackMateriales] = useState(0);
  const [feedbackConexion, setFeedbackConexion] = useState(0);
  const [feedbackExpectativas, setFeedbackExpectativas] = useState('');
  const [feedbackAplicacion, setFeedbackAplicacion] = useState('');
  const [feedbackComentarios, setFeedbackComentarios] = useState('');

  // Cargar datos del state al iniciar
  useEffect(() => {
    // Si no tenemos la data en el state del history, redirigimos
    if (window.history.state && window.history.state.usr) {
      const state = window.history.state.usr;
      if (state.intentoId && state.quizData) {
        setIntentoId(state.intentoId);
        setQuiz(state.quizData);
        if (state.quizData.tiempo_limite > 0) {
          setTimeLeft(state.quizData.tiempo_limite * 60);
        }
        return;
      }
    }
    navigate(`/quiz/${code}`);
  }, [code, navigate]);

  // Manejar el temporizador
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit(); // Auto enviar cuando expira el tiempo
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  if (!quiz) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Iniciando evaluación...</div>;

  const currentPregunta = quiz.preguntas[currentIdx];
  const progressPercent = quiz.preguntas.length > 0 ? ((currentIdx + 1) / quiz.preguntas.length) * 100 : 0;

  const handleSelectOption = async (preguntaId, opcionId) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: opcionId
    });

    try {
      await axios.post(`${API_BASE_URL}/quizzes/${intentoId}/submit-answer/`, {
        pregunta_id: preguntaId,
        opcion_id: opcionId
      });
    } catch (err) {
      console.error("Error al registrar respuesta en tiempo real:", err);
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.preguntas.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async (feedbackData = {}) => {
    setSending(true);
    // Convertir el objeto de respuestas a una lista
    const respuestasPayload = Object.keys(respuestas).map(pId => ({
      pregunta_id: parseInt(pId),
      opcion_id: respuestas[pId]
    }));

    try {
      const res = await axios.post(`${API_BASE_URL}/quizzes/${intentoId}/submit/`, {
        respuestas: respuestasPayload,
        ...feedbackData
      });
      // Lanzar confeti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      // Redirigir a los resultados pasando los detalles en state
      navigate(`/quiz/${code}/leaderboard`, { 
        state: { 
          resultado: res.data,
          puntajeObtenido: res.data.intento.puntaje,
          puestoObtenido: res.data.puesto,
          totalParticipantes: res.data.total_participantes,
          quizData: quiz
        } 
      });
    } catch (err) {
      console.error(err);
      alert('Hubo un problema al enviar tus respuestas. Por favor intenta de nuevo.');
      setSending(false);
    }
  };

  const handleFinalSubmit = () => {
    handleSubmit({
      feedback_capacitacion_score: feedbackCapacitador, // Keep for legacy support
      feedback_preguntas_score: feedbackTema, // Keep for legacy support
      feedback_tema_score: feedbackTema,
      feedback_capacitador_score: feedbackCapacitador,
      feedback_comprension_score: feedbackComprension,
      feedback_materiales_score: feedbackMateriales,
      feedback_conexion_score: feedbackConexion,
      feedback_expectativas: feedbackExpectativas,
      feedback_aplicacion: feedbackAplicacion,
      feedback_comentarios: feedbackComentarios
    });
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (isShowingFeedback) {
    const renderRatingRow = (label, value, onChange) => {
      const options = [
        { label: 'Excelente', val: 5 },
        { label: 'Muy Bueno', val: 4 },
        { label: 'Bueno', val: 3 },
        { label: 'Regular', val: 2 },
        { label: 'Malo', val: 1 }
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '1rem' }}>
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
            {options.map((opt) => {
              const isSelected = value === opt.val;
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onChange(opt.val)}
                  className={`option-button ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '0.4rem 0.2rem',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    justifyContent: 'center',
                    borderColor: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.06)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.01)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem'
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{opt.val}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const isSubmitDisabled = 
      sending || 
      feedbackTema === 0 || 
      feedbackCapacitador === 0 || 
      feedbackComprension === 0 || 
      feedbackMateriales === 0 || 
      feedbackConexion === 0 || 
      feedbackExpectativas === '' || 
      feedbackAplicacion === '';

    return (
      <div className="main-content animate-fade-in" style={{ maxWidth: '850px', margin: '2rem auto' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Award size={48} className="text-secondary" style={{ marginBottom: '1rem', color: 'var(--secondary)', display: 'inline-block' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>¡Cuestionario Completado!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Antes de ver tus resultados detallados, por favor ayúdanos a responder esta breve encuesta.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            {/* I. CALIFICACIÓN GENERAL */}
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                I. Calificación General
              </h3>
              {renderRatingRow('Tema', feedbackTema, setFeedbackTema)}
              {renderRatingRow('Capacitador', feedbackCapacitador, setFeedbackCapacitador)}
              {renderRatingRow('Comprensión', feedbackComprension, setFeedbackComprension)}
              {renderRatingRow('Materiales', feedbackMateriales, setFeedbackMateriales)}
              {renderRatingRow('Medio de Conexión', feedbackConexion, setFeedbackConexion)}
            </div>

            {/* II. ¿CUMPLIÓ EXPECTATIVAS? */}
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                II. ¿Cumplió Expectativas?
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {['Si', 'No'].map((opt) => {
                  const isSelected = feedbackExpectativas === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFeedbackExpectativas(opt)}
                      className={`option-button ${isSelected ? 'selected' : ''}`}
                      style={{
                        flex: 1,
                        padding: '0.8rem',
                        justifyContent: 'center',
                        borderColor: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* III. APLICACIÓN DEL CONOCIMIENTO */}
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                III. Aplicación del Conocimiento
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  'Se Aplica Regularmente',
                  'Se Aplica Escasamente',
                  'No se Aplica',
                  'Se Prevé Aplicar a Futuro'
                ].map((opt) => {
                  const isSelected = feedbackAplicacion === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFeedbackAplicacion(opt)}
                      className={`option-button ${isSelected ? 'selected' : ''}`}
                      style={{
                        padding: '0.8rem 1.2rem',
                        justifyContent: 'flex-start',
                        borderColor: isSelected ? 'var(--secondary)' : 'rgba(255,255,255,0.08)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.01)'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* IV. COMENTARIOS */}
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                IV. Comentarios
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                Sus comentarios son importantes, por favor envíe sus aportes a <a href="mailto:calidad@vc-corporation.com" style={{ color: 'var(--secondary)', textDecoration: 'none', fontWeight: 'bold' }}>calidad@vc-corporation.com</a> <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>(de pruebas temporalmente a diego.rengifo@vc-corporation.com)</span>
              </p>
              <textarea 
                className="form-textarea" 
                rows={3} 
                placeholder="Escribe aquí algún comentario o sugerencia adicional (opcional)..." 
                value={feedbackComentarios}
                onChange={(e) => setFeedbackComentarios(e.target.value)}
                style={{ padding: '0.8rem', fontSize: '0.95rem', resize: 'vertical', width: '100%', minHeight: '120px', display: 'block' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              type="button"
              onClick={() => setIsShowingFeedback(false)} 
              className="btn btn-outline" 
              disabled={sending}
              style={{ padding: '0.7rem 1.5rem', fontSize: '0.95rem' }}
            >
              <ArrowLeft size={16} /> Regresar
            </button>
            <button 
              type="button"
              onClick={handleFinalSubmit} 
              className="btn btn-secondary pulse-glow" 
              disabled={isSubmitDisabled}
              style={{ padding: '0.7rem 2rem', fontSize: '1rem' }}
            >
              {sending ? 'Enviando...' : 'Enviar y Finalizar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      {/* Header del juego */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
          Pregunta {currentIdx + 1} de {quiz.preguntas.length}
        </span>
        {timeLeft !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeLeft < 30 ? 'var(--danger)' : 'var(--warning)', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: 'rgba(15,16,38,0.4)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
            <Clock size={18} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Barra de Progreso */}
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Tarjeta de Pregunta */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: currentPregunta?.imagen ? '1.2rem' : '2rem', lineHeight: '1.4' }}>
          {currentPregunta?.texto}
        </h2>

        {currentPregunta?.imagen && (
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <img 
              src={currentPregunta.imagen} 
              alt="Imagen ilustrativa" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '380px', 
                borderRadius: 'var(--radius-md)', 
                objectFit: 'contain', 
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }} 
              onClick={() => window.open(currentPregunta.imagen, '_blank')}
              title="Clic para abrir en una pestaña nueva"
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentPregunta?.opciones.map((opcion, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = respuestas[currentPregunta.id] === opcion.id;
            return (
              <button
                key={opcion.id}
                onClick={() => handleSelectOption(currentPregunta.id, opcion.id)}
                className={`option-button ${isSelected ? 'selected' : ''}`}
                disabled={sending}
              >
                <span className="option-badge">{letter}</span>
                <span>{opcion.texto}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botones de navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handlePrev} disabled={currentIdx === 0 || sending} className="btn btn-outline">
          <ArrowLeft size={18} /> Anterior
        </button>
        
        {currentIdx < quiz.preguntas.length - 1 ? (
          <button 
            onClick={handleNext} 
            disabled={!respuestas[currentPregunta?.id] || sending} 
            className="btn btn-primary"
          >
            Siguiente <ArrowRight size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setIsShowingFeedback(true)} 
            disabled={!respuestas[currentPregunta?.id] || sending} 
            className="btn btn-secondary pulse-glow"
            style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}
          >
            Siguiente (Encuesta) <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function QuizLeaderboard() {
  const { code } = useParams();
  const [ranking, setRanking] = useState(null);
  const [quizInfo, setQuizInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userResult, setUserResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  // Intentar capturar resultados inmediatos del juego (si venimos de enviar las respuestas)
  useEffect(() => {
    if (window.history.state && window.history.state.usr) {
      const state = window.history.state.usr;
      if (state.resultado) {
        setUserResult(state);
      }
    }
  }, []);

  const fetchRankings = () => {
    axios.get(`${API_BASE_URL}/quizzes/join/${code}/`)
      .then(res => {
        setQuizInfo(res.data);
        return axios.get(`${API_BASE_URL}/quizzes/${res.data.id}/ranking/`);
      })
      .then(res => {
        setRanking(res.data);
        if (res.data.mi_intento) {
          setUserResult({
            resultado: res.data.mi_intento,
            puntajeObtenido: res.data.mi_intento.intento.puntaje,
            puestoObtenido: res.data.mi_intento.puesto,
            totalParticipantes: res.data.mi_intento.total_participantes,
            quizData: { preguntas: res.data.mi_intento.preguntas }
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRankings();
  }, [code]);

  if (loading) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando Leaderboard...</div>;

  const podium1 = ranking?.ranking_individual[0];
  const podium2 = ranking?.ranking_individual[1];
  const podium3 = ranking?.ranking_individual[2];
  const listRest = ranking?.ranking_individual.slice(3) || [];

  return (
    <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <h1 style={{ fontSize: '2rem' }}>Leaderboard: {quizInfo?.titulo}</h1>
        </div>
        <button onClick={fetchRankings} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
          Actualizar Tabla
        </button>
      </div>

      {/* Tarjeta de resultado personal (si acaba de terminar el test o ya tiene un intento registrado) */}
      {userResult && (() => {
        const totalPreguntas = userResult.quizData?.preguntas?.length || 0;
        const respuestasDetalles = userResult.resultado?.respuestas_detalles || [];
        const correctas = respuestasDetalles.filter(r => r.es_correcta).length;
        const incorrectas = totalPreguntas - correctas;
        const precision = totalPreguntas > 0 ? Math.round((correctas / totalPreguntas) * 100) : 0;

        return (
          <div className="glass-panel pulse-glow" style={{ padding: '2rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--success)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(30, 32, 73, 0.6))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                  <CheckCircle size={22} />
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Evaluación Completada</span>
                </div>
                <h3 style={{ marginTop: '0.5rem' }}>¡Excelente esfuerzo, {window.JSON.parse(localStorage.getItem('user'))?.nombre}!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Tus respuestas han sido evaluadas en el servidor corporativo.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '2rem', paddingRight: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TU PUNTAJE</span>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{userResult.puntajeObtenido}</span>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '2rem' }}>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PUESTO</span>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>
                    #{userResult.puestoObtenido} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {userResult.totalParticipantes}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1.5rem 0' }}></div>

            {/* Botón para desplegar la revisión */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowReview(!showReview)} 
                className="btn btn-outline" 
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem', gap: '0.6rem', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {showReview ? (
                  <>Ocultar Revisión Detallada <ArrowLeft size={16} style={{ transform: 'rotate(270deg)', transition: 'transform 0.3s' }} /></>
                ) : (
                  <>Ver Revisión Detallada <ArrowRight size={16} style={{ transform: 'rotate(90deg)', transition: 'transform 0.3s' }} /></>
                )}
              </button>
            </div>

            {showReview && (
              <div className="animate-fade-in" style={{ marginTop: '1.5rem' }}>
                {/* Cuadrícula de Métricas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.2rem 1rem', textAlign: 'center', background: 'rgba(30, 32, 73, 0.4)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Preguntas</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{totalPreguntas}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.2rem 1rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Correctas</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>{correctas}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.2rem 1rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Incorrectas</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)' }}>{incorrectas}</span>
                  </div>
                  <div className="glass-panel" style={{ padding: '1.2rem 1rem', textAlign: 'center', background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Precisión</span>
                    <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{precision}%</span>
                  </div>
                </div>

                {/* Lista de Preguntas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    Revisión de Preguntas
                  </h4>
                  {userResult.quizData?.preguntas?.map((preg, idx) => {
                    const respDetalle = respuestasDetalles.find(r => r.pregunta_id === preg.id) || {};
                    const esCorrecta = respDetalle.es_correcta;
                    const seleccionadaId = respDetalle.opcion_seleccionada_id;
                    const correctaId = respDetalle.opcion_correcta_id;

                    return (
                      <div 
                        key={preg.id} 
                        className="glass-panel animate-fade-in" 
                        style={{ 
                          padding: '1.5rem', 
                          background: 'rgba(15, 16, 38, 0.4)', 
                          borderColor: esCorrecta ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                          borderLeft: `4px solid ${esCorrecta ? 'var(--success)' : 'var(--danger)'}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
                          <h5 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1, lineHeight: '1.4' }}>
                            {idx + 1}. {preg.texto}
                          </h5>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.4rem', 
                            padding: '0.3rem 0.8rem', 
                            borderRadius: 'var(--radius-full)', 
                            fontSize: '0.8rem', 
                            fontWeight: 'bold',
                            background: esCorrecta ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: esCorrecta ? 'var(--success)' : 'var(--danger)',
                            border: `1px solid ${esCorrecta ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {esCorrecta ? (
                              <><Check size={14} /> Correcta (+{preg.puntos} pts)</>
                            ) : (
                              <><X size={14} /> Incorrecta (0 pts)</>
                            )}
                          </span>
                        </div>

                        {preg.imagen && (
                          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                            <img 
                              src={preg.imagen} 
                              alt={`Pregunta ${idx + 1}`} 
                              style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: 'var(--radius-sm)', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                          </div>
                        )}

                        {/* Opciones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          {preg.opciones?.map((opc, opcIdx) => {
                            const letter = String.fromCharCode(65 + opcIdx);
                            const isCorrectOption = opc.id === correctaId || opc.es_correcta;
                            const isSelectedOption = opc.id === seleccionadaId;

                            let opcStyle = {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.8rem 1.2rem',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.95rem',
                              border: '2px solid rgba(255, 255, 255, 0.05)',
                              background: 'rgba(30, 32, 73, 0.3)',
                              position: 'relative',
                              transition: 'all var(--transition-fast)'
                            };

                            if (isCorrectOption) {
                              opcStyle.borderColor = 'var(--success)';
                              opcStyle.background = 'rgba(16, 185, 129, 0.1)';
                            } else if (isSelectedOption && !esCorrecta) {
                              opcStyle.borderColor = 'var(--danger)';
                              opcStyle.background = 'rgba(239, 68, 68, 0.1)';
                            }

                            return (
                              <div key={opc.id} style={opcStyle}>
                                <div className="option-badge" style={{ 
                                  background: isCorrectOption 
                                    ? 'var(--success)' 
                                    : isSelectedOption 
                                      ? 'var(--danger)' 
                                      : 'rgba(15, 16, 38, 0.5)',
                                  borderColor: isCorrectOption 
                                    ? 'var(--success)' 
                                    : isSelectedOption 
                                      ? 'var(--danger)' 
                                      : 'var(--border-color)',
                                  color: (isCorrectOption || isSelectedOption) ? '#0f1026' : 'var(--text-primary)',
                                  width: '26px',
                                  height: '26px',
                                  fontSize: '0.85rem'
                                }}>
                                  {letter}
                                </div>
                                <span style={{ flex: 1, color: (isCorrectOption || isSelectedOption) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {opc.texto}
                                </span>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  {isSelectedOption && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: 'var(--radius-sm)',
                                      background: esCorrecta ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                      color: esCorrecta ? 'var(--success)' : 'var(--danger)',
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.02em'
                                    }}>
                                      Tu elección
                                    </span>
                                  )}
                                  {isCorrectOption && !isSelectedOption && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: 'var(--radius-sm)',
                                      background: 'rgba(16, 185, 129, 0.2)',
                                      color: 'var(--success)',
                                      fontWeight: 'bold',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.02em'
                                    }}>
                                      Correcta
                                    </span>
                                  )}
                                  {isCorrectOption ? (
                                    <Check size={16} style={{ color: 'var(--success)' }} />
                                  ) : isSelectedOption && !esCorrecta ? (
                                    <X size={16} style={{ color: 'var(--danger)' }} />
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {ranking?.ranking_individual.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Trophy size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
          <h3>Aún no hay puntuaciones registradas</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Sé el primero en completar la evaluación y liderar la tabla.</p>
        </div>
      ) : (
        <div className="dashboard-sub-grid">
          {/* Columna de Ranking Individual */}
          <div>
            {/* Podium para los Top 3 */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
              <div className="podium-container">
                {/* 2do Puesto */}
                {podium2 && (
                  <div className="podium-item podium-2nd">
                    <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                      <img 
                        src={getRandomAvatarSrc(podium2.usuario, podium2.nombre)} 
                        alt="2nd" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#cbd5e1',
                        color: '#0f1026',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '2px solid var(--bg-body)'
                      }}>
                        2
                      </div>
                    </div>
                    <div className="podium-pillar">
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100px' }}>
                        {podium2.nombre}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{podium2.area}</span>
                      <span style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.5rem' }}>{podium2.puntaje} pts</span>
                    </div>
                  </div>
                )}

                {/* 1er Puesto */}
                {podium1 && (
                  <div className="podium-item podium-1st">
                    <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                      <Sparkles style={{ position: 'absolute', top: '4px', left: '4px', color: '#f59e0b', zIndex: 5 }} size={16} />
                      <img 
                        src={getRandomAvatarSrc(podium1.usuario, podium1.nombre)} 
                        alt="1st" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#f59e0b',
                        color: '#0f1026',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: '2px solid var(--bg-body)'
                      }}>
                        1
                      </div>
                    </div>
                    <div className="podium-pillar">
                      <span style={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100px' }}>
                        {podium1.nombre}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{podium1.area}</span>
                      <span style={{ fontWeight: '800', color: 'var(--warning)', marginTop: '0.5rem', fontSize: '1.1rem' }}>{podium1.puntaje} pts</span>
                    </div>
                  </div>
                )}

                {/* 3er Puesto */}
                {podium3 && (
                  <div className="podium-item podium-3rd">
                    <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                      <img 
                        src={getRandomAvatarSrc(podium3.usuario, podium3.nombre)} 
                        alt="3rd" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#b45309',
                        color: '#fff',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '2px solid var(--bg-body)'
                      }}>
                        3
                      </div>
                    </div>
                    <div className="podium-pillar">
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100px' }}>
                        {podium3.nombre}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{podium3.area}</span>
                      <span style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.5rem' }}>{podium3.puntaje} pts</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lista detallada del resto */}
            {listRest.length > 0 && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Otras Posiciones</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Puesto</th>
                      <th>Colaborador</th>
                      <th>Área / Departamento</th>
                      <th style={{ textAlign: 'right' }}>Puntaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listRest.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{idx + 4}</td>
                        <td>
                          <span style={{ fontWeight: '600' }}>{row.nombre}</span>
                        </td>
                        <td><span className="tag-badge tag-badge-primary">{row.area}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.puntaje} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Columna de Ranking por Áreas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users className="text-secondary" size={22} />
                Desempeño por Áreas
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Calificaciones promedio de cada departamento en base a sus participantes.
              </p>

              {ranking?.ranking_areas.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sin datos por áreas.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {ranking?.ranking_areas.map((areaStat, index) => (
                    <div key={areaStat.area_codigo} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {index + 1}. {areaStat.area_nombre}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {areaStat.participantes} {areaStat.participantes === 1 ? 'part.' : 'parts.'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Pequeña barra visual */}
                        <div style={{ width: '70%', height: '6px', background: 'rgba(15, 16, 38, 0.5)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                              width: `${Math.min(areaStat.puntaje_promedio * 2, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '0.95rem' }}>
                          {areaStat.puntaje_promedio} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- VISTAS: ADMINISTRACIÓN ---

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codigoIngresadoDirecto, setCodigoIngresadoDirecto] = useState('');
  const [errorBusquedaDirecto, setErrorBusquedaDirecto] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  // Estados para gestión de usuarios (Super Admin)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.is_admin === true;
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes' | 'users'
  const [colaboradores, setColaboradores] = useState([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    usuario: '',
    area: '',
    correo: '',
    is_admin: false,
    is_active: true,
    new_password: ''
  });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQrModal(false);
        setEditingUser(null);
      }
    };
    if (showQrModal || editingUser) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showQrModal, editingUser]);

  const fetchAdminData = () => {
    Promise.all([
      axios.get(`${API_BASE_URL}/admin/stats/`),
      axios.get(`${API_BASE_URL}/admin/quizzes/`)
    ]).then(([statsRes, quizzesRes]) => {
      setStats(statsRes.data);
      setQuizzes(quizzesRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const fetchColaboradores = async () => {
    setLoadingColaboradores(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/colaboradores/`);
      setColaboradores(res.data);
    } catch (err) {
      console.error("Error al cargar colaboradores:", err);
    } finally {
      setLoadingColaboradores(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (isAdmin && activeTab === 'users') {
      fetchColaboradores();
    }
  }, [isAdmin, activeTab]);

  const handleOpenEditUser = (col) => {
    setEditingUser(col);
    setEditFormData({
      nombre: col.nombre || '',
      usuario: col.usuario || '',
      area: col.area || '',
      correo: col.correo || '',
      is_admin: col.is_admin || false,
      is_active: col.is_active !== undefined ? col.is_active : true,
      new_password: ''
    });
    setEditError('');
    setEditSuccess('');
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setSaveLoading(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/admin/colaboradores/${editingUser.id}/`, editFormData);
      setEditSuccess(res.data.message);
      setColaboradores(colaboradores.map(c => c.id === editingUser.id ? res.data.user : c));
      setTimeout(() => {
        setEditingUser(null);
      }, 1500);
    } catch (err) {
      setEditError(err.response?.data?.error || 'Error al actualizar colaborador.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${userToDelete.nombre}" (@${userToDelete.usuario})? Se borrarán todos sus cuestionarios e intentos.`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/colaboradores/${userToDelete.id}/`);
      setColaboradores(colaboradores.filter(c => c.id !== userToDelete.id));
      alert('Colaborador eliminado correctamente.');
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar al colaborador.');
    }
  };

  const handleToggleActivo = async (quiz) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/admin/quizzes/${quiz.id}/`, {
        activo: !quiz.activo
      });
      setQuizzes(quizzes.map(q => q.id === quiz.id ? res.data : q));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cuestionario? Se borrarán todos los intentos y rankings asociados.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/quizzes/${id}/`);
      setQuizzes(quizzes.filter(q => q.id !== id));
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBuscarQuizDirecto = async (e) => {
    e.preventDefault();
    if (!codigoIngresadoDirecto.trim()) return;
    setErrorBusquedaDirecto('');
    try {
      const res = await axios.get(`${API_BASE_URL}/quizzes/join/${codigoIngresadoDirecto.toUpperCase()}/`);
      navigate(`/quiz/${res.data.codigo_acceso}`);
    } catch (err) {
      setErrorBusquedaDirecto('Código de acceso no válido o inactivo.');
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando panel...</div>;

  return (
    <>
      <div className="main-content animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>Consola de Gestión</span>
          <h1 style={{ fontSize: '2.2rem' }}>{isAdmin ? 'Panel Administrador General' : 'Panel del Capacitador'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem' }}>
            <Play size={18} /> Responder Quizzes
          </Link>
          <Link to="/admin/create-quiz" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
            <Plus size={20} /> Crear Cuestionario
          </Link>
        </div>
      </div>

      {/* Pestañas de Navegación para Super Admin */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
          >
            <BookOpen size={18} style={{ marginRight: '0.5rem' }} />
            Todos los Quizzes ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
          >
            <Users size={18} style={{ marginRight: '0.5rem' }} />
            Gestión de Usuarios / Colaboradores ({colaboradores.length || stats?.total_colaboradores || 0})
          </button>
        </div>
      )}

      {/* Buscador de código directo en el panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>¿Quieres responder un cuestionario?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ingresa un código de acceso proporcionado por otro capacitador.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <form onSubmit={handleBuscarQuizDirecto} style={{ display: 'flex', gap: '0.5rem', margin: 0 }}>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '180px', textTransform: 'uppercase', fontWeight: 'bold', textAlign: 'center', margin: 0 }} 
              placeholder="CÓDIGO DE QUIZ" 
              value={codigoIngresadoDirecto} 
              onChange={(e) => setCodigoIngresadoDirecto(e.target.value)} 
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>
              Ingresar <ArrowRight size={16} />
            </button>
          </form>
          {errorBusquedaDirecto && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }}>{errorBusquedaDirecto}</p>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} className="text-primary" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TOTAL CUESTIONARIOS</span>
            <h2 style={{ fontSize: '2rem' }}>{stats?.total_quizzes}</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Users size={28} className="text-secondary" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>COLABORADORES</span>
            <h2 style={{ fontSize: '2rem' }}>{stats?.total_colaboradores}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <Award size={28} className="text-success" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>EVALUACIONES REALIZADAS</span>
            <h2 style={{ fontSize: '2rem' }}>{stats?.total_intentos}</h2>
          </div>
        </div>
      </div>

      {/* Contenido según Pestaña Activa */}
      {isAdmin && activeTab === 'users' ? (
        /* Pestaña: Gestión de Usuarios */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Usuarios Registrados en la Plataforma</h3>
            <input
              type="text"
              className="form-input"
              style={{ width: '300px', margin: 0 }}
              placeholder="🔍 Buscar por nombre, usuario, correo..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>

          {loadingColaboradores ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando lista de colaboradores...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Colaborador</th>
                    <th style={{ textAlign: 'center' }}>Área</th>
                    <th style={{ textAlign: 'center' }}>Correo</th>
                    <th style={{ textAlign: 'center' }}>Rol</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {colaboradores
                    .filter(c => 
                      c.nombre.toLowerCase().includes(userSearch.toLowerCase()) ||
                      c.usuario.toLowerCase().includes(userSearch.toLowerCase()) ||
                      (c.correo && c.correo.toLowerCase().includes(userSearch.toLowerCase())) ||
                      c.area.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map(col => (
                      <tr key={col.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img 
                              src={getRandomAvatarSrc(col.usuario, col.nombre)} 
                              alt="Avatar" 
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                            <div>
                              <div style={{ fontWeight: '600' }}>{col.nombre}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{col.usuario}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="tag-badge tag-badge-secondary">{col.area}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                          {col.correo || <span style={{ color: 'var(--text-muted)' }}>Sin correo</span>}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {col.is_admin ? (
                            <span className="tag-badge tag-badge-primary" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                              Super Admin
                            </span>
                          ) : (
                            <span className="tag-badge tag-badge-secondary">Colaborador</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`tag-badge ${col.is_active ? 'tag-badge-success' : 'tag-badge-danger'}`}>
                            {col.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenEditUser(col)}
                              className="btn btn-primary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              title="Editar usuario"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteUser(col)}
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                              title="Eliminar usuario"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Pestaña: Listado de Quizzes */
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>
            {isAdmin ? 'Todos los Cuestionarios del Sistema' : 'Mis Cuestionarios Creados'}
          </h3>
          {quizzes.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Aún no hay cuestionarios registrados.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Cuestionario</th>
                    {isAdmin && <th style={{ textAlign: 'center' }}>Creador</th>}
                    <th style={{ textAlign: 'center' }}>Código Acceso</th>
                    <th style={{ textAlign: 'center' }}>Preguntas</th>
                    <th style={{ textAlign: 'center' }}>Límite de Tiempo</th>
                    <th style={{ textAlign: 'center' }}>Estado</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map(quiz => (
                    <tr key={quiz.id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: '600' }}>{quiz.titulo}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{quiz.descripcion || 'Sin descripción'}</div>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                          <span className="tag-badge tag-badge-secondary">
                            {quiz.creado_por_nombre || 'Admin'}
                          </span>
                        </td>
                      )}
                      <td style={{ textAlign: 'center' }}><span className="tag-badge tag-badge-primary">{quiz.codigo_acceso}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: '600' }}>{quiz.total_preguntas}</td>
                      <td style={{ textAlign: 'center' }}>{quiz.tiempo_limite > 0 ? `${quiz.tiempo_limite} min` : 'Sin Límite'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleToggleActivo(quiz)}
                          className={`tag-badge ${quiz.activo ? 'tag-badge-success' : 'tag-badge-secondary'}`}
                          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                        >
                          {quiz.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                          <button 
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setShowQrModal(true);
                            }}
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }} 
                            title="Compartir QR"
                          >
                            <QrCode size={14} /> Compartir
                          </button>
                          <Link to={`/admin/quiz/${quiz.id}/manage`} className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }} title="Administrar">
                            <Settings size={14} /> Administrar
                          </Link>
                          <button onClick={() => handleDeleteQuiz(quiz.id)} className="btn btn-danger" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} title="Eliminar Cuestionario">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Modal de Edición de Usuario (Super Admin) */}
    {editingUser && createPortal(
      <div 
        onClick={() => setEditingUser(null)}
        className="modal-overlay"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="modal-content glass-panel animate-fade-in"
          style={{ maxWidth: '540px', padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Editar Datos de Colaborador</h3>
            <button 
              type="button" 
              onClick={() => setEditingUser(null)} 
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.5rem' }}
            >
              <X size={16} />
            </button>
          </div>

          {editError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#fca5a5', marginBottom: '1rem' }}>
              {editError}
            </div>
          )}

          {editSuccess && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--success)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', color: '#86efac', marginBottom: '1rem' }}>
              {editSuccess}
            </div>
          )}

          <form onSubmit={handleSaveUserEdit}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                required
                className="form-input"
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editFormData.usuario}
                  onChange={(e) => setEditFormData({ ...editFormData, usuario: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Área</label>
                <select
                  className="form-select"
                  value={editFormData.area}
                  onChange={(e) => setEditFormData({ ...editFormData, area: e.target.value })}
                >
                  {AREAS_GROUPED.map((group, idx) => (
                    <optgroup key={idx} label={group.label}>
                      {group.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="ejemplo@correo.com"
                value={editFormData.correo}
                onChange={(e) => setEditFormData({ ...editFormData, correo: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Cambiar Contraseña (Opcional)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Dejar en blanco para mantener la actual"
                value={editFormData.new_password}
                onChange={(e) => setEditFormData({ ...editFormData, new_password: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', margin: '1rem 0 1.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={editFormData.is_admin}
                  onChange={(e) => setEditFormData({ ...editFormData, is_admin: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--secondary)' }}
                />
                Es Administrador (Super Admin)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={editFormData.is_active}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--secondary)' }}
                />
                Cuenta Activa
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)} 
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saveLoading} 
                className="btn btn-primary"
              >
                {saveLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    )}

    {/* Modal de Proyección QR */}
    {showQrModal && selectedQuiz && createPortal(
      <div 
        onClick={() => setShowQrModal(false)}
        className="modal-overlay"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="modal-content modal-content-qr glass-panel animate-fade-in"
        >
          <button 
            type="button"
            onClick={() => setShowQrModal(false)}
            className="btn btn-outline"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              padding: '0.35rem 0.5rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              zIndex: 10
            }}
          >
            <X size={14} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'stretch', textAlign: 'left' }}>
            {/* Columna Izquierda: Información e Instrucciones */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="tag-badge tag-badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                  Código de Acceso: {selectedQuiz.codigo_acceso}
                </span>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff', lineHeight: '1.2' }}>
                  {selectedQuiz.titulo}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                  {selectedQuiz.descripcion || 'Escanea el código QR de la derecha con tu celular para registrarte y empezar la evaluación.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Instrucciones para los Colaboradores:</h4>
                <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0 }}>
                  <li>Asegúrate de estar conectado a la red local corporativa.</li>
                  <li>Abre la cámara de tu celular o un lector de códigos y escanea el código QR.</li>
                  <li>Registra tu nombre, crea tu usuario y selecciona tu **Área / Departamento** correspondiente.</li>
                  <li>Comienza la evaluación y responde las preguntas. ¡Sé rápido para asegurar tu puesto en el ranking!</li>
                </ol>
              </div>
            </div>

            {/* Columna Derecha: QR y Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', letterSpacing: '1px', color: '#fff' }}>¡ESCANEA Y ÚNETE!</h3>
              <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', boxShadow: 'var(--shadow-lg)', marginBottom: '1rem' }}>
                <QRCodeSVG 
                  value={`${window.location.origin}/quiz/${selectedQuiz.codigo_acceso}`} 
                  size={220} 
                  bgColor="#ffffff"
                  fgColor="#0f1026"
                  level="M" 
                  includeMargin={false} 
                />
              </div>
              
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '1.5rem', maxWidth: '240px', fontFamily: 'monospace' }}>
                {`${window.location.origin}/quiz/${selectedQuiz.codigo_acceso}`}
              </span>

              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/quiz/${selectedQuiz.codigo_acceso}`);
                  alert('¡Enlace de participación copiado al portapapeles!');
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', width: '100%', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }}
              >
                Copiar Enlace
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Presiona ESC o haz clic fuera para cerrar
              </span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
);
}

// --- IMPORTADOR INTELIGENTE DE PREGUNTAS (PARSERS Y MODAL) ---

const parseTextQuestions = (text) => {
  const lines = text.split('\n');
  const parsedQuestions = [];
  let currentQuestion = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Detener la lectura de preguntas al encontrar la sección del solucionario
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('plantilla de respuestas') || 
        lowerLine.includes('clave de respuestas') || 
        lowerLine.includes('respuestas correctas') || 
        lowerLine.includes('solucionario') ||
        lowerLine.includes('tabla de respuestas') ||
        lowerLine.includes('clave:')) {
      break;
    }

    const questionMatch = line.match(/^(?:\d+[\.\-\)]\s*)(.+)$/i) || line.match(/^¿(.+)$/);
    const isLikelyQuestion = questionMatch || line.endsWith('?') || (!line.match(/^[a-d][\.\-\)]/i) && !line.startsWith('*') && line.length > 25);

    if (isLikelyQuestion && !line.match(/^[a-d][\.\-\)]/i) && !line.startsWith('*')) {
      if (currentQuestion && currentQuestion.texto && currentQuestion.opciones.length > 0) {
        parsedQuestions.push(currentQuestion);
      }
      const textContent = questionMatch ? questionMatch[1] : line;
      currentQuestion = {
        texto: textContent,
        puntos: 1,
        opciones: []
      };
    } else if (currentQuestion) {
      let isCorrect = false;
      let optionText = line;

      if (line.startsWith('*')) {
        isCorrect = true;
        optionText = line.substring(1).trim();
      }

      const optionMatch = optionText.match(/^[a-e][\.\-\)]\s*(.+)$/i);
      if (optionMatch) {
        optionText = optionMatch[1];
      }

      if (optionText.startsWith('*')) {
        isCorrect = true;
        optionText = optionText.substring(1).trim();
      }

      currentQuestion.opciones.push({
        texto: optionText,
        es_correcta: isCorrect
      });
    }
  }

  if (currentQuestion && currentQuestion.texto && currentQuestion.opciones.length > 0) {
    parsedQuestions.push(currentQuestion);
  }

  // Parsear la clave/plantilla de respuestas si existe en el texto
  let answerKey = {};
  let inAnswerKeySection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('plantilla de respuestas') || 
        lowerLine.includes('clave de respuestas') || 
        lowerLine.includes('respuestas correctas') || 
        lowerLine.includes('solucionario') ||
        lowerLine.includes('tabla de respuestas') ||
        lowerLine.includes('clave:')) {
      inAnswerKeySection = true;
      continue;
    }
    
    if (inAnswerKeySection) {
      // Intenta coincidir formatos tipo "1. C" o "1 C" o "1 - C" en una sola línea
      const matchInline = line.match(/^(\d+)\s*[\.\-\:\s]?\s*([a-e])$/i);
      if (matchInline) {
        const qNum = parseInt(matchInline[1]);
        const ansLetter = matchInline[2].toUpperCase();
        answerKey[qNum] = ansLetter;
      } else {
        // Formato multilínea (ej. una fila de tabla: el número de pregunta arriba, la letra abajo)
        const matchNum = line.match(/^(\d+)$/);
        if (matchNum) {
          const qNum = parseInt(matchNum[1]);
          let nextIdx = i + 1;
          while (nextIdx < lines.length && !lines[nextIdx].trim()) {
            nextIdx++;
          }
          if (nextIdx < lines.length) {
            const nextLine = lines[nextIdx].trim();
            const matchLetter = nextLine.match(/^([a-e])$/i);
            if (matchLetter) {
              const ansLetter = matchLetter[1].toUpperCase();
              answerKey[qNum] = ansLetter;
              i = nextIdx; // Avanzar el cursor
            }
          }
        }
      }
    }
  }

  // Aplicar las respuestas del solucionario detectadas
  parsedQuestions.forEach((q, qIdx) => {
    const correctLetter = answerKey[qIdx + 1];
    if (correctLetter) {
      q.opciones.forEach((o, oIdx) => {
        const currentLetter = String.fromCharCode(65 + oIdx); // 0 -> A, 1 -> B, etc.
        o.es_correcta = (currentLetter === correctLetter);
      });
    } else {
      // Si no hay solucionario o no se encontró esta pregunta en la plantilla,
      // verificar si alguna opción ya está marcada (con asterisco). Si no, usar A por defecto.
      const hasCorrect = q.opciones.some(o => o.es_correcta);
      if (!hasCorrect && q.opciones.length > 0) {
        q.opciones[0].es_correcta = true;
      }
    }
  });

  return parsedQuestions;
};

const parseCsvQuestions = (text) => {
  const lines = text.split('\n');
  const parsedQuestions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/[,;]/).map(p => p.trim().replace(/^["']|["']$/g, ''));
    if (parts.length < 3) continue;

    const textoPregunta = parts[0];
    if (textoPregunta.toLowerCase() === 'pregunta' || textoPregunta.toLowerCase() === 'enunciado') {
      continue;
    }

    let puntos = 1;
    let correctIndex = 0;
    let optionsEnd = parts.length;

    const lastPartNum = parseInt(parts[parts.length - 1]);
    if (!isNaN(lastPartNum)) {
      puntos = lastPartNum;
      optionsEnd--;
    }

    const letterPart = parts[optionsEnd - 1]?.toUpperCase();
    if (['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4'].includes(letterPart)) {
      if (['A', 'B', 'C', 'D', 'E'].includes(letterPart)) {
        correctIndex = letterPart.charCodeAt(0) - 65;
      } else {
        correctIndex = parseInt(letterPart) - 1;
      }
      optionsEnd--;
    }

    const opciones = [];
    for (let col = 1; col < optionsEnd; col++) {
      if (parts[col]) {
        opciones.push({
          texto: parts[col],
          es_correcta: (col - 1) === correctIndex
        });
      }
    }

    if (opciones.length > 0 && !opciones.some(o => o.es_correcta)) {
      opciones[0].es_correcta = true;
    }

    if (opciones.length > 0) {
      parsedQuestions.push({
        texto: textoPregunta,
        puntos: puntos,
        opciones: opciones
      });
    }
  }

  return parsedQuestions;
};

const parseExcelRows = (rows) => {
  const parsedQuestions = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || '').trim().toLowerCase();
    if (firstCell === 'pregunta' || firstCell === 'enunciado' || firstCell === '') {
      continue;
    }

    const textoPregunta = String(row[0] || '').trim();
    let puntos = 1;
    let optionsEnd = row.length;

    const lastCellVal = parseInt(row[row.length - 1]);
    if (!isNaN(lastCellVal)) {
      puntos = lastCellVal;
      optionsEnd--;
    }

    const letterPart = String(row[optionsEnd - 1] || '').trim().toUpperCase();
    let correctIndex = 0;

    if (['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4'].includes(letterPart)) {
      if (['A', 'B', 'C', 'D', 'E'].includes(letterPart)) {
        correctIndex = letterPart.charCodeAt(0) - 65;
      } else {
        correctIndex = parseInt(letterPart) - 1;
      }
      optionsEnd--;
    }

    const opciones = [];
    for (let col = 1; col < optionsEnd; col++) {
      const cellVal = String(row[col] || '').trim();
      if (cellVal) {
        opciones.push({
          texto: cellVal,
          es_correcta: (col - 1) === correctIndex
        });
      }
    }

    if (opciones.length > 0 && !opciones.some(o => o.es_correcta)) {
      opciones[0].es_correcta = true;
    }

    if (opciones.length > 0) {
      parsedQuestions.push({
        texto: textoPregunta,
        puntos: puntos,
        opciones: opciones
      });
    }
  }

  return parsedQuestions;
};

function ImportModal({ isOpen, onClose, onImport }) {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [csvText, setCsvText] = useState('');
  const [parsedCount, setParsedCount] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const downloadTemplate = () => {
    const data = [
      ["Pregunta", "Opción A", "Opción B", "Opción C", "Opción D", "Correcta", "Puntos"],
      ["¿De qué color es el cielo?", "Rojo", "Azul", "Verde", "Gris", "B", 10],
      ["¿Cuál es el principal gas de efecto invernadero?", "Oxígeno", "Nitrógeno", "Dióxido de Carbono", "Argón", "C", 10],
      ["¿Cuántos minutos tiene una hora?", "30", "60", "90", "120", "B", 5]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Definición de estilos profesionales
    const headerStyle = {
      fill: { fgColor: { rgb: "1E293B" } }, // Gris oscuro / azul slate
      font: { color: { rgb: "FFFFFF" }, bold: true, name: "Calibri", size: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "medium", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const cellStyleLeft = {
      font: { name: "Calibri", size: 11 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    const cellStyleCenter = {
      font: { name: "Calibri", size: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    // Aplicar estilos celda por celda
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellRef]) continue;

        if (R === 0) {
          worksheet[cellRef].s = headerStyle;
        } else {
          if (C === 5 || C === 6) { // "Correcta" y "Puntos" centrados
            worksheet[cellRef].s = cellStyleCenter;
          } else {
            worksheet[cellRef].s = cellStyleLeft;
          }
        }
      }
    }

    // Anchuras perfectas de celdas para evitar recortes
    worksheet["!cols"] = [
      { wch: 50 }, // Pregunta
      { wch: 18 }, // Opción A
      { wch: 18 }, // Opción B
      { wch: 22 }, // Opción C (Dióxido de Carbono cabe perfecto)
      { wch: 18 }, // Opción D
      { wch: 12 }, // Correcta
      { wch: 10 }  // Puntos
    ];

    // Asegurar visualización explícita de líneas de cuadrícula en Excel
    worksheet["!views"] = [
      { showGridLines: true }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla de Preguntas");
    XLSX.writeFile(workbook, "plantilla_preguntas.xlsx");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleParseText = (val) => {
    setTextInput(val);
    const parsed = parseTextQuestions(val);
    setPreviewData(parsed);
    setParsedCount(parsed.length);
  };

  const handleParseCsvText = (val) => {
    setCsvText(val);
    const parsed = parseCsvQuestions(val);
    setPreviewData(parsed);
    setParsedCount(parsed.length);
  };

  const processFile = (file) => {
    if (!file) return;
    const fileName = file.name.toLowerCase();
    const reader = new FileReader();
    
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const parsed = parseExcelRows(rows);
          setPreviewData(parsed);
          setParsedCount(parsed.length);
          setCsvText(`[Archivo Excel cargado: ${file.name} - ${parsed.length} preguntas detectadas]`);
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo Excel. Asegúrate de que no esté dañado.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      reader.onload = async (evt) => {
        try {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js');
          const arrayBuffer = evt.target.result;
          const result = await window.mammoth.extractRawText({ arrayBuffer });
          const text = result.value;
          const parsed = parseTextQuestions(text);
          setPreviewData(parsed);
          setParsedCount(parsed.length);
          setCsvText(`[Archivo Word cargado: ${file.name} - ${parsed.length} preguntas detectadas]`);
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo Word. Asegúrate de que no esté dañado.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (fileName.endsWith('.pdf')) {
      reader.onload = async (evt) => {
        try {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js');
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
          
          const arrayBuffer = evt.target.result;
          const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            let lastY;
            let text = '';
            for (let item of textContent.items) {
              if (lastY !== undefined && Math.abs(lastY - item.transform[5]) > 2) {
                text += '\n';
              }
              text += item.str;
              lastY = item.transform[5];
            }
            fullText += text + '\n';
          }
          
          const parsed = parseTextQuestions(fullText);
          setPreviewData(parsed);
          setParsedCount(parsed.length);
          setCsvText(`[Archivo PDF cargado: ${file.name} - ${parsed.length} preguntas detectadas]`);
        } catch (err) {
          console.error(err);
          alert('Error al leer el archivo PDF. Asegúrate de que no esté protegido o dañado.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (evt) => {
        handleParseCsvText(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e) => {
    processFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      onClick={onClose}
      className="modal-overlay"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="modal-content glass-panel animate-fade-in"
      >
        <button 
          type="button"
          onClick={onClose}
          className="btn btn-outline"
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
        >
          <X size={14} />
        </button>

        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles className="text-secondary" size={24} /> Importador Inteligente de Preguntas
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Importa decenas de preguntas al instante copiando texto de Word / Google Forms o cargando un archivo CSV.
        </p>

        {/* Pestañas */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', gap: '1rem' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('text'); setPreviewData([]); setParsedCount(0); }}
            style={{
              padding: '0.8rem 1.2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'text' ? '3px solid var(--secondary)' : '3px solid transparent',
              color: activeTab === 'text' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Copiar y Pegar (Word / Forms / Docs)
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('csv'); setPreviewData([]); setParsedCount(0); setCsvText(''); }}
            style={{
              padding: '0.8rem 1.2rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'csv' ? '3px solid var(--secondary)' : '3px solid transparent',
              color: activeTab === 'csv' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            Subir Archivo (Excel / Word / PDF / CSV)
          </button>
        </div>

        {/* Contenido Pestaña Texto */}
        {activeTab === 'text' && (
          <div>
            <div className="import-suggested-format" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Formato sugerido:</strong> Escribe una pregunta por línea. Las opciones deben ir abajo. Antepone un asterisco (<code>*</code>) a la respuesta correcta.
              <pre style={{ margin: '0.5rem 0 0 0', color: 'var(--secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {`1. ¿Cuál es el principal gas de efecto invernadero?
a) Oxígeno
b) Nitrógeno
*c) Dióxido de Carbono
d) Argón`}
              </pre>
            </div>
            
            <div className="form-group">
              <label className="form-label">Pega el texto aquí</label>
              <textarea 
                className="form-textarea" 
                rows={8} 
                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                placeholder="Pega las preguntas copiadas de Word o Forms aquí..."
                value={textInput}
                onChange={(e) => handleParseText(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Contenido Pestaña CSV */}
        {activeTab === 'csv' && (
          <div>
            <div className="import-suggested-format" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Formatos de Archivo Soportados:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Excel / CSV:</span>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                    Usa columnas: <em>Pregunta, Opción A, Opción B, Opción C, Opción D, Correcta (Letra A-D), Puntos</em>.
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Word (.docx) / PDF:</span>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
                    Escribe una pregunta por línea y sus opciones abajo (antecede un asterisco <code>*</code> a la respuesta correcta).
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Completa tus datos usando nuestra plantilla base oficial:
              </span>
              <button 
                type="button" 
                onClick={downloadTemplate} 
                className="btn btn-outline" 
                style={{ 
                  padding: '0.4rem 0.8rem', 
                  fontSize: '0.8rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  borderColor: 'var(--secondary)', 
                  color: 'var(--secondary)',
                  cursor: 'pointer'
                }}
              >
                <Download size={14} /> Descargar Plantilla (.xlsx)
              </button>
            </div>

            <div 
              className="import-drag-zone"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                border: dragActive ? '2px dashed var(--secondary)' : '2px dashed rgba(255,255,255,0.15)',
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                backgroundColor: dragActive ? 'rgba(6, 182, 212, 0.05)' : 'rgba(255,255,255,0.01)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                marginBottom: '1rem'
              }}
            >
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv, .docx, .doc, .pdf" 
                onChange={handleFileUpload} 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <Plus size={32} className="text-secondary" style={{ marginBottom: '0.8rem', opacity: 0.8 }} />
              <h4 style={{ marginBottom: '0.4rem' }}>Arrastra tu archivo Excel, Word, PDF o CSV aquí</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>O haz clic para buscar en tus archivos (.xlsx, .xls, .csv, .docx, .doc, .pdf)</p>
            </div>

            {csvText && (
              <div className="form-group">
                <label className="form-label">Detalle de Archivo Cargado</label>
                <textarea 
                  className="form-textarea" 
                  rows={2} 
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} 
                  value={csvText} 
                  readOnly 
                />
              </div>
            )}
          </div>
        )}

        {/* Panel de Vista Previa */}
        {previewData.length > 0 && (
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="text-success" size={18} /> Vista Previa de Preguntas Detectadas ({parsedCount})
            </h3>
            
            <div className="import-preview-scroll" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              {previewData.map((q, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', borderBottom: idx < previewData.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', paddingBottom: idx < previewData.length - 1 ? '0.8rem' : 0 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.4rem', color: '#fff' }}>
                    Q{idx+1}: {q.texto} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal', fontSize: '0.75rem' }}>({q.puntos} pts)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', paddingLeft: '0.5rem' }}>
                    {q.opciones.map((o, oIdx) => (
                      <div key={oIdx} style={{ color: o.es_correcta ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                        <span style={{ fontWeight: '600', minWidth: '18px' }}>{String.fromCharCode(97 + oIdx)})</span>
                        <span>{o.texto} {o.es_correcta && '✓'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem' }}>Cancelar</button>
          <button 
            type="button" 
            onClick={() => onImport(previewData)} 
            disabled={previewData.length === 0} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 2rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }}
          >
            Importar {parsedCount} Preguntas
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function AdminCreateQuiz() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [tiempoLimite, setTiempoLimite] = useState(0); // 0 = sin límite
  const [showImportModal, setShowImportModal] = useState(false);
  const [preguntas, setPreguntas] = useState([
    {
      texto: '',
      imagen: '',
      puntos: 1,
      opciones: [
        { texto: '', es_correcta: true },
        { texto: '', es_correcta: false },
        { texto: '', es_correcta: false },
        { texto: '', es_correcta: false }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddPregunta = () => {
    setPreguntas([
      ...preguntas,
      {
        texto: '',
        imagen: '',
        puntos: 1,
        opciones: [
          { texto: '', es_correcta: true },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false }
        ]
      }
    ]);
  };

  const handleRemovePregunta = (pIdx) => {
    if (preguntas.length === 1) return;
    setPreguntas(preguntas.filter((_, idx) => idx !== pIdx));
  };

  const handlePreguntaChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].texto = val;
    setPreguntas(updated);
  };

  const handleImagenChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].imagen = val;
    setPreguntas(updated);
  };

  const handleImagenFileUpload = (pIdx, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...preguntas];
      updated[pIdx].imagen = reader.result;
      setPreguntas(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImagen = (pIdx) => {
    const updated = [...preguntas];
    updated[pIdx].imagen = '';
    setPreguntas(updated);
  };

  const handlePuntosChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].puntos = val === '' ? '' : (parseInt(val) || 0);
    setPreguntas(updated);
  };

  const handleOpcionTextChange = (pIdx, oIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].opciones[oIdx].texto = val;
    setPreguntas(updated);
  };

  const handleOpcionCorrectaChange = (pIdx, oIdx) => {
    const updated = [...preguntas];
    updated[pIdx].opciones.forEach((opc, idx) => {
      opc.es_correcta = idx === oIdx;
    });
    setPreguntas(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (preguntas.some(p => !p.texto.trim())) {
      alert('Por favor escribe el texto de todas las preguntas.');
      return;
    }
    if (preguntas.some(p => p.opciones.some(o => !o.texto.trim()))) {
      alert('Por favor escribe el texto de todas las opciones de respuesta.');
      return;
    }

    setLoading(true);
    try {
      // 1. Crear el Quiz
      const quizRes = await axios.post(`${API_BASE_URL}/admin/quizzes/`, {
        titulo,
        descripcion,
        codigo_acceso: codigoAcceso.trim().toUpperCase() || undefined,
        tiempo_limite: tiempoLimite,
        activo: true
      });

      const quizId = quizRes.data.id;

      // 2. Sincronizar Preguntas y Opciones
      const cleanedPreguntas = preguntas.map(p => ({
        ...p,
        puntos: parseInt(p.puntos) || 1
      }));
      await axios.post(`${API_BASE_URL}/admin/quizzes/${quizId}/questions/sync/`, {
        preguntas: cleanedPreguntas
      });

      alert('¡Cuestionario creado con éxito!');
      navigate('/admin');
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al crear el cuestionario. Verifica el código de acceso (debe ser único).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <h1 style={{ fontSize: '2rem' }}>Crear Nuevo Cuestionario</h1>
      </div>

      <form onSubmit={handleSave}>
        {/* Metadatos del Quiz */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Detalles Generales</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Título del Quiz</label>
              <input type="text" required className="form-input" placeholder="Ej: Capacitación de Seguridad 2026" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Código de Acceso (Opcional)</label>
              <input type="text" className="form-input" style={{ textTransform: 'uppercase' }} placeholder="Auto-generado si queda vacío" value={codigoAcceso} onChange={(e) => setCodigoAcceso(e.target.value)} />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" rows={2} placeholder="De qué trata la evaluación..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tiempo Límite (Minutos, 0 = Sin límite)</label>
              <input type="number" min={0} className="form-input" value={tiempoLimite} onChange={(e) => setTiempoLimite(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* Sección de preguntas */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>Preguntas de Evaluación ({preguntas.length})</h2>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                type="button" 
                onClick={() => setShowImportModal(true)} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.9rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }}
              >
                <Sparkles size={16} /> Importador Inteligente
              </button>
              <button type="button" onClick={handleAddPregunta} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                <Plus size={16} /> Agregar Pregunta
              </button>
            </div>
          </div>

          {preguntas.map((pregunta, pIdx) => (
            <div key={pIdx} className="glass-panel animate-fade-in" style={{ padding: '2rem', marginBottom: '1.5rem', position: 'relative' }}>
              {preguntas.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemovePregunta(pIdx)} 
                  className="btn btn-danger" 
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                  title="Eliminar pregunta"
                >
                  <X size={18} />
                </button>
              )}

              <h4 style={{ color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pregunta #{pIdx + 1}
              </h4>

              <div className="grid-3" style={{ gridTemplateColumns: '3fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Texto de la Pregunta</label>
                  <input type="text" required className="form-input" placeholder="Escribe la pregunta aquí..." value={pregunta.texto} onChange={(e) => handlePreguntaChange(pIdx, e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Puntos</label>
                  <input type="number" min={1} className="form-input" value={pregunta.puntos} onChange={(e) => handlePuntosChange(pIdx, e.target.value)} />
                </div>
              </div>

              {/* Campo de Imagen opcional */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Image size={15} /> Imagen Ilustrativa (Opcional - Riesgos, Señalética, Esquemas, etc.)
                </label>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, minWidth: '220px' }} 
                    placeholder="URL de la imagen (o sube un archivo →)" 
                    value={pregunta.imagen || ''} 
                    onChange={(e) => handleImagenChange(pIdx, e.target.value)} 
                  />
                  <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.55rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <Upload size={15} /> Subir Imagen
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImagenFileUpload(pIdx, e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                  {pregunta.imagen && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImagen(pIdx)} 
                      className="btn btn-danger" 
                      style={{ padding: '0.55rem 0.8rem', fontSize: '0.85rem' }} 
                      title="Quitar Imagen"
                    >
                      <Trash2 size={15} /> Quitar
                    </button>
                  )}
                </div>

                {pregunta.imagen && (
                  <div style={{ marginTop: '0.8rem' }}>
                    <img 
                      src={pregunta.imagen} 
                      alt="Vista previa" 
                      style={{ maxHeight: '160px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.15)', objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} 
                    />
                  </div>
                )}
              </div>

              {/* Opciones de respuesta */}
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.8rem' }}>Opciones (Marca el círculo de la respuesta correcta)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {pregunta.opciones.map((opc, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input 
                        type="radio" 
                        name={`correct-ans-${pIdx}`} 
                        checked={opc.es_correcta} 
                        onChange={() => handleOpcionCorrectaChange(pIdx, oIdx)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
                      />
                      <input 
                        type="text" 
                        required 
                        className="form-input" 
                        style={{ flex: 1 }} 
                        placeholder={`Opción ${String.fromCharCode(65 + oIdx)}`} 
                        value={opc.texto} 
                        onChange={(e) => handleOpcionTextChange(pIdx, oIdx, e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link to="/admin" className="btn btn-outline">Cancelar</Link>
          <button type="submit" disabled={loading} className="btn btn-primary pulse-glow" style={{ padding: '0.8rem 2.5rem', fontSize: '1.1rem' }}>
            {loading ? 'Guardando cuestionario...' : 'Guardar y Publicar'}
          </button>
        </div>
      </form>
      
      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(imported) => {
          setPreguntas(imported);
          setShowImportModal(false);
        }}
      />
    </div>
  );
}

function AdminQuizShare() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizUrl, setQuizUrl] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/quizzes/${id}/`)
      .then(res => {
        setData(res.data);
        // Construir la URL absoluta para el QR
        const origin = window.location.origin;
        setQuizUrl(`${origin}/quiz/${res.data.quiz.codigo_acceso}`);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando gestor de QR...</div>;

  return (
    <div className="main-content animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to={`/admin/quiz/${id}/manage`} style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Volver al Administrador
        </Link>
        <h1 style={{ fontSize: '2rem' }}>Presentar Cuestionario</h1>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'stretch' }}>
        {/* Panel izquierdo: Información y Proyección */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="tag-badge tag-badge-primary" style={{ marginBottom: '0.8rem' }}>Código de Acceso: {data?.quiz.codigo_acceso}</span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{data?.quiz.titulo}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              {data?.quiz.descripcion || 'Escanea el código QR de la derecha con tu celular para registrarte y empezar la evaluación.'}
            </p>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.8rem' }}>Instrucciones para los Colaboradores:</h4>
            <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Asegúrate de estar conectado a la red local.</li>
              <li>Abre la cámara de tu celular y escanea el código QR de la pantalla.</li>
              <li>Registra tu nombre, usuario y selecciona tu **Área / Departamento**.</li>
              <li>Comienza la evaluación y responde las preguntas. ¡Sé rápido para asegurar tu puesto en el ranking!</li>
            </ol>
          </div>
        </div>

        {/* Panel derecho: QR gigante */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1.2rem' }}>¡ESCANEA Y ÚNETE!</h3>
          <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', boxShadow: 'var(--shadow-lg)' }}>
            <QRCodeSVG 
              value={quizUrl} 
              size={220} 
              bgColor="#ffffff"
              fgColor="#0f1026"
              level="M" 
              includeMargin={false} 
            />
          </div>
          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1.2rem', wordBreak: 'break-all', maxWidth: '240px' }}>
            {quizUrl}
          </span>
          
          <div style={{ marginTop: '1.5rem', width: '100%' }}>
            <Link to={`/quiz/${data?.quiz.codigo_acceso}/leaderboard`} className="btn btn-secondary" style={{ width: '100%' }}>
              <Trophy size={18} /> Ver Resultados en Vivo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminQuizManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [quizUrl, setQuizUrl] = useState('');
  
  // States para datos del servidor
  const [quiz, setQuiz] = useState(null);
  const [ranking, setRanking] = useState(null);

  // States para el formulario de edición
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [tiempoLimite, setTiempoLimite] = useState(0);
  const [activo, setActivo] = useState(true);
  const [preguntas, setPreguntas] = useState([]);

  const fetchData = () => {
    Promise.all([
      axios.get(`${API_BASE_URL}/admin/quizzes/${id}/`),
      axios.get(`${API_BASE_URL}/quizzes/${id}/ranking/`)
    ]).then(([quizRes, rankingRes]) => {
      const q = quizRes.data.quiz;
      setQuiz(q);
      setTitulo(q.titulo);
      setDescripcion(q.descripcion || '');
      setCodigoAcceso(q.codigo_acceso);
      setTiempoLimite(q.tiempo_limite);
      setActivo(q.activo);
      
      const origin = window.location.origin;
      setQuizUrl(`${origin}/quiz/${q.codigo_acceso}`);
      
      // Mapear preguntas recibidas con sus opciones
      setPreguntas(quizRes.data.preguntas);
      setRanking(rankingRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();

    // Auto-actualizar ranking en vivo silenciosamente cada 4 segundos
    const interval = setInterval(() => {
      axios.get(`${API_BASE_URL}/quizzes/${id}/ranking/`)
        .then(res => {
          setRanking(res.data);
        })
        .catch(err => {
          console.error("Error al auto-actualizar ranking:", err);
        });
    }, 4000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQrModal(false);
      }
    };
    if (showQrModal) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showQrModal]);

  const handleToggleEstado = async () => {
    try {
      const res = await axios.put(`${API_BASE_URL}/admin/quizzes/${id}/`, {
        activo: !activo
      });
      setActivo(res.data.activo);
      setQuiz({ ...quiz, activo: res.data.activo });
    } catch (err) {
      console.error(err);
    }
  };

  // Métodos del editor de preguntas
  const handleAddPregunta = () => {
    setPreguntas([
      ...preguntas,
      {
        texto: '',
        imagen: '',
        puntos: 1,
        opciones: [
          { texto: '', es_correcta: true },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false },
          { texto: '', es_correcta: false }
        ]
      }
    ]);
  };

  const handleRemovePregunta = (pIdx) => {
    if (preguntas.length === 1) return;
    setPreguntas(preguntas.filter((_, idx) => idx !== pIdx));
  };

  const handlePreguntaChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].texto = val;
    setPreguntas(updated);
  };

  const handleImagenChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].imagen = val;
    setPreguntas(updated);
  };

  const handleImagenFileUpload = (pIdx, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...preguntas];
      updated[pIdx].imagen = reader.result;
      setPreguntas(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImagen = (pIdx) => {
    const updated = [...preguntas];
    updated[pIdx].imagen = '';
    setPreguntas(updated);
  };

  const handlePuntosChange = (pIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].puntos = val === '' ? '' : (parseInt(val) || 0);
    setPreguntas(updated);
  };

  const handleOpcionTextChange = (pIdx, oIdx, val) => {
    const updated = [...preguntas];
    updated[pIdx].opciones[oIdx].texto = val;
    setPreguntas(updated);
  };

  const handleOpcionCorrectaChange = (pIdx, oIdx) => {
    const updated = [...preguntas];
    updated[pIdx].opciones.forEach((opc, idx) => {
      opc.es_correcta = idx === oIdx;
    });
    setPreguntas(updated);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    if (preguntas.some(p => !p.texto.trim())) {
      alert('Por favor escribe el texto de todas las preguntas.');
      return;
    }
    if (preguntas.some(p => p.opciones.some(o => !o.texto.trim()))) {
      alert('Por favor escribe el texto de todas las opciones.');
      return;
    }

    setLoading(true);
    try {
      // 1. Actualizar metadata del quiz
      await axios.put(`${API_BASE_URL}/admin/quizzes/${id}/`, {
        titulo,
        descripcion,
        codigo_acceso: codigoAcceso.trim().toUpperCase(),
        tiempo_limite: tiempoLimite
      });

      // 2. Sincronizar preguntas
      const cleanedPreguntas = preguntas.map(p => ({
        ...p,
        puntos: parseInt(p.puntos) || 1
      }));
      await axios.post(`${API_BASE_URL}/admin/quizzes/${id}/questions/sync/`, {
        preguntas: cleanedPreguntas
      });

      alert('¡Cuestionario actualizado con éxito!');
      fetchData(); // Recargar datos frescos
    } catch (err) {
      console.error(err);
      alert('Error al actualizar. Verifica que el código de acceso no esté en uso por otro cuestionario.');
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este cuestionario definitivamente? Se borrará todo el historial.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/quizzes/${id}/`);
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center', marginTop: '5rem' }}>Cargando panel del cuestionario...</div>;

  const podium1 = ranking?.ranking_individual[0];
  const podium2 = ranking?.ranking_individual[1];
  const podium3 = ranking?.ranking_individual[2];
  const listRest = ranking?.ranking_individual.slice(3) || [];

  return (
    <>
      <div className="main-content animate-fade-in admin-content-padding">
      {/* Header del Cuestionario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
        <div>
          <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Volver al Listado
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '2.2rem', margin: 0 }}>{quiz?.titulo}</h1>
            <span className={`tag-badge ${activo ? 'tag-badge-success' : 'tag-badge-secondary'}`}>
              {activo ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.95rem' }}>Código de Acceso: <strong style={{ color: 'var(--secondary)' }}>{quiz?.codigo_acceso}</strong></p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <a 
            href={`/quiz/${quiz?.codigo_acceso}/leaderboard`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-outline" 
            style={{ padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            <Trophy size={18} /> Ver Ranking de Audiencia
          </a>
          <button 
            type="button"
            onClick={() => setShowQrModal(true)}
            className="btn btn-secondary" 
            style={{ padding: '0.6rem 1.2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <QrCode size={18} /> Proyectar QR
          </button>
        </div>
      </div>

      {/* Grid de 70% / 30% */}
      <div className="admin-grid-layout">
        {/* Columna Izquierda (72%): Monitoreo de Resultados en Tiempo Real */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Trophy className="text-secondary" size={24} /> Monitoreo y Resultados en Vivo
            </h2>
            <button onClick={fetchData} className="btn btn-outline" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }}>
              Actualizar Resultados
            </button>
          </div>

          {ranking?.ranking_individual.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Trophy size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
              <h3>Aún no hay puntuaciones registradas</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Los colaboradores que completen la evaluación con el código <strong style={{ color: 'var(--secondary)' }}>{quiz?.codigo_acceso}</strong> aparecerán aquí en vivo.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Podium y Rankings */}
              <div className="dashboard-sub-grid">
                {/* Podium Individual */}
                <div>
                  <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                    <div className="podium-container" style={{ margin: 0, paddingTop: '1rem' }}>
                      {/* 2do Puesto */}
                      {podium2 && (
                        <div className="podium-item podium-2nd">
                          <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                            <img 
                              src={getRandomAvatarSrc(podium2.usuario, podium2.nombre)} 
                              alt="2nd" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              background: '#cbd5e1',
                              color: '#0f1026',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              border: '2px solid var(--bg-body)'
                            }}>
                              2
                            </div>
                          </div>
                          <div className="podium-pillar">
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '110px' }}>
                              {podium2.nombre}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{podium2.area}</span>
                            <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{podium2.puntaje} pts</span>
                          </div>
                        </div>
                      )}

                      {/* 1er Puesto */}
                      {podium1 && (
                        <div className="podium-item podium-1st">
                          <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                            <Sparkles style={{ position: 'absolute', top: '4px', left: '4px', color: '#f59e0b', zIndex: 5 }} size={16} />
                            <img 
                              src={getRandomAvatarSrc(podium1.usuario, podium1.nombre)} 
                              alt="1st" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              background: '#f59e0b',
                              color: '#0f1026',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              border: '2px solid var(--bg-body)'
                            }}>
                              1
                            </div>
                          </div>
                          <div className="podium-pillar">
                            <span style={{ fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '110px' }}>
                              {podium1.nombre}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{podium1.area}</span>
                            <span style={{ fontWeight: '800', color: 'var(--warning)', fontSize: '1.05rem' }}>{podium1.puntaje} pts</span>
                          </div>
                        </div>
                      )}

                      {/* 3er Puesto */}
                      {podium3 && (
                        <div className="podium-item podium-3rd">
                          <div className="podium-avatar" style={{ position: 'relative', overflow: 'hidden', padding: 0 }}>
                            <img 
                              src={getRandomAvatarSrc(podium3.usuario, podium3.nombre)} 
                              alt="3rd" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <div style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-2px',
                              background: '#b45309',
                              color: '#fff',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              border: '2px solid var(--bg-body)'
                            }}>
                              3
                            </div>
                          </div>
                          <div className="podium-pillar">
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '110px' }}>
                              {podium3.nombre}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{podium3.area}</span>
                            <span style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{podium3.puntaje} pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabla detallada del resto */}
                  {listRest.length > 0 && (
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Puesto</th>
                            <th>Colaborador</th>
                            <th>Área / Departamento</th>
                            <th style={{ textAlign: 'right' }}>Puntaje</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listRest.map((row, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{idx + 4}</td>
                              <td>
                                <span style={{ fontWeight: '600' }}>{row.nombre}</span>
                              </td>
                              <td><span className="tag-badge tag-badge-primary">{row.area}</span></td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.puntaje} pts</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Promedio por áreas y Feedback de la capacitación */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Desempeño agrupado por áreas */}
                  <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                      <Users className="text-secondary" size={20} /> Promedio por Áreas
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      {ranking?.ranking_areas.map((areaStat, index) => (
                        <div key={areaStat.area_codigo} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                            <span style={{ fontWeight: 'bold' }}>{index + 1}. {areaStat.area_nombre}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{areaStat.participantes} parts.</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ width: '70%', height: '6px', background: 'rgba(15,16,38,0.5)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--primary))', width: `${Math.min(areaStat.puntaje_promedio * 2, 100)}%` }}></div>
                            </div>
                            <span style={{ fontWeight: '800', color: 'var(--secondary)', fontSize: '0.9rem' }}>{areaStat.puntaje_promedio} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback de la capacitación */}
                  {(() => {
                    const completedAttempts = ranking?.ranking_individual || [];
                    const feedbackAttempts = completedAttempts.filter(item => 
                      item.feedback_tema_score || 
                      item.feedback_capacitacion_score ||
                      item.feedback_expectativas ||
                      item.feedback_aplicacion
                    );
                    const totalFeedbackCount = feedbackAttempts.length;

                    // I. Calificación General Promedios
                    const temaAttempts = feedbackAttempts.filter(i => i.feedback_tema_score);
                    const avgTema = temaAttempts.length > 0 
                      ? (temaAttempts.reduce((acc, curr) => acc + (curr.feedback_tema_score || 0), 0) / temaAttempts.length).toFixed(1)
                      : null;

                    const capAttempts = feedbackAttempts.filter(i => i.feedback_capacitador_score || i.feedback_capacitacion_score);
                    const avgCapacitador = capAttempts.length > 0 
                      ? (capAttempts.reduce((acc, curr) => acc + (curr.feedback_capacitador_score || curr.feedback_capacitacion_score || 0), 0) / capAttempts.length).toFixed(1)
                      : null;

                    const compAttempts = feedbackAttempts.filter(i => i.feedback_comprension_score);
                    const avgComprension = compAttempts.length > 0 
                      ? (compAttempts.reduce((acc, curr) => acc + (curr.feedback_comprension_score || 0), 0) / compAttempts.length).toFixed(1)
                      : null;

                    const matAttempts = feedbackAttempts.filter(i => i.feedback_materiales_score);
                    const avgMateriales = matAttempts.length > 0 
                      ? (matAttempts.reduce((acc, curr) => acc + (curr.feedback_materiales_score || 0), 0) / matAttempts.length).toFixed(1)
                      : null;

                    const conAttempts = feedbackAttempts.filter(i => i.feedback_conexion_score);
                    const avgConexion = conAttempts.length > 0 
                      ? (conAttempts.reduce((acc, curr) => acc + (curr.feedback_conexion_score || 0), 0) / conAttempts.length).toFixed(1)
                      : null;

                    // II. ¿Cumplió Expectativas?
                    const totalExpectativas = feedbackAttempts.filter(i => i.feedback_expectativas).length;
                    const expectSi = feedbackAttempts.filter(i => i.feedback_expectativas === 'Si').length;
                    const expectNo = feedbackAttempts.filter(i => i.feedback_expectativas === 'No').length;
                    const pctSi = totalExpectativas > 0 ? Math.round((expectSi / totalExpectativas) * 100) : 0;
                    const pctNo = totalExpectativas > 0 ? Math.round((expectNo / totalExpectativas) * 100) : 0;

                    // III. Aplicación del Conocimiento
                    const totalAplicacion = feedbackAttempts.filter(i => i.feedback_aplicacion).length;
                    const aplRegularmente = feedbackAttempts.filter(i => i.feedback_aplicacion === 'Se Aplica Regularmente').length;
                    const aplEscasamente = feedbackAttempts.filter(i => i.feedback_aplicacion === 'Se Aplica Escasamente').length;
                    const aplNoAplica = feedbackAttempts.filter(i => i.feedback_aplicacion === 'No se Aplica').length;
                    const aplFuturo = feedbackAttempts.filter(i => i.feedback_aplicacion === 'Se Prevé Aplicar a Futuro').length;

                    const pctRegularmente = totalAplicacion > 0 ? Math.round((aplRegularmente / totalAplicacion) * 100) : 0;
                    const pctEscasamente = totalAplicacion > 0 ? Math.round((aplEscasamente / totalAplicacion) * 100) : 0;
                    const pctNoAplica = totalAplicacion > 0 ? Math.round((aplNoAplica / totalAplicacion) * 100) : 0;
                    const pctFuturo = totalAplicacion > 0 ? Math.round((aplFuturo / totalAplicacion) * 100) : 0;

                    const recentComments = feedbackAttempts
                      .filter(item => item.feedback_comentarios && item.feedback_comentarios.trim() !== '')
                      .slice(0, 8); // top 8 comments

                    return (
                      <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                          <Sparkles className="text-secondary" size={20} /> Encuesta de Satisfacción
                        </h3>

                        {/* I. Calificación General */}
                        <div style={{ marginBottom: '1.8rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            I. Calificación General (Promedios)
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {[
                              { label: 'Tema / Exposición', avg: avgTema },
                              { label: 'Capacitador', avg: avgCapacitador },
                              { label: 'Comprensión', avg: avgComprension },
                              { label: 'Materiales', avg: avgMateriales },
                              { label: 'Medio de Conexión', avg: avgConexion }
                            ].map((aspect, idx) => {
                              const score = aspect.avg ? parseFloat(aspect.avg) : 0;
                              const widthPct = (score / 5) * 100;
                              return (
                                <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.5rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                                    <span style={{ fontWeight: '500' }}>{aspect.label}</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{aspect.avg ? `${aspect.avg} / 5` : '—'}</span>
                                  </div>
                                  <div style={{ width: '100%', height: '6px', background: 'rgba(15,16,38,0.5)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--primary))', width: `${widthPct}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* II. Expectativas */}
                        <div style={{ marginBottom: '1.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            II. ¿Cumplió Expectativas?
                          </h4>
                          {totalExpectativas === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin respuestas</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {[
                                { label: 'Sí', pct: pctSi, color: 'var(--success)' },
                                { label: 'No', pct: pctNo, color: 'var(--danger)' }
                              ].map((item, idx) => (
                                <div key={idx}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                                    <span>{item.label}</span>
                                    <span style={{ fontWeight: 'bold', color: item.color }}>{item.pct}%</span>
                                  </div>
                                  <div style={{ width: '100%', height: '6px', background: 'rgba(15,16,38,0.5)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: item.color, width: `${item.pct}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* III. Aplicación del Conocimiento */}
                        <div style={{ marginBottom: '1.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            III. Aplicación del Conocimiento
                          </h4>
                          {totalAplicacion === 0 ? (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sin respuestas</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {[
                                { label: 'Se Aplica Regularmente', pct: pctRegularmente },
                                { label: 'Se Aplica Escasamente', pct: pctEscasamente },
                                { label: 'No se Aplica', pct: pctNoAplica },
                                { label: 'Se Prevé Aplicar a Futuro', pct: pctFuturo }
                              ].map((item, idx) => (
                                <div key={idx}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                                    <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{item.pct}%</span>
                                  </div>
                                  <div style={{ width: '100%', height: '6px', background: 'rgba(15,16,38,0.5)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--secondary), var(--primary))', width: `${item.pct}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* IV. Comentarios */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Opiniones / Comentarios ({recentComments.length})
                          </h4>
                          {recentComments.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', margin: '1rem 0' }}>Aún no hay comentarios.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.3rem' }}>
                              {recentComments.map((item, idx) => (
                                <div key={idx} style={{ background: 'rgba(15, 16, 38, 0.4)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{item.nombre}</span>
                                    <span className="tag-badge tag-badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', whiteSpace: 'nowrap' }}>{item.area}</span>
                                  </div>
                                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                                    "{item.feedback_comentarios}"
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.5rem' }}>
                          Encuestas completadas: <strong>{totalFeedbackCount}</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha (28%): Configuración y Formulario de Edición */}
        <form onSubmit={handleUpdateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0 }}>
          {/* Tarjeta 1: Configuración de Estado */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Configuración Rápida</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estado de admisión:</span>
                <button 
                  type="button"
                  onClick={handleToggleEstado}
                  className={`tag-badge ${activo ? 'tag-badge-success' : 'tag-badge-secondary'}`}
                  style={{ border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {activo ? 'Abierto (Activo)' : 'Cerrado (Inactivo)'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="btn btn-outline" 
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <QrCode size={14} /> Código QR
                </button>
                <button 
                  type="button"
                  onClick={handleDeleteQuiz}
                  className="btn btn-danger"
                  style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', flex: 1 }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Formulario General */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>Detalles Generales</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Título del Quiz</label>
              <input type="text" required className="form-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Código de Acceso</label>
              <input type="text" required className="form-input" style={{ textTransform: 'uppercase', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} value={codigoAcceso} onChange={(e) => setCodigoAcceso(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Descripción</label>
              <textarea className="form-textarea" rows={2} style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Límite de Tiempo (Minutos)</label>
              <input type="number" min={0} className="form-input" style={{ padding: '0.6rem 0.8rem', fontSize: '0.9rem' }} value={tiempoLimite} onChange={(e) => setTiempoLimite(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          {/* Tarjeta 3: Editor de Preguntas con Scroll Vertical */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Preguntas ({preguntas.length})</h3>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowImportModal(true)} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }}
                >
                  <Sparkles size={12} /> Importar
                </button>
                <button type="button" onClick={handleAddPregunta} className="btn btn-outline" style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}>
                  <Plus size={12} /> Añadir
                </button>
              </div>
            </div>

            {/* Scroll Container para preguntas */}
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {preguntas.map((pregunta, pIdx) => (
                <div key={pIdx} style={{ backgroundColor: 'rgba(15,16,38,0.4)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                  {preguntas.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemovePregunta(pIdx)} 
                      className="btn btn-danger" 
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem', borderRadius: '4px' }}
                      title="Eliminar pregunta"
                    >
                      <X size={12} />
                    </button>
                  )}

                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--secondary)', display: 'block', marginBottom: '0.5rem' }}>Pregunta #{pIdx + 1}</span>
                  
                  <div className="form-group" style={{ marginBottom: '0.8rem', gap: '0.3rem' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Enunciado</label>
                    <input type="text" required className="form-input" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={pregunta.texto} onChange={(e) => handlePreguntaChange(pIdx, e.target.value)} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.8rem', gap: '0.3rem' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Puntos</label>
                    <input type="number" min={1} className="form-input" style={{ padding: '0.5rem', fontSize: '0.85rem' }} value={pregunta.puntos} onChange={(e) => handlePuntosChange(pIdx, e.target.value)} />
                  </div>

                  {/* Imagen Ilustrativa (Opcional) */}
                  <div className="form-group" style={{ marginBottom: '0.8rem', gap: '0.3rem' }}>
                    <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Image size={12} /> Imagen (Opcional)
                    </label>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', flex: 1 }} 
                        placeholder="URL de imagen" 
                        value={pregunta.imagen || ''} 
                        onChange={(e) => handleImagenChange(pIdx, e.target.value)} 
                      />
                      <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', margin: 0 }}>
                        <Upload size={12} /> Subir
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImagenFileUpload(pIdx, e.target.files[0]);
                            }
                          }} 
                        />
                      </label>
                      {pregunta.imagen && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImagen(pIdx)} 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }} 
                          title="Quitar Imagen"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    {pregunta.imagen && (
                      <div style={{ marginTop: '0.4rem' }}>
                        <img 
                          src={pregunta.imagen} 
                          alt="Vista previa" 
                          style={{ maxHeight: '90px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.15)', objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} 
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className="form-label" style={{ fontSize: '0.7rem', display: 'block' }}>Respuestas (Marca la correcta)</span>
                    {pregunta.opciones.map((opc, oIdx) => (
                      <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input 
                          type="radio" 
                          name={`grid-correct-${pIdx}`} 
                          checked={opc.es_correcta} 
                          onChange={() => handleOpcionCorrectaChange(pIdx, oIdx)}
                          style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: 'var(--secondary)' }} 
                        />
                        <input 
                          type="text" 
                          required 
                          className="form-input" 
                          style={{ padding: '0.4rem', fontSize: '0.8rem', flex: 1 }} 
                          placeholder={`Opción ${String.fromCharCode(65 + oIdx)}`} 
                          value={opc.texto} 
                          onChange={(e) => handleOpcionTextChange(pIdx, oIdx, e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button type="submit" className="btn btn-primary pulse-glow" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div> {/* Closes admin-grid-layout */}
    </div> {/* Closes main-content */}

    {/* Modal de Proyección QR */}
    {showQrModal && createPortal(
      <div 
        onClick={() => setShowQrModal(false)}
        className="modal-overlay"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="modal-content modal-content-qr glass-panel animate-fade-in"
        >
          <button 
            type="button"
            onClick={() => setShowQrModal(false)}
            className="btn btn-outline"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              padding: '0.35rem 0.5rem',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              zIndex: 10
            }}
          >
            <X size={14} />
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'stretch', textAlign: 'left' }}>
            {/* Columna Izquierda: Información e Instrucciones */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="tag-badge tag-badge-primary" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                  Código de Acceso: {quiz?.codigo_acceso}
                </span>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff', lineHeight: '1.2' }}>
                  {quiz?.titulo}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                  {quiz?.descripcion || 'Escanea el código QR de la derecha con tu celular para registrarte y empezar la evaluación.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', color: '#fff', fontSize: '1rem' }}>Instrucciones para los Colaboradores:</h4>
                <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: 0 }}>
                  <li>Asegúrate de estar conectado a la red local corporativa.</li>
                  <li>Abre la cámara de tu celular o un lector de códigos y escanea el código QR.</li>
                  <li>Registra tu nombre, crea tu usuario y selecciona tu **Área / Departamento** correspondiente.</li>
                  <li>Comienza la evaluación y responde las preguntas. ¡Sé rápido para asegurar tu puesto en el ranking!</li>
                </ol>
              </div>
            </div>

            {/* Columna Derecha: QR y Acciones */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '2rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', letterSpacing: '1px', color: '#fff' }}>¡ESCANEA Y ÚNETE!</h3>
              <div style={{ backgroundColor: 'white', padding: '1.2rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', boxShadow: 'var(--shadow-lg)', marginBottom: '1rem' }}>
                <QRCodeSVG 
                  value={quizUrl} 
                  size={220} 
                  bgColor="#ffffff"
                  fgColor="#0f1026"
                  level="M" 
                  includeMargin={false} 
                />
              </div>
              
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: '1.5rem', maxWidth: '240px', fontFamily: 'monospace' }}>
                {quizUrl}
              </span>

              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(quizUrl);
                  alert('¡Enlace de participación copiado al portapapeles!');
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', width: '100%', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--secondary), var(--secondary-hover))' }}
              >
                Copiar Enlace
              </button>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Presiona ESC o haz clic fuera para cerrar
              </span>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    
    <ImportModal 
      isOpen={showImportModal}
      onClose={() => setShowImportModal(false)}
      onImport={(imported) => {
        setPreguntas(imported);
        setShowImportModal(false);
      }}
    />
  </>
);
}

// --- RUTA PRIVADA ---

function PrivateRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- APP COMPONENT ---

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} onUserUpdate={setUser} />
        
        <Routes>
          {/* Rutas Colaborador Públicas / Semi-públicas */}
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLoginSuccess={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register onLoginSuccess={setUser} />} />
          <Route path="/quiz/:code" element={<QuizWelcome user={user} />} />
          
          {/* Rutas Colaborador Protegidas (Juego) */}
          <Route path="/quiz/:code/play" element={
            <PrivateRoute user={user}>
              <QuizPlay />
            </PrivateRoute>
          } />
          
          <Route path="/quiz/:code/leaderboard" element={
            <PrivateRoute user={user}>
              <QuizLeaderboard />
            </PrivateRoute>
          } />

          {/* Rutas de Gestión de Quizzes (Cualquier Colaborador puede Crear/Gestionar) */}
          <Route path="/admin" element={
            <PrivateRoute user={user}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/admin/create-quiz" element={
            <PrivateRoute user={user}>
              <AdminCreateQuiz />
            </PrivateRoute>
          } />
          
          <Route path="/admin/quiz/:id/manage" element={
            <PrivateRoute user={user}>
              <AdminQuizManage />
            </PrivateRoute>
          } />

          <Route path="/admin/quiz/:id/share" element={
            <PrivateRoute user={user}>
              <AdminQuizShare />
            </PrivateRoute>
          } />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
