import { Button, Collapsible, Spinner } from 'erxes-ui';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { IFieldGroup, mutateFunction } from '../types/fieldsTypes';
import { useFields } from '../hooks/useFields';
import { FieldInDetail } from './FieldInDetail';

export const FieldsInDetail = ({
  fieldContentType,
  customFieldsData,
  mutateHook,
}: {
  fieldContentType: string;
  customFieldsData: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}) => {
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: fieldContentType,
  });

  if (fieldGroupsLoading) {
    return <Spinner />;
  }

  return (
    <div className="p-8">
      {fieldGroups.map((group) => (
        <Collapsible key={group._id} className="group">
          <Collapsible.Trigger asChild>
            <Button variant="secondary" className="w-full justify-start">
              <Collapsible.TriggerIcon />
              {group.name}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-2">
            <FieldsInGroup group={group} contentType={fieldContentType} />
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
};

export const FieldsInGroup = ({
  group,
  contentType,
}: {
  group: IFieldGroup;
  contentType: string;
}) => {
  const { fields, loading } = useFields({ groupId: group._id, contentType });

  if (loading) {
    return <Spinner className="py-6" />;
  }

  return (
    <div className="grid gap-4 grid-cols-2">
      {fields.map((field) => (
        <FieldInDetail key={field._id} field={field} />
      ))}
    </div>
  );
};
