
import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React, { useState } from 'react';
import ComponentLibrary from './ComponentLibrary';
import DropZone from './DropZone';
import ComponentEditor from './PropertiesEditor';
import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from './LeftsideBar';

// import LeftSideBar from './LeftSideBar';
// import RightSidebar from './RightSideBar';
// import InfoSection from './sections/InfoSection';


export type ComponentType = {
  id: string;
  type: string;
  content: string;
};

type Props = {
    page: any;
    clinetPortal: any
}

const WebBuilder = (props:Props) => {
    const [page, setPage] = useState(props.page);
    const cp = props.clinetPortal;
    // const title = page.name;


    const title = cp?.name + '\t' + (cp.url || cp.domain);

    const breadcrumb = [
        {
          title: __('WebBuilder'),
          link: `/cms/web-builder/pages?web=${props.clientPortalId}`,
        },
        { title },
      ];

  // Initial components in the drop zone
  const [components, setComponents] = useState<ComponentType[]>([]);

  // Function to handle adding a component to the drop zone
  const handleAddComponent = (component: any) => {
    setComponents((prevComponents) => [
      ...prevComponents,
      { ...component, id: `${component.type}-${Date.now()}` }, // Generate unique ID
    ]);
  };

  // Function to handle reordering of components in the drop zone
  const handleReorderComponents = (newComponents: ComponentType[]) => {
    setComponents(newComponents);
  };

  return (
    <Wrapper
    header={<Wrapper.Header title={'Web Builder'} breadcrumb={breadcrumb} />}
    mainHead={
        <h4>{`Page: ${page.name}`}</h4>
    }
    leftSidebar={<LeftSidebar page={page} onAddComponent={handleAddComponent} />}
    rightSidebar={
      <ComponentEditor component={undefined} onUpdate={(comp)=>{
        console.log('update');
      }}/>
    }
    content={<DropZone components={components} onReorder={handleReorderComponents} />}
    transparent={true}
  />
  )

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Panel: Component Library */}
      <div
        style={{
          width: '250px',
          background: '#f4f4f4',
          padding: '16px',
          borderRight: '1px solid #ddd',
        }}
      >
        <ComponentLibrary onAddComponent={handleAddComponent} />
      </div>

      {/* Center Panel: Drop Zone */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          background: '#fff',
          borderRight: '1px solid #ddd',
        }}
      >
        <h3>Drop Zone</h3>
        <DropZone components={components} onReorder={handleReorderComponents} />
      </div>

      {/* Right Panel: Properties Editor */}
      <div
        style={{
          width: '300px',
          padding: '16px',
          background: '#f9f9f9',
        }}
      >
        <h3>Select a component to edit</h3>
        {/* Here you can add a component editor based on selection */}
      </div>
    </div>
  );
};

export default WebBuilder;
