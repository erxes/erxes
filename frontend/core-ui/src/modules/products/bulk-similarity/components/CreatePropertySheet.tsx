import { Label, Select, Sheet, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useFieldGroups } from 'ui-modules';
import { PropertyForm } from '@/properties/components/PropertyForm';
import { useAddProperty } from '@/properties/hooks/useAddProperty';
import { IPropertyForm } from '@/properties/types/Properties';

const CONTENT_TYPE = 'core:product';

interface CreatePropertySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (fieldId: string, firstValue: string) => void;
  refetchFields: () => Promise<unknown>;
}

export const CreatePropertySheet = ({
  open,
  onOpenChange,
  onCreated,
  refetchFields,
}: CreatePropertySheetProps) => {
  const { addProperty, loading } = useAddProperty();
  const { fieldGroups, loading: groupsLoading } = useFieldGroups({
    contentType: CONTENT_TYPE,
  });

  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    if (!groupId && fieldGroups.length) {
      setGroupId(fieldGroups[0]._id);
    }
  }, [fieldGroups, groupId]);

  const handleOpenChange = (next: boolean) => {
    if (!next) setGroupId(fieldGroups[0]?._id ?? '');
    onOpenChange(next);
  };

  const handleSubmit = (data: IPropertyForm) => {
    addProperty({
      variables: {
        ...data,
        groupId: groupId || undefined,
        contentType: CONTENT_TYPE,
      },
      onCompleted: async (res) => {
        await refetchFields();
        const newId = res?.fieldAdd?._id;
        const firstValue = data.options?.[0]?.value;
        if (newId && firstValue) onCreated(newId, firstValue);
        toast({ title: 'Property created', variant: 'success' });
        handleOpenChange(false);
      },
      onError: (error) =>
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View className="flex flex-col p-0 sm:max-w-lg">
        <Sheet.Header className="gap-3">
          <Sheet.Title>New property</Sheet.Title>
          <Sheet.Close />
          <Sheet.Description className="sr-only">
            Create a property and add it to this similarity.
          </Sheet.Description>
        </Sheet.Header>

        <Sheet.Content className="flex-auto overflow-auto p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Group</Label>
              <Select
                value={groupId}
                onValueChange={setGroupId}
                disabled={groupsLoading || !fieldGroups.length}
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={
                      groupsLoading
                        ? 'Loading groups…'
                        : fieldGroups.length
                          ? 'Select group'
                          : 'No groups available'
                    }
                  />
                </Select.Trigger>
                <Select.Content>
                  {fieldGroups.map((group) => (
                    <Select.Item key={group._id} value={group._id}>
                      {group.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div onSubmit={(e) => e.stopPropagation()}>
              <PropertyForm
                onSubmit={handleSubmit}
                loading={loading}
                disableType
                defaultValues={{
                  icon: '123',
                  name: '',
                  type: 'multiSelect',
                  isSearchable: false,
                  description: '',
                  code: '',
                  validation: '',
                  options: [],
                }}
              />
            </div>
          </div>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
