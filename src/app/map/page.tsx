'use client';

import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const GoogleMapComponent = dynamic(() => import('@/components/GoogleMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

const MapPage = () => {
  return (
    <main className="w-screen h-screen">
      <GoogleMapComponent />
    </main>
  );
};

export default MapPage;