import { TicketStatusPropertyInput } from '@/ticket/components/ticket-selects/TicketStatusPropertyInput';
import { TPropertyInputMeta } from 'erxes-ui';
import { useState } from 'react';
import {
  AutomationTemplateRequirementProps,
  splitAutomationNodeType,
} from 'ui-modules';

type TTicketDestination = {
  channelId: string;
  pipelineId: string;
  status: string;
};

const asId = (meta: TPropertyInputMeta, key: string) =>
  typeof meta[key] === 'string' ? (meta[key] as string) : '';

/**
 * Answers a built-in template's ticket prerequisites while it is installed.
 *
 * One control rather than three, because a status only means something inside
 * a pipeline, and a pipeline inside a channel: this is the same input the
 * ticket properties use, so it already scopes each list to the choice above it
 * and clears the ones below when that choice changes. The answer carries all
 * three, and the template writes each where it belongs.
 *
 * Nothing is reported until a status is chosen, so a half-made choice leaves
 * the install closed rather than passing empty fields into the flow.
 */
export const TicketTemplateRequirement = ({
  kind,
  value,
  onChange,
}: AutomationTemplateRequirementProps) => {
  const answer = value as TTicketDestination | undefined;
  const [meta, setMeta] = useState<TPropertyInputMeta>(() => ({
    channelId: answer?.channelId || '',
    pipelineId: answer?.pipelineId || '',
  }));

  // `frontline:tickets.<what>`
  const [, , what] = splitAutomationNodeType(kind);

  if (what !== 'status') {
    return null;
  }

  return (
    <TicketStatusPropertyInput
      value={answer?.status || ''}
      meta={meta}
      onMetaChange={(nextMeta) => {
        setMeta(nextMeta);
        onChange(null);
      }}
      onValueChange={(status) =>
        onChange(
          status
            ? {
                channelId: asId(meta, 'channelId'),
                pipelineId: asId(meta, 'pipelineId'),
                status,
              }
            : null,
        )
      }
    />
  );
};
