import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import MediaSection from './sections/MediaSection';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true}>
    <MediaSection {...props} />
  </Sidebar>
);

export default LeftSidebar;
