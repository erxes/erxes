import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import CategorySection from './sections/CategorySection';
import TagsSection from './sections/TagsSection';
import MainSection from './sections/MainSection';

type Props = {
  post: any;
  onChange: (field: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true}>
    <MainSection {...props} />
    <CategorySection {...props} />
    <TagsSection {...props} />
  </Sidebar>
);

export default LeftSidebar;
