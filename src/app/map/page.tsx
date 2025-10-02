'use client';

import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const PublicMap = dynamic(() => import('@/components/PublicMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

const MapPage = () => {
  return (
    <main className="w-screen h-screen">
      <PublicMap />
    </main>
  );
};

export default MapPage;