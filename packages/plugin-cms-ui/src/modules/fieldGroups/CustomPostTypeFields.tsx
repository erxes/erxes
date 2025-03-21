import React from 'react';
import { useQuery } from '@apollo/client';
import queries from './graphql/queries';
import Spinner from '@erxes/ui/src/components/Spinner';
import Box from '@erxes/ui/src/components/Box';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { SidebarContent } from '@erxes/ui-forms/src/settings/properties/styles';
import Button from '@erxes/ui/src/components/Button';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const CustomPostTypeFields = (props: Props) => {
  const customFieldsData = props.post?.customFieldsData || [];
  const [initialData, setInitialData] = React.useState(customFieldsData);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Update initial data when post changes
  React.useEffect(() => {
    setInitialData(customFieldsData);
  }, [props.post]);

  // Check for changes whenever customFieldsData updates
  React.useEffect(() => {
    const changesExist =
      JSON.stringify(customFieldsData) !== JSON.stringify(initialData);
    setHasChanges(changesExist);
  }, [customFieldsData, initialData]);

  const handleCancel = () => {
    props.onChange('customFieldsData', initialData);
  };

  const handleSave = () => {
    setInitialData(customFieldsData);
  };
  if (props.post?.type === 'post') {
    return null;
  }

  const { data, loading: fieldsGroupsQueryLoading } = useQuery(queries.LIST, {
    variables: {
      clientPortalId: props.clientPortalId,
      postType: props.post?.type,
    },
    skip: props.post?.type === 'post',
  });

  if (fieldsGroupsQueryLoading) {
    return <Spinner />;
  }

  const fieldGroups: any[] = data?.cmsCustomFieldGroups || [];

  const onChangeValue = ({ _id, value }: { _id: string; value: any }) => {
    const fieldIndex = customFieldsData.findIndex((c) => c.field === _id);

    if (fieldIndex !== -1) {
      customFieldsData[fieldIndex].value = value;
      props.onChange('customFieldsData', customFieldsData);
    } else {
      props.onChange('customFieldsData', [
        ...customFieldsData,
        {
          field: _id,
          value,
        },
      ]);
    }
  };

  return (
    <>
      {fieldGroups.map((group) => {
        const groupHasChanges = group.fields.some((field) => {
          const current = customFieldsData.find(
            (c) => c.field === field._id
          )?.value;
          const initial = initialData.find((c) => c.field === field._id)?.value;
          return current !== initial;
        });

        return (
          <Box key={group._id} title={group.label} name='showCustomData'>
            <SidebarContent>
              {group.fields.map((field: any, index) => (
                <GenerateField
                  field={field}
                  key={index}
                  onValueChange={onChangeValue}
                  defaultValue={
                    customFieldsData.find((c) => c.field === field._id)?.value
                  }
                />
              ))}
            </SidebarContent>

            {groupHasChanges && (
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '10px',
                  borderTop: '1px solid #eee',
                  marginTop: '10px',
                }}
              >
                <Button btnStyle='simple' onClick={handleCancel}>
                  Cancel
                </Button>
                <Button btnStyle='success' onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </Box>
        );
      })}
    </>
  );
};

export default CustomPostTypeFields;
