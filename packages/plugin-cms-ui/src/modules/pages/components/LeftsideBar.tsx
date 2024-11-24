import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import Components from './ComponentLibrary';


type Props = {
  page: any;
  onAddComponent: (component:any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true} hasBorder={false}>
    <Components {...props} />
  </Sidebar>
);

export default LeftSidebar;
