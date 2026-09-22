import {
  AutomationNodeMetaInfoRow,
  AutomationTriggerConfigProps,
} from 'ui-modules';
import { TStageProbalityTriggerConfigForm } from '../../states/stageProbalityTriggerConfigFormDefinitions';
import { useTranslation } from 'react-i18next';

export const StageProbalityTriggerNodeContent = ({
  type,
  config,
}: AutomationTriggerConfigProps<TStageProbalityTriggerConfigForm>) => {
  const { t } = useTranslation('sales');
  const { probability, fromStageId, toStageId } = config || {};

  if (type?.endsWith('.stageChanged')) {
    return (
      <div>
        <AutomationNodeMetaInfoRow
          fieldName={t('when-sales-card-stage-changes')}
          content={`${fromStageId || t('any-stage')} -> ${toStageId || t('any-stage')}`}
        />
      </div>
    );
  }

  return (
    <div>
      <AutomationNodeMetaInfoRow
        fieldName={t('when-sales-card-moved-to-stage-with-probability')}
        content={probability}
      />
    </div>
  );
};
