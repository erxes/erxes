import { Outlet } from 'react-router-dom';
import MsdynamicTopNav from '@/msdynamic/components/MsdynamicTopNav';

const MsdynamicLayout = () => {
  return (
    <div style={{ padding: 20 }}>
      <MsdynamicTopNav />

      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default MsdynamicLayout;
