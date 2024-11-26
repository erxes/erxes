import { UserHeader } from '@erxes/ui-contacts/src/customers/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React, { useState } from 'react';
import ComponentLibrary from './ComponentLibrary';
import DropZone from './DropZone';

import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from './LeftsideBar';
import RightSidebar from './RightsideBar';

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
  clinetPortal: any;
};

const WebBuilder = (props: Props) => {
  const [page, setPage] = useState(props.page);
  const [currentComponent, setCurrentComponent] = useState(null);
  const cp = props.clinetPortal;
  // const title = page.name;

  const title = cp?.name + '\t' + (cp.url || cp.domain);

  const breadcrumb = [
    {
      title: __('WebBuilder'),
      link: `/cms/web-builder/pages?web=${props.clinetPortal._id}`,
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

  console.log('currentComponent', currentComponent);

  return (
    <Wrapper
      header={<Wrapper.Header title={'Web Builder'} breadcrumb={breadcrumb} />}
      mainHead={<h4>{`Page: ${page.name}`}</h4>}
      leftSidebar={
        <LeftSidebar page={page} onAddComponent={handleAddComponent} />
      }
      rightSidebar={
        <RightSidebar page={page} onEditComponent={handleAddComponent} component={currentComponent}/>
      }
      content={
        <DropZone components={components} onReorder={handleReorderComponents} onSelect={(c) => {
          setCurrentComponent(c);
        }}/>
      }
      transparent={true}
    />
  );
};

export default WebBuilder;
