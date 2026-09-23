import { IconInfoCircle } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IField,
  IFieldGroup,
  PropertyFormField,
  isFieldVisibleByLogic,
  useFieldGroups,
  useFields,
} from 'ui-modules';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { CONVERT_TYPE_OPTIONS } from './convertForm';

export type TConvertPropertiesData = Record<string, unknown>;

export const cleanConvertPropertiesData = (
  propertiesData: TConvertPropertiesData,
) => {
  const entries = Object.entries(propertiesData).filter(
    ([, value]) => value !== undefined && value !== null && value !== '',
  );

  return entries.length ? Object.fromEntries(entries) : undefined;
};

type TConvertPropertiesProps = {
  contentType: string;
  propertiesData: TConvertPropertiesData;
  onFieldChange: (fieldId: string, value: unknown) => void;
};

const isFieldShown = (field: IField, propertiesData: TConvertPropertiesData) =>
  Boolean(field.isVisibleToCreate) &&
  isFieldVisibleByLogic(field, propertiesData);

const ConvertPropertyGroup = ({
  group,
  contentType,
  propertiesData,
  onFieldChange,
}: TConvertPropertiesProps & { group: IFieldGroup }) => {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType,
    limit: 100,
  });

  if (loading) {
    return <Spinner containerClassName="py-4" />;
  }

  const shownFields = fields.filter((field) =>
    isFieldShown(field, propertiesData),
  );

  if (!shownFields.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <span className="text-sm font-medium">{group.name}</span>
      <div className="grid grid-cols-2 gap-4">
        {shownFields.map((field) => (
          <PropertyFormField
            key={field._id}
            field={field}
            value={propertiesData[field._id]}
            idPrefix={`convert_${contentType.replace(':', '_')}`}
            onFieldChange={onFieldChange}
          />
        ))}
      </div>
    </div>
  );
};

export const ConvertProperties = ({
  type,
  onNavigate,
  ...props
}: Omit<TConvertPropertiesProps, 'contentType'> & {
  type: ConversationConvertType;
  onNavigate: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const contentType = CONVERT_TYPE_OPTIONS[type].propertyContentType;
  const { fieldGroups, loading } = useFieldGroups({ contentType, limit: 100 });

  const groups = fieldGroups.filter((group) => !group.configs?.isMultiple);

  const handleConfigure = () => {
    onNavigate();
    navigate(`/settings/properties/${contentType}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t('properties', 'Properties')}
      </span>
      {loading ? (
        <Spinner containerClassName="py-6" />
      ) : (
        groups.map((group) => (
          <ConvertPropertyGroup
            key={group._id}
            group={group}
            contentType={contentType}
            {...props}
          />
        ))
      )}
      <button
        type="button"
        onClick={handleConfigure}
        className="flex w-full cursor-pointer items-start gap-2.5 rounded-lg border border-info/40 bg-info/10 px-3 py-2.5 text-left text-xs text-info hover:bg-info/15"
      >
        <IconInfoCircle className="mt-0.5 size-3.5 shrink-0" />
        <span className="leading-5 underline underline-offset-2">
          {t(
            'configure-properties-in-settings',
            'Configure properties in settings',
          )}
        </span>
      </button>
    </div>
  );
};
