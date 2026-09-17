import { IconInfoCircle } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import {
  IField,
  IFieldGroup,
  PropertyFormField,
  isFieldVisibleByLogic,
  useFieldGroups,
  useFields,
} from 'ui-modules';

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
  visibility: 'create' | 'detail';
  fieldIds?: string[];
  propertiesData: TConvertPropertiesData;
  onFieldChange: (fieldId: string, value: unknown) => void;
};

const isFieldShown = (
  field: IField,
  { fieldIds, visibility, propertiesData }: TConvertPropertiesProps,
) => {
  if (fieldIds && !fieldIds.includes(field._id)) {
    return false;
  }

  const visible =
    visibility === 'create'
      ? field.isVisibleToCreate
      : field.isVisible !== false;

  return Boolean(visible) && isFieldVisibleByLogic(field, propertiesData);
};

const ConvertPropertyGroup = ({
  group,
  ...props
}: TConvertPropertiesProps & { group: IFieldGroup }) => {
  const { fields, loading } = useFields({
    groupId: group._id,
    contentType: props.contentType,
    limit: 100,
  });

  if (loading) {
    return <Spinner containerClassName="py-4" />;
  }

  const shownFields = fields.filter((field) => isFieldShown(field, props));

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
            value={props.propertiesData[field._id]}
            idPrefix={`convert_${props.contentType.replace(':', '_')}`}
            onFieldChange={props.onFieldChange}
          />
        ))}
      </div>
    </div>
  );
};

export const ConvertPropertiesSection = ({
  onNavigate,
  visibility = 'create',
  ...props
}: Omit<TConvertPropertiesProps, 'visibility'> & {
  visibility?: TConvertPropertiesProps['visibility'];
  onNavigate?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { fieldGroups, loading } = useFieldGroups({
    contentType: props.contentType,
    limit: 100,
  });

  const groups = fieldGroups.filter((group) => !group.configs?.isMultiple);

  const handleConfigure = () => {
    onNavigate?.();
    navigate(`/settings/properties/${props.contentType}`);
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
            visibility={visibility}
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

export const ConvertProperties = ({
  type,
  pipelineId,
  ...props
}: Pick<TConvertPropertiesProps, 'propertiesData' | 'onFieldChange'> & {
  type: ConversationConvertType;
  pipelineId?: string;
  onNavigate: () => void;
}) => {
  const { pipeline, loading } = useGetPipeline(
    type === 'ticket' ? pipelineId || undefined : undefined,
  );

  if (type === 'task') {
    return null;
  }

  if (type === 'deal') {
    return <ConvertPropertiesSection contentType="sales:deal" {...props} />;
  }

  if (!pipelineId) {
    return null;
  }

  if (loading) {
    return <Spinner containerClassName="py-6" />;
  }

  return (
    <ConvertPropertiesSection
      contentType="frontline:ticket"
      visibility="detail"
      fieldIds={
        pipeline?.isPropertySelectionConfigured
          ? pipeline.propertyIds || []
          : undefined
      }
      {...props}
    />
  );
};
