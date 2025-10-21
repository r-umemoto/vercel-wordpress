'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Spinner from '@/components/Spinner';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Define a type for our custom user data
type CustomUserData = {
  displayName: string;
  email: string;
  address: string;
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Redirect if auth check is complete and user is not logged in
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as CustomUserData;
          setAddress(data.address || '');
        } else {
          // This case can happen if the user was created before we implemented Firestore doc creation
          const initialData = {
            displayName: user.displayName || '',
            email: user.email || '',
            address: '',
          };
          await setDoc(userDocRef, initialData);
          setAddress('');
        }
        setIsLoading(false);
      };
      fetchUserData();
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setMessage('更新中...');
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userDocRef, {
        address: address,
      });
      setMessage('プロフィールが正常に更新されました。');
    } catch (error) {
      console.error("Error updating document: ", error);
      setMessage('更新に失敗しました。');
    }
  };

  // Show spinner while auth or data loading
  if (authLoading || isLoading || !user) {
    return <Spinner />;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>プロフィール</h2>
      
      {/* Display basic info from Auth */}
      <div style={{ marginBottom: '15px' }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>名前:</strong>
        <span>{user.displayName || '未設定'}</span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>メールアドレス:</strong>
        <span>{user.email}</span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>メールアドレスの認証状態:</strong>
        {user.emailVerified ? (
          <span style={{ color: 'green' }}>認証済み</span>
        ) : (
          <span style={{ color: 'red' }}>未認証</span>
        )}
      </div>

      <hr style={{ margin: '20px 0' }} />

      {/* Form for custom data */}
      <h3>カスタム情報</h3>
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="address" style={{ display: 'block', marginBottom: '5px' }}>
            <strong >住所:</strong>
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="住所を入力してください"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '4px' }}>
          更新
        </button>
      </form>
      {message && <p style={{ marginTop: '15px', color: message.includes('失敗') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}
