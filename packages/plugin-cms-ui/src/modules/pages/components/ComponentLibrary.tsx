import React from 'react';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import { Box, Button } from '@erxes/ui/src/components';

type ComponentLibraryProps = {
  page: any;
  onAddComponent: (component: {
    type: string;
    content: string;
    style: React.CSSProperties;
  }) => void;
};

const components = [
  { type: 'header', content: 'Header', style: { fontSize: '16px' } },
  { type: 'footer', content: 'Footer', style: { fontSize: '16px' } },
  { type: 'slider', content: 'Slider', style: { fontSize: '16px' } },
  // { type: 'banner', content: 'Banner', style: { fontSize: '16px' } },
  {
    type: 'productCategory',
    content: 'Product categories',
    style: { fontSize: '16px' },
  },
  { type: 'product', content: 'Products', style: { fontSize: '16px' } },
  { type: 'post', content: 'Posts', style: { fontSize: '16px' } },
  {
    type: 'postCategory',
    content: 'Post categories',
    style: { fontSize: '16px' },
  },
  { type: 'properties', content: 'Properties', style: { fontSize: '16px' } },
  { type: 'tours', content: 'Tours', style: { fontSize: '16px' } },
  { type: 'forms', content: 'Form', style: { fontSize: '16px' } },
];

const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  return (
    <Box title={'Component library'} isOpen={true}>
      <SidebarList className='no-link'>
        {components.map((component) => (
          <li key={component.type} onClick={() => onAddComponent(component)}>
            <Button btnStyle="link" icon="plus-1" size='small' />
            {component.content}
          </li>
        ))}
      </SidebarList>
    </Box>
  );
};

export default ComponentLibrary;
