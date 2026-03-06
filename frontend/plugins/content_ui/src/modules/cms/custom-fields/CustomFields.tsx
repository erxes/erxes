import {
  Button,
  Table,
  Spinner,
  useConfirm,
  toast,
  PageContainer,
  PageSubHeader,
  Kbd,
} from 'erxes-ui';
import { IconAlignJustified, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { CustomFieldsHeader } from './components/CustomFieldsHeader';
import { CmsSidebar } from '../shared/CmsSidebar';

import { ICustomFieldGroup, ICustomField } from './types/customFieldTypes';
import { useCustomFieldGroups } from './hooks/useCustomFieldGroups';
import { FieldGroupDrawer } from './components/field-group-drawer/FieldGroupDrawer';
import { FieldDrawer } from './components/field-drawer/FieldDrawer';
import { CustomFieldGroupItem } from './components/CustomFieldGroupItem';
import { CMS_CUSTOM_POST_TYPES } from '../graphql/queries';
import { EmptyState } from '../shared/EmptyState';

export function CustomFields() {
  const { websiteId } = useParams();
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ICustomFieldGroup | null>(
    null,
  );
  const [editingGroup, setEditingGroup] = useState<ICustomFieldGroup | null>(
    null,
  );
  const [editingField, setEditingField] = useState<ICustomField | null>(null);
  const { confirm } = useConfirm();

  const { groups, loading, refetch, addGroup, editGroup, removeGroup } =
    useCustomFieldGroups(websiteId);

  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });

  const customTypes = customTypesData?.cmsCustomPostTypes || [];
  const totalFields = groups.reduce((count, group) => {
    return count + (group.fields?.length || 0);
  }, 0);

  const handleGroupSubmit = (data: any) => {
    const input = {
      label: data.label,
      code: data.code,
      clientPortalId: websiteId,
      customPostTypeIds: data.customPostTypeIds || [],
      fields: editingGroup?.fields || [],
    };

    if (editingGroup) {
      editGroup({
        variables: {
          _id: editingGroup._id,
          input,
        },
      });
    } else {
      addGroup({
        variables: {
          input,
        },
      });
    }
    setIsGroupDrawerOpen(false);
    setEditingGroup(null);
  };

  const handleFieldSubmit = (data: any) => {
    if (!selectedGroup) return;

    const newField = {
      _id: editingField?._id || `field_${Date.now()}`,
      label: data.label,
      code: data.code,
      type: data.type,
      description: data.description,
      isRequired: data.isRequired,
      options: data.options
        ? data.options.split(',').map((o: string) => o.trim())
        : [],
    };

    const currentFields = Array.isArray(selectedGroup.fields)
      ? selectedGroup.fields
      : [];
    let updatedFields;

    if (editingField) {
      updatedFields = currentFields.map((f: any) =>
        f._id === editingField._id ? newField : f,
      );
    } else {
      updatedFields = [...currentFields, newField];
    }

    editGroup({
      variables: {
        _id: selectedGroup._id,
        input: {
          label: selectedGroup.label,
          code: selectedGroup.code,
          clientPortalId: websiteId || '',
          customPostTypeIds: selectedGroup.customPostTypeIds || [],
          fields: updatedFields,
        },
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: editingField ? 'Field updated!' : 'Field created!',
        });
        setIsFieldDrawerOpen(false);
        setEditingField(null);
        refetch();
      },
    });
  };

  const handleEditGroup = (group: ICustomFieldGroup) => {
    setEditingGroup(group);
    setIsGroupDrawerOpen(true);
  };

  const handleEditField = (field: ICustomField) => {
    setEditingField(field);
    setIsFieldDrawerOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    confirm({
      message:
        'Are you sure you want to delete this field group? All fields in this group will also be deleted.',
    }).then(() => {
      removeGroup({ variables: { _id: groupId } });
    });
  };

  const handleDeleteField = (fieldId: string) => {
    if (!selectedGroup) return;
    confirm({
      message: 'Are you sure you want to delete this field?',
    }).then(() => {
      const currentFields = Array.isArray(selectedGroup.fields)
        ? selectedGroup.fields
        : [];
      const updatedFields = currentFields.filter((f: any) => f._id !== fieldId);

      editGroup({
        variables: {
          _id: selectedGroup._id,
          input: {
            label: selectedGroup.label,
            code: selectedGroup.code,
            clientPortalId: websiteId || '',
            customPostTypeIds: selectedGroup.customPostTypeIds || [],
            fields: updatedFields,
          },
        },
        onCompleted: () => {
          toast({ title: 'Success', description: 'Field deleted!' });
          const updatedGroup = { ...selectedGroup, fields: updatedFields };
          setSelectedGroup(updatedGroup);
        },
      });
    });
  };

  return (
    <PageContainer>
      <CustomFieldsHeader>
        <Button
          onClick={() => {
            setEditingGroup(null);
            setIsGroupDrawerOpen(true);
          }}
        >
          <IconPlus />
          Add Group
          <Kbd>G</Kbd>
        </Button>
      </CustomFieldsHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <PageSubHeader>
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="text-sm text-muted-foreground">
                {`Found ${groups.length} groups and ${totalFields} fields`}
              </div>
            </div>
          </PageSubHeader>
          <div className="overflow-hidden flex-auto p-3">
            <div className="h-full rounded-lg border overflow-auto bg-background">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-1/2">Group / Field</Table.Head>
                    {/* <Table.Head className="w-1/4">Type</Table.Head> */}
                    <Table.Head className="w-1/4"></Table.Head>
                  </Table.Row>
                </Table.Header>
              </Table>

              {loading ? (
                <div className="py-20 text-center">
                  <Spinner />
                </div>
              ) : groups.length === 0 ? (
                <EmptyState
                  icon={IconAlignJustified}
                  title="No custom field groups yet"
                  description="Create your first group to define custom fields for posts and custom post types."
                  actionLabel="Add Group"
                  onAction={() => {
                    setEditingGroup(null);
                    setIsGroupDrawerOpen(true);
                  }}
                />
              ) : (
                <div className="flex flex-col">
                  {groups.map((group) => (
                    <CustomFieldGroupItem
                      key={group._id}
                      group={group}
                      selectedGroupId={selectedGroup?._id || null}
                      onSelectGroup={setSelectedGroup}
                      onEditGroup={handleEditGroup}
                      onDeleteGroup={handleDeleteGroup}
                      onEditField={handleEditField}
                      onDeleteField={handleDeleteField}
                      onAddField={() => {
                        setSelectedGroup(group);
                        setEditingField(null);
                        setIsFieldDrawerOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FieldGroupDrawer
        isOpen={isGroupDrawerOpen}
        onClose={() => {
          setIsGroupDrawerOpen(false);
          setEditingGroup(null);
        }}
        onSubmit={handleGroupSubmit}
        editingGroup={editingGroup}
        customTypes={customTypes}
      />

      <FieldDrawer
        isOpen={isFieldDrawerOpen}
        onClose={() => {
          setIsFieldDrawerOpen(false);
          setEditingField(null);
        }}
        onSubmit={handleFieldSubmit}
        editingField={editingField}
      />
    </PageContainer>
  );
}
