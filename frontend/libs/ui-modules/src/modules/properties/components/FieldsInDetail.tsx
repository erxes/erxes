import { IconPlus } from '@tabler/icons-react';
import { Button, cn, Collapsible, InfoCard, Spinner, Tooltip } from 'erxes-ui';
import { useState } from 'react';
import { useFieldGroups } from '../hooks/useFieldGroups';
import { useFields } from '../hooks/useFields';
import { IFieldGroup, mutateFunction } from '../types/fieldsTypes';
import { Field, FieldMultiple } from './Field';

const FieldGroupContent = ({
  group,
  contentType,
  propertiesData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, any>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}) => {
  const { configs } = group || {};

  if (configs?.isMultiple) {
    return (
      <MultipleFieldsInGroup
        group={group}
        id={id}
        contentType={contentType}
        propertiesData={propertiesData}
        mutateHook={mutateHook}
      />
    );
  }

  return (
    <Collapsible key={group._id} className="group" defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="secondary" className="justify-start w-full">
          <Collapsible.TriggerIcon />
          {group.name}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <FieldsInGroup
          group={group}
          id={id}
          contentType={contentType}
          propertiesData={propertiesData}
          mutateHook={mutateHook}
        />
      </Collapsible.Content>
    </Collapsible>
  );
};

export const FieldsInDetail = ({
  fieldContentType,
  propertiesData,
  mutateHook,
  id,
  className,
}: {
  fieldContentType: string;
  propertiesData: Record<string, any>;
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
      <InfoCard title="Product Properties">
        <InfoCard.Content>
          {fieldGroups.map((group) => (
            <FieldGroupContent
              key={group._id}
              group={group}
              id={id}
              contentType={fieldContentType}
              propertiesData={propertiesData}
              mutateHook={mutateHook}
            />
          ))}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export const FieldsInGroup = ({
  group,
  contentType,
  propertiesData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, any>;
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
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field) => (
        <Field
          key={field._id}
          field={field}
          value={propertiesData[field._id] as string}
          propertiesData={propertiesData}
          id={id}
          mutateHook={mutateHook}
        />
      ))}
    </div>
  );
};

export const MultipleFieldsInGroup = ({
  group,
  contentType,
  propertiesData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  inCell?: boolean;
  contentType: string;
  propertiesData: Record<string, any>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}) => {
  const { fields, loading } = useFields({ groupId: group._id, contentType });

  const [properties, setProperties] = useState<any[]>(
    propertiesData[group._id] || [{}],
  );

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  const handleAddProperty = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setProperties([...properties, {}]);
  };

  return (
    <Collapsible key={group._id} className="group" defaultOpen>
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="flex gap-2 justify-start items-center px-0 pl-3 w-full"
        >
          <Collapsible.TriggerIcon />
          <span className="flex-1 text-left">{group.name}</span>

          <Tooltip delayDuration={1}>
            <Tooltip.Trigger asChild>
              <Button onClick={handleAddProperty} variant="ghost" size="icon">
                <IconPlus />
              </Button>
            </Tooltip.Trigger>

            <Tooltip.Content side="left">
              <p>Add row</p>
            </Tooltip.Content>
          </Tooltip>
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="pt-4">
        <div className="flex flex-col gap-4">
          {properties.map((property: any, index: number) => (
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <FieldMultiple
                  key={field._id}
                  group={group}
                  field={field}
                  propertyIndex={index}
                  value={property[field._id] as string}
                  propertiesData={propertiesData}
                  id={id}
                  mutateHook={mutateHook}
                />
              ))}
            </div>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
