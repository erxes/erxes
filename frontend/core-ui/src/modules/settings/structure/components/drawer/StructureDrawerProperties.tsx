import { IconListDetails } from '@tabler/icons-react';
import { Button, cn, TextField } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Can, FieldsInDetail } from 'ui-modules';
import {
  STRUCTURE_CAPABILITY,
  STRUCTURE_PROPERTIES_CONTENT_TYPE,
} from '../../constants/structureCapabilities';
import { useStructureEntityPropertiesEdit } from '../../hooks/useStructureEntityPropertiesEdit';
import { useStructureEntitySave } from '../../hooks/useStructureEntitySave';
import { useStructureTypeDialogs } from '../../hooks/useStructureTypeDialogs';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { WorkDay } from '../../types/workhours';
import {
  formatStructureContactSummary,
  formatStructureLocationSummary,
} from '../../utils/structureEntityInput';
import { formatStructureScheduleSummary } from '../../utils/structureSchedule';
import { StructureContactDialog } from './StructureContactDialog';
import { StructureLocationDialog } from './StructureLocationDialog';
import { StructureScheduleDialog } from './StructureScheduleDialog';

type TStructureCapabilityDialog = 'location' | 'contact' | 'schedule';

const StructurePropertyRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="grid min-h-8 grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
    <span className="truncate text-sm text-muted-foreground">{label}</span>
    <div className="min-w-0">{children}</div>
  </div>
);

const StructurePropertyValue = ({
  value,
  placeholder,
}: {
  value?: string | null;
  placeholder: string;
}) => (
  <span
    className={cn(
      'block truncate px-2 text-sm',
      !value && 'text-muted-foreground',
    )}
  >
    {value || placeholder}
  </span>
);

const StructurePropertyText = ({
  value,
  placeholder,
  editable,
  onSave,
}: {
  value: string;
  placeholder: string;
  editable: boolean;
  onSave: (value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  if (!editable) {
    return <StructurePropertyValue value={value} placeholder={t('not-set')} />;
  }

  return (
    <TextField value={value} onSave={onSave} className="w-full">
      {!value && <span className="text-muted-foreground">{placeholder}</span>}
    </TextField>
  );
};

const StructurePropertySummary = ({
  summary,
  placeholder,
  editable,
  onOpen,
}: {
  summary: string | null;
  placeholder: string;
  editable: boolean;
  onOpen: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  if (!editable) {
    return (
      <StructurePropertyValue value={summary} placeholder={t('not-set')} />
    );
  }

  return (
    <Button
      variant="ghost"
      className="h-7 w-full justify-start px-2 font-normal"
      onClick={onOpen}
    >
      <span className={cn('truncate', !summary && 'text-muted-foreground')}>
        {summary ?? placeholder}
      </span>
    </Button>
  );
};

const StructureDrawerFieldsEmpty = ({ typeId }: { typeId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { openTypeSettings } = useStructureTypeDialogs();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
      <IconListDetails className="size-4 shrink-0" />
      <span className="flex-1">{t('no-custom-fields')}</span>
      <Can actions={['fieldsManage', 'fieldGroupsManage']}>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={() => openTypeSettings(typeId, 'fields')}
        >
          {t('manage-custom-fields')}
        </Button>
      </Can>
    </div>
  );
};

export const StructureDrawerProperties = ({
  entity,
  editable,
}: {
  entity: IStructureEntityDetail;
  editable: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { save } = useStructureEntitySave();
  const [dialog, setDialog] = useState<TStructureCapabilityDialog | null>(null);
  const capabilities = entity.type?.capabilities ?? [];
  const savedMessage = t('node-saved', { title: entity.title });
  const closeDialog = () => setDialog(null);

  const saveCode = (value: string) => {
    const code = value.trim();

    if (code !== (entity.code ?? '')) {
      void save({ _id: entity._id, code }, savedMessage);
    }
  };

  const saveDescription = (value: string) => {
    const description = value.trim();

    if (description !== (entity.description ?? '')) {
      void save({ _id: entity._id, description }, savedMessage);
    }
  };

  return (
    <section className="flex flex-col gap-1">
      <StructurePropertyRow label={t('code')}>
        <StructurePropertyText
          value={entity.code ?? ''}
          placeholder={t('add-code')}
          editable={editable}
          onSave={saveCode}
        />
      </StructurePropertyRow>
      <StructurePropertyRow label={t('description')}>
        <StructurePropertyText
          value={entity.description ?? ''}
          placeholder={t('add-description')}
          editable={editable}
          onSave={saveDescription}
        />
      </StructurePropertyRow>
      {capabilities.includes(STRUCTURE_CAPABILITY.location) && (
        <StructurePropertyRow label={t('location')}>
          <StructurePropertySummary
            summary={formatStructureLocationSummary(entity.location)}
            placeholder={t('add-location')}
            editable={editable}
            onOpen={() => setDialog('location')}
          />
        </StructurePropertyRow>
      )}
      {capabilities.includes(STRUCTURE_CAPABILITY.contact) && (
        <StructurePropertyRow label={t('contact')}>
          <StructurePropertySummary
            summary={formatStructureContactSummary(entity.contact)}
            placeholder={t('add-contact')}
            editable={editable}
            onOpen={() => setDialog('contact')}
          />
        </StructurePropertyRow>
      )}
      {capabilities.includes(STRUCTURE_CAPABILITY.schedule) && (
        <StructurePropertyRow label={t('schedule')}>
          <StructurePropertySummary
            summary={formatStructureScheduleSummary(
              entity.schedule,
              (day: WorkDay) => t(`weekday-short-${day.toLowerCase()}`),
            )}
            placeholder={t('add-schedule')}
            editable={editable}
            onOpen={() => setDialog('schedule')}
          />
        </StructurePropertyRow>
      )}
      <FieldsInDetail
        fieldContentType={STRUCTURE_PROPERTIES_CONTENT_TYPE}
        fieldContentTypeId={entity.typeId}
        propertiesData={entity.propertiesData ?? {}}
        mutateHook={useStructureEntityPropertiesEdit}
        id={entity._id}
        emptyState={<StructureDrawerFieldsEmpty typeId={entity.typeId} />}
        className="mt-3"
        bare
      />
      {dialog === 'location' && (
        <StructureLocationDialog entity={entity} onClose={closeDialog} />
      )}
      {dialog === 'contact' && (
        <StructureContactDialog entity={entity} onClose={closeDialog} />
      )}
      {dialog === 'schedule' && (
        <StructureScheduleDialog entity={entity} onClose={closeDialog} />
      )}
    </section>
  );
};
