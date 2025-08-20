import { useQuery } from '@apollo/client';
import Box from '@erxes/ui/src/components/Box';
import Spinner from '@erxes/ui/src/components/Spinner';
import React from 'react';
import queries from './graphql/queries';

import Group from './CustomPostTypeFields';
import { IPostTranslation, IWebSite } from '../../types';
type Props = {
  clientPortalId: string;
  post?: any;
  category?: any;
  page?: any;
  website: IWebSite;
  currentLanguage: string;
  translations: IPostTranslation[];
  setTranslations: (translations: IPostTranslation[]) => void;
  onChange: (field: string, value: any) => void;
};

const CustomPostTypeGroup = (props: Props) => {
  const customFieldsData = props.post?.customFieldsData || [];
  const { data, loading: fieldsGroupsQueryLoading } = useQuery(queries.LIST, {
    variables: {
      clientPortalId: props.clientPortalId,
      postType: props.post?.type,
      categoryId: props.category?._id,
      pageId: props.page?._id,
    },
  });

  if (fieldsGroupsQueryLoading) {
    return <Spinner />;
  }

  const fieldGroups: any[] = data?.cmsCustomFieldGroups || [];

  return (
    <>
      {fieldGroups.map((group, index) => {
        return (
          <Box key={group._id} title={group.label} name='showCustomData'>
            <Group
              {...props}
              key={index}
              group={group}
              customFieldsData={customFieldsData}
            />
          </Box>
        );
      })}
    </>
  );
};

export default CustomPostTypeGroup;
