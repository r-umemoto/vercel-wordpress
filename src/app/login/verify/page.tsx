'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Spinner from '@/components/Spinner';

export default function VerifyPage() {
  const router = useRouter();
  const [message, setMessage] = useState('ログイン処理を確認しています...');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifySignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          setError('メールアドレスが見つかりません。同じブラウザで操作を続けてください。');
          setMessage('');
          return;
        }

        try {
          const result = await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          
          const additionalInfo = getAdditionalUserInfo(result);

          if (additionalInfo?.isNewUser) {
            // Create a new document in Firestore for the new user
            await setDoc(doc(db, "users", result.user.uid), {
              displayName: result.user.displayName || '',
              email: result.user.email,
              address: ""
            });
          }

          router.push('/');

        } catch {
          setError('ログイン中にエラーが発生しました。リンクが無効であるか、有効期限が切れている可能性があります。');
          setMessage('');
        }
      } else {
        setError('無効なログインリンクです。');
        setMessage('');
      }
    };

    verifySignIn();
  }, [router]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {error ? (
        <div>
          <h2 style={{ color: 'red' }}>エラー</h2>
          <p>{error}</p>
          <a href="/login" style={{ color: 'blue', marginTop: '20px', display: 'inline-block' }}>ログインページに戻る</a>
        </div>
      ) : (
        <div>
          <Spinner />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
