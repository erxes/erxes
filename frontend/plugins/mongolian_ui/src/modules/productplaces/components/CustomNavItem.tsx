// frontend/plugins/mongolian_ui/src/components/CustomNavItem.tsx
import React from 'react';

interface CustomNavItemProps {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

export const CustomNavItem: React.FC<CustomNavItemProps> = ({ name, path, icon: Icon }) => {
  const handleClick = () => {
    // Use window.location instead of React Router
    window.location.href = `/${path}`;
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        margin: '4px 0',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <Icon size={16} />
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{name}</span>
    </div>
  );
};