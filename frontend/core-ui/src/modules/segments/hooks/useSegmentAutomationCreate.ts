import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { ConstantsQueryResponse } from '@/automations/types';
import { SEGMENT_MEMBERSHIP_EVENT } from '@/automations/utils/automationBuilderUtils/triggerFolks';
import { useQuery } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router';
import {
  automationReturnLinkSearch,
  buildAutomationSeedLink,
  ISegment,
} from 'ui-modules';

/** Opens the builder with this segment's enter/exit trigger already placed. */
export const useSegmentAutomationCreate = (segment?: ISegment) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  // The builder offers the way back to this segment, also once saved.
  const returnTo = {
    path: `${pathname}${search}`,
    label: segment?.name || '',
  };

  const { data, loading } = useQuery<ConstantsQueryResponse>(
    AUTOMATION_CONSTANTS,
    { fetchPolicy: 'cache-first' },
  );

  // The trigger is the record's own type, so only types that have one can
  // start a flow.
  const canCreate = (data?.automationConstants?.triggersConst || []).some(
    ({ type }) => type === segment?.contentType,
  );

  const createAutomation = () => {
    if (!segment || !canCreate) {
      return;
    }

    navigate(
      buildAutomationSeedLink({
        triggerType: segment.contentType,
        triggerConfig: {
          event: SEGMENT_MEMBERSHIP_EVENT,
          segmentId: segment._id,
        },
        name: segment.name,
        returnTo,
      }),
    );
  };

  const editPath = (automationId: string) =>
    `/automations/edit/${automationId}${automationReturnLinkSearch(returnTo)}`;

  return { canCreate, loading, createAutomation, editPath };
};
