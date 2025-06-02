import { Sidebar } from '@erxes/ui/src';
import React from 'react';

import CategorySection from './sections/CategorySection';
import CustomFieldsSection from './sections/CustomFieldsSection';
import MainSection from './sections/MainSection';
import TagsSection from './sections/TagsSection';
import CustomPostTypeGroup from '../../../fieldGroups/CustomPostTypeGroup';
import { IPostTranslation, IWebSite } from '../../../../types';

type Props = {
  clientPortalId: string;
  post: any;
  translations: IPostTranslation[];
  website: IWebSite;
  currentLanguage: string;
  setTranslations: (translations: IPostTranslation[]) => void;
  onChange: (field: string, value: any) => void;
};

const LeftSidebar: React.FC<Props> = (props: Props) => (
  <Sidebar wide={true} hasBorder={true}>
    <MainSection {...props} />
    <CategorySection {...props} />
    <TagsSection {...props} />
    <CustomFieldsSection {...props} isDetail={true} />
    <CustomPostTypeGroup {...props} customFieldsData={props.post.customFieldsData || []} />
  </Sidebar>
);

export default LeftSidebar;
