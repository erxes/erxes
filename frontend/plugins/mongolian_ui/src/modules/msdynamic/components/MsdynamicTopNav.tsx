import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { label: 'Sync History', value: 'sync-history' },
  { label: 'Check Orders', value: 'synced-orders' },
  { label: 'Check Categories', value: 'categories' },
  { label: 'Check Products', value: 'products' },
  { label: 'Check Price', value: 'prices' },
  { label: 'Check Customers', value: 'customers' },
];

const MsdynamicTopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 24, padding: '0 20px' }}>
        {tabs.map((tab) => {
          const isActive = currentPath.includes(tab.value);

          return (
            <div
              key={tab.value}
              onClick={() => navigate(`/mongolian/msdynamic/${tab.value}`)}
              style={{
                cursor: 'pointer',
                padding: '12px 0',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#5c6ac4' : '#6b7280',
                borderBottom: isActive
                  ? '2px solid #5c6ac4'
                  : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MsdynamicTopNav;
