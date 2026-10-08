import { IconBolt } from '@tabler/icons-react';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';
import { useTranslation } from 'react-i18next';

export const GraphqlLogDetailContent = ({ payload }: ILogDoc) => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const { mutationName, args, result, error } = payload || {};

  const res = error || result;

  return (
    <LogDetailSection
      title={t('operation-payload')}
      description={
        mutationName
          ? t('captured-for-mutation', { mutationName })
          : t('captured-for-operation')
      }
      icon={IconBolt}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <LogDetailJsonPanel
          title={t('arguments')}
          description={t('arguments-description')}
          src={maskFields(args, ['password'])}
          emptyMessage={t('no-arguments')}
        />
        <LogDetailJsonPanel
          title={error ? t('error') : t('result')}
          description={error ? t('error-description') : t('result-description')}
          src={
            typeof res === 'string'
              ? { message: res }
              : maskFields(res, ['password'])
          }
          emptyMessage={t('no-result')}
        />
      </div>
    </LogDetailSection>
  );
};
