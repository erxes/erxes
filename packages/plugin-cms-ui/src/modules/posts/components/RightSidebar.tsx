import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import FeaturedImageSection from './sections/FeaturedImage';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar>

    <FeaturedImageSection {...props} />
  </Sidebar>
);

export default LeftSidebar;
