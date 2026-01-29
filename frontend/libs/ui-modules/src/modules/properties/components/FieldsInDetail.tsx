import { Button, cn, Collapsible, Spinner } from 'erxes-ui';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { IFieldGroup, mutateFunction } from '../types/fieldsTypes';
import { useFields } from '../hooks/useFields';
import { Field } from './Field';

export const FieldsInDetail = ({
  fieldContentType,
  customFieldsData,
  mutateHook,
  id,
  className,
}: {
  fieldContentType: string;
  customFieldsData: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  id: string;
  className?: string;
}) => {
  const { fieldGroups, loading: fieldGroupsLoading } = useFieldGroups({
    contentType: fieldContentType,
  });

  if (fieldGroupsLoading) {
    return <Spinner containerClassName="py-6" />;
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {fieldGroups.map((group) => (
        <Collapsible key={group._id} className="group" defaultOpen>
          <Collapsible.Trigger asChild>
            <Button variant="secondary" className="w-full justify-start">
              <Collapsible.TriggerIcon />
              {group.name}
            </Button>
          </Collapsible.Trigger>
          <Collapsible.Content className="pt-4">
            <FieldsInGroup
              group={group}
              id={id}
              contentType={fieldContentType}
              customFieldsData={customFieldsData}
              mutateHook={mutateHook}
            />
          </Collapsible.Content>
        </Collapsible>
      ))}
    </div>
  );
};

export const FieldsInGroup = ({
  group,
  contentType,
  customFieldsData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  customFieldsData: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}) => {
  const { fields, loading } = useFields({ groupId: group._id, contentType });

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  return (
    <div className="grid gap-4 grid-cols-2">
      {fields.map((field) => (
        <Field
          key={field._id}
          field={field}
          value={customFieldsData[field._id] as string}
          customFieldsData={customFieldsData}
          id={id}
          mutateHook={mutateHook}
        />
      ))}
    </div>
  );
};
