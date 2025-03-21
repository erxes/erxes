import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import CategorySection from './sections/CategorySection';
import CustomFieldsSection from './sections/CustomFieldsSection';
import MainSection from './sections/MainSection';
import TagsSection from './sections/TagsSection';
import CustomPostTypeFields from '../../../fieldGroups/CustomPostTypeFields';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true} hasBorder={true}>
    <MainSection {...props} />
    <CategorySection {...props} />
    <TagsSection {...props} />
    <CustomFieldsSection {...props} isDetail={true} />
    <CustomPostTypeFields {...props} />
  </Sidebar>
);

export default LeftSidebar;
