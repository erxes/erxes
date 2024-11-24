import React from 'react';

type ComponentLibraryProps = {
  page: any;
  onAddComponent: (component: {
    type: string;
    content: string;
    style: React.CSSProperties;
  }) => void;
};

const components = [
  { type: 'navigation', content: 'Navigation Menu', style: { fontSize: '16px' } },
  { type: 'footer', content: 'Footer', style: { fontSize: '16px' } },
  { type: 'imageGallery', content: 'Image Gallery', style: { fontSize: '16px' } },
];

const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  return (
    <div>
   
      {components.map((component) => (
        <div
          key={component.type}
          onClick={() => onAddComponent(component)}
          style={{
            margin: '8px 0',
            padding: '8px',
            border: '1px solid #ccc',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#f9f9f9',
          }}
        >
          {component.content}
        </div>
      ))}
    </div>
  );
};

export default ComponentLibrary;
