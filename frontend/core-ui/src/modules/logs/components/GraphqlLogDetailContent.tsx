import { IconBolt } from '@tabler/icons-react';
import { ILogDoc } from '../types';
import { maskFields } from '../utils/logFormUtils';
import { LogDetailJsonPanel, LogDetailSection } from './LogDetailPrimitives';

export const GraphqlLogDetailContent = ({ payload }: ILogDoc) => {
  const { mutationName, args, result, error } = payload || {};

  const res = error || result;

  return (
    <LogDetailSection
      title="Operation Payload"
      description={
        mutationName
          ? `Captured arguments and response for ${mutationName}.`
          : 'Captured arguments and response for this GraphQL operation.'
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
          title={error ? 'Error' : 'Result'}
          description={
            error
              ? 'The resolver returned an error payload.'
              : 'Resolved response returned by the API.'
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
