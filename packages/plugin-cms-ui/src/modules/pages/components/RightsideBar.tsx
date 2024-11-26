import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import ComponentEditor from './PropertiesEditor';
import Components from './ComponentLibrary';

type Props = {
  page: any;
  component: any;
  onEditComponent: (component: any) => void;
};

const RightSideBar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true} hasBorder={false}>
    <ComponentEditor
      component={props.component}
      onUpdate={(comp) => {
        console.log('update');
      }}
    />
  </Sidebar>
);

export default RightSideBar;
