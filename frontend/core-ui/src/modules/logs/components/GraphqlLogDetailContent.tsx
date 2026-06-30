import { IconBolt } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';

export const GraphqlLogDetailContent = ({ payload }: ILogDoc) => {
  const { t } = useTranslation('common');
  const { mutationName, args, result, error } = payload || {};

  const res = error || result;

  return (
    <LogDetailSection
      title="Operation Payload"
      description={
        mutationName
          ? `Captured arguments and response for ${mutationName}.`
          : t('logs.graphql-captured-description', 'Captured arguments and response for this GraphQL operation.')
      }
      icon={IconBolt}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <LogDetailJsonPanel
          title="Arguments"
          description="Variables and input values sent with this request."
          src={maskFields(args, ['password'])}
          emptyMessage="No arguments were captured for this request."
        />
        <LogDetailJsonPanel
          title={error ? t('logs.error', 'Error') : t('logs.result', 'Result')}
          description={
            error
              ? t('logs.resolver-error-description', 'The resolver returned an error payload.')
              : t('logs.resolver-result-description', 'Resolved response returned by the API.')
          }
          src={
            typeof res === 'string'
              ? { message: res }
              : maskFields(res, ['password'])
          }
          emptyMessage="No result payload was captured for this request."
        />
      </div>
    </LogDetailSection>
  );
};
