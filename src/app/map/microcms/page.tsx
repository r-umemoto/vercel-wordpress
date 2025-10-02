'use client';

import dynamic from 'next/dynamic';
import Spinner from '@/components/Spinner';

const GoogleMap = dynamic(() => import('@/components/GoogleMap'), {
  ssr: false,
  loading: () => <Spinner />,
});

const MicroCMSMapPage = () => {
  return <GoogleMap isMicroCMS={true} />;
};

export default MicroCMSMapPage;