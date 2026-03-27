import React, { useState, useEffect } from 'react';
import { getAdminEmails, saveAdminEmails } from '../../context/AuthContext';
import '../Admin.css';

export const AdminSettings = () => {
  const [adminEmails, setAdminEmails] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    setAdminEmails(getAdminEmails());
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (newAdminEmail.trim() && !adminEmails.includes(newAdminEmail.toLowerCase())) {
      const updated = [...adminEmails, newAdminEmail.toLowerCase()];
      setAdminEmails(updated);
      saveAdminEmails(updated);
      setNewAdminEmail('');
      alert('Администратор добавлен');
    }
  };

  const handleRemoveAdmin = (email) => {
    if (window.confirm(`Удалить ${email} из администраторов?`)) {
      const updated = adminEmails.filter((e) => e !== email);
      setAdminEmails(updated);
      saveAdminEmails(updated);
      alert('Администратор удален');
    }
  };

  return (
    <div className="admin-settings">
      <div className="admin-header">
        <h1>Управление администраторами</h1>
      </div>
      <div className="form-container">
        <form className="admin-form" onSubmit={handleAddAdmin}>
          <h2>Добавить администратора</h2>
          <div className="form-row">
            <input
              type="email"
              placeholder="Email нового администратора"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              Добавить
            </button>
          </div>
        </form>
      </div>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {adminEmails.map((email) => (
              <tr key={email}>
                <td>{email}</td>
                <td className="actions">
                  <button
                    className="btn-sm btn-delete"
                    onClick={() => handleRemoveAdmin(email)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box" style={{marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '6px', borderLeft: '4px solid #2aabee'}}>
        <p><strong>ℹ️ Информация:</strong></p>
        <p>Это временное решение для управления администраторами до реализации полной системы ролей на бэкенде.</p>
        <p>Администраторы определяются по email адресу.</p>
      </div>
    </div>
  );
};
