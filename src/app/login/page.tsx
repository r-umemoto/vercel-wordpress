'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { sendSignInLinkToEmail } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/login/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('ログインリンクを記載したメールを送信しました。メールをご確認ください。');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>ログイン / 新規登録</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>メールアドレスを入力してください。ログイン用のリンクをお送りします。</p>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '送信中...' : 'ログインリンクを送信'}
        </button>
      </form>
    </div>
  );
}
