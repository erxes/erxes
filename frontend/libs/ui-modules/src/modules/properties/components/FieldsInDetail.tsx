import { Button, Collapsible, Spinner } from 'erxes-ui';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { IFieldGroup, mutateFunction } from '../types/fieldsTypes';

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
            <FieldsInGroup group={group} />
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
};

export const FieldsInGroup = ({ group }: { group: IFieldGroup }) => {
  return <div className="grid gap-4 grid-cols-2"></div>;
};
