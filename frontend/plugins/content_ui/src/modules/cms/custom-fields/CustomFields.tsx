import {
  Button,
  Table,
  Spinner,
  useConfirm,
  toast,
  PageContainer,
} from 'erxes-ui';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';

import { CustomFieldsHeader } from './components/CustomFieldsHeader';
import { CmsSidebar } from '../shared/CmsSidebar';

import { ICustomFieldGroup, ICustomField } from './types/customFieldTypes';
import { useCustomFieldGroups } from './hooks/useCustomFieldGroups';
import { FieldGroupDrawer } from './components/field-group-drawer/FieldGroupDrawer';
import { FieldDrawer } from './components/field-drawer/FieldDrawer';
import { CustomFieldGroupItem } from './components/CustomFieldGroupItem';
import {
  CMS_CUSTOM_POST_TYPE_ADD,
  CMS_CUSTOM_POST_TYPES,
} from '../graphql/queries';
import { AiFieldSuggester } from './components/AiFieldSuggester';

const generateCode = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '') || 'custom_type';

const generatePluralLabel = (value: string) => {
  const normalized = value.trim();

  if (!normalized) {
    return 'Custom Types';
  }

  return normalized.endsWith('s') ? normalized : `${normalized}s`;
};

export function CustomFields() {
  const { websiteId } = useParams();
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
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

  const { data: customTypesData, refetch: refetchCustomTypes } = useQuery(
    CMS_CUSTOM_POST_TYPES,
    {
      variables: { clientPortalId: websiteId },
      skip: !websiteId,
    },
  );

  const [addCustomPostType] = useMutation(CMS_CUSTOM_POST_TYPE_ADD);

  const customTypes = customTypesData?.cmsCustomPostTypes || [];

  const createCustomPostType = async (suggestion?: string | null) => {
    const normalizedLabel = suggestion?.trim();

    if (!normalizedLabel || !websiteId) {
      return null;
    }

    const result = await addCustomPostType({
      variables: {
        input: {
          clientPortalId: websiteId,
          label: normalizedLabel,
          pluralLabel: generatePluralLabel(normalizedLabel),
          code: generateCode(normalizedLabel),
          description: `AI-generated custom post type for ${normalizedLabel}`,
        },
      },
    });

    await refetchCustomTypes();

    return result.data?.cmsCustomPostTypesAdd?._id || null;
  };

  const handleGroupSubmit = (data: any) => {
    const input = {
      label: data.label,
      code: data.code,
      clientPortalId: websiteId,
      customPostTypeIds: data.customPostTypeIds || [],
      fields: editingGroup?.fields || [],
    };

    if (editingGroup) {
      editGroup({ variables: { _id: editingGroup._id, input } });
    } else {
      addGroup({ variables: { input } });
    }
    setIsGroupDrawerOpen(false);
    setEditingGroup(null);
  };

  const handleFieldSubmit = async (data: any) => {
    if (!selectedGroup) return;

    const latestGroup =
      groups.find((g) => g._id === selectedGroup._id) || selectedGroup;

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

    const currentFields = Array.isArray(latestGroup.fields)
      ? latestGroup.fields
      : [];

    const updatedFields = editingField
      ? currentFields.map((f: any) =>
          f._id === editingField._id ? newField : f,
        )
      : [...currentFields, newField];

    editGroup({
      variables: {
        _id: latestGroup._id,
        input: {
          label: latestGroup.label,
          clientPortalId: websiteId || '',
          customPostTypeIds: latestGroup.customPostTypeIds || [],
          fields: updatedFields,
        },
      },
      onCompleted: async () => {
        toast({
          title: 'Success',
          description: editingField ? 'Field updated!' : 'Field created!',
        });
        setIsFieldDrawerOpen(false);
        setEditingField(null);

        const result = await refetch();
        const updatedList = result.data?.cmsCustomFieldGroupList?.list;

        if (updatedList) {
          const updatedGroup = updatedList.find(
            (g: ICustomFieldGroup) => g._id === latestGroup._id,
          );
          if (updatedGroup) setSelectedGroup(updatedGroup);
        }
      },
    });
  };

  const handleAiAcceptFields = async (
    aiFields: Array<{
      label: string;
      code: string;
      type: string;
      description?: string;
      isRequired: boolean;
      options: string[];
    }>,
    groupLabel: string,
    customPostTypeSuggestion?: string | null,
  ) => {
    const customPostTypeId = await createCustomPostType(
      customPostTypeSuggestion,
    );

    const newFields = aiFields.map((f) => ({
      _id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      ...f,
    }));

    addGroup({
      variables: {
        input: {
          label: groupLabel,
          clientPortalId: websiteId || '',
          customPostTypeIds: customPostTypeId ? [customPostTypeId] : [],
          fields: newFields,
        },
      },
      onCompleted: async () => {
        toast({
          title: 'Group created!',
          description: `"${groupLabel}" created with ${newFields.length} field${newFields.length === 1 ? '' : 's'}${customPostTypeSuggestion ? ` and a new custom post type "${customPostTypeSuggestion}"` : ''}.`,
        });

        const result = await refetch();
        const updatedList = result.data?.cmsCustomFieldGroupList?.list;

        if (updatedList) {
          const createdGroup = updatedList.find(
            (g: ICustomFieldGroup) => g.label === groupLabel,
          );
          if (createdGroup) {
            setSelectedGroup(createdGroup);
          }
        }
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

    confirm({ message: 'Are you sure you want to delete this field?' }).then(
      async () => {
        const latestGroup =
          groups.find((g) => g._id === selectedGroup._id) || selectedGroup;

        const currentFields = Array.isArray(latestGroup.fields)
          ? latestGroup.fields
          : [];

        const updatedFields = currentFields.filter(
          (f: any) => f._id !== fieldId,
        );

        editGroup({
          variables: {
            _id: latestGroup._id,
            input: {
              label: latestGroup.label,
              clientPortalId: websiteId || '',
              customPostTypeIds: latestGroup.customPostTypeIds || [],
              fields: updatedFields,
            },
          },
          onCompleted: async () => {
            toast({ title: 'Success', description: 'Field deleted!' });

            const result = await refetch();
            const updatedList = result.data?.cmsCustomFieldGroupList?.list;

            if (updatedList) {
              const updatedGroup = updatedList.find(
                (g: ICustomFieldGroup) => g._id === latestGroup._id,
              );
              if (updatedGroup) setSelectedGroup(updatedGroup);
            }
          },
        });
      },
    );
  };

  return (
    <PageContainer>
      <CustomFieldsHeader>
        <Button
          variant="outline"
          onClick={() => setIsAiDrawerOpen(true)}
          className="border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
        >
          <IconSparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>

        <Button
          onClick={() => {
            setEditingGroup(null);
            setIsGroupDrawerOpen(true);
          }}
        >
          <IconPlus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      </CustomFieldsHeader>

      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Name</Table.Head>
                      <Table.Head>Type</Table.Head>
                      <Table.Head className="w-12"></Table.Head>
                    </Table.Row>
                  </Table.Header>
                </Table>

                {loading ? (
                  <div className="py-12 text-center">
                    <Spinner />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="py-12 text-center border rounded-lg mt-2">
                    <p className="text-muted-foreground mb-4">
                      No field groups yet
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        className="border-violet-300 text-violet-700 hover:bg-violet-50"
                        onClick={() => setIsAiDrawerOpen(true)}
                      >
                        <IconSparkles className="w-4 h-4 mr-2" />
                        Generate with AI
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingGroup(null);
                          setIsGroupDrawerOpen(true);
                        }}
                      >
                        <IconPlus className="w-4 h-4 mr-2" />
                        Create Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
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

      <AiFieldSuggester
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        websiteId={websiteId || ''}
        onAcceptFields={handleAiAcceptFields}
      />
    </PageContainer>
  );
}
