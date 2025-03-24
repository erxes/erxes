import React from 'react';
import { useQuery } from '@apollo/client';
import queries from './graphql/queries';
import Spinner from '@erxes/ui/src/components/Spinner';
import Box from '@erxes/ui/src/components/Box';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';

import Button from '@erxes/ui/src/components/Button';
import Group from './CustomPostTypeFields';
type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const CustomPostTypeGroup = (props: Props) => {
  const customFieldsData = props.post?.customFieldsData || [];
  const { data, loading: fieldsGroupsQueryLoading } = useQuery(queries.LIST, {
    variables: {
      clientPortalId: props.clientPortalId,
      postType: props.post?.type,
    },
    skip: props.post?.type === 'post',
  });

  if (props.post?.type === 'post') {
    return null;
  }

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
