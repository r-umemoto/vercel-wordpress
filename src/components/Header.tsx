'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">
            <Link href="/" className="hover:text-gray-300">
              RU不動産 (サンプル)
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              ホーム
            </Link>
            <Link href="/map" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              地図
            </Link>
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <span className="text-sm">こんにちは、{user.displayName || user.email}さん</span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  ログイン
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
