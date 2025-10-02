'use client';

import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const AdminMap = dynamic(() => import('@/components/AdminMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

const MicroCMSMapPage = () => {
  return <AdminMap />;
};

export default MicroCMSMapPage;