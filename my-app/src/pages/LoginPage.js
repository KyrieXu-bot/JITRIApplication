import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'jitri@123') {
      onLoginSuccess();      // 设置为已登录
      navigate('/home');     // 跳转到主页
    } else {
      setError('密码错误，请重试');
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>请输入密码进入系统</h2>
      <input
        type="password"
        placeholder="请输入密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
            handleLogin();  // 按下回车键时触发登录
            }
        }}
        style={{ padding: '0.5rem', marginRight: '1rem' }}
    />
      <button onClick={handleLogin}>登录</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default LoginPage;
