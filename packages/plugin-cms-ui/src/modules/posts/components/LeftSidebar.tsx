import { Sidebar } from '@erxes/ui/src';
import React from 'react';
import TypeFilter from './filters/TypeFIlter';


type Props = {
  clientPortalId: string;
  onChange: (key: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true} hasBorder={true}>
    <TypeFilter {...props} />
  </Sidebar>
);

export default LeftSidebar;
