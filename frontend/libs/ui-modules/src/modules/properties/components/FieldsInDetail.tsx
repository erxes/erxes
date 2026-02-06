import { useState, useCallback } from 'react';
import { Button, cn, InfoCard, Spinner } from 'erxes-ui';
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
        <FieldGroupCard
          key={group._id}
          group={group}
          id={id}
          contentType={fieldContentType}
          customFieldsData={customFieldsData}
          mutateHook={mutateHook}
        />
      ))}
    </div>
  );
};

const FieldGroupCard = ({
  group,
  contentType,
  customFieldsData,
  mutateHook,
  id,
}: {
  group: IFieldGroup;
  id: string;
  contentType: string;
  customFieldsData: Record<string, unknown>;
  mutateHook: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
}) => {
  const { fields, loading: fieldsLoading } = useFields({
    groupId: group._id,
    contentType,
  });
  const { mutate, loading: mutateLoading } = mutateHook();

  const [localData, setLocalData] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setLocalData((prev) => ({ ...prev, [fieldId]: value }));
    setIsDirty(true);
  }, []);

  const handleSave = () => {
    mutate({
      _id: id,
      customFieldsData: {
        ...customFieldsData,
        ...localData,
      },
    });
    setIsDirty(false);
    setLocalData({});
  };

  const handleCancel = () => {
    setLocalData({});
    setIsDirty(false);
    setResetKey((k) => k + 1);
  };

  return (
    <InfoCard title={group.name}>
      <InfoCard.Content>
        {fieldsLoading ? (
          <Spinner containerClassName="py-6" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {fields.map((field) => (
                <Field
                  key={`${field._id}-${resetKey}`}
                  field={field}
                  value={
                    field._id in localData
                      ? (localData[field._id] as string)
                      : (customFieldsData[field._id] as string)
                  }
                  customFieldsData={{
                    ...customFieldsData,
                    ...localData,
                  }}
                  id={id}
                  onFieldChange={(value) => handleFieldChange(field._id, value)}
                />
              ))}
            </div>
            {isDirty && (
              <div className="flex gap-2 justify-end pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  type="button"
                  disabled={mutateLoading}
                  onClick={handleSave}
                >
                  {mutateLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </>
        )}
      </InfoCard.Content>
    </InfoCard>
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
    <div className="grid grid-cols-2 gap-4">
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
