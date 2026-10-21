import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { useCreateTriage } from '@/triage/hooks/useCreateTriage';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IOpenRecordOptions,
  TRelationEntity,
  useCreateMultipleRelations,
  useSidePanel,
} from 'ui-modules';

// What a triage draft starts with: its team, the contacts
// `operationAddTriage` links it to, and a record (not a contact) to link
// it to once created.
export type TTriageDraft = {
  teamId?: string;
  customerIds?: string[];
  companyIds?: string[];
  host?: TRelationEntity;
};

/**
 * New triages start as a draft in the side panel (`openTriageDraft`):
 * nothing is saved until it is named, then `createTriageRecord` creates it
 * and the triage replaces the draft. It goes to the page's team, else the
 * first team with triage on (`canCreate` is false when there is none).
 */
export const useCreateTriageRecord = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { teamId } = useParams<{ teamId?: string }>();
  const { teams } = useGetCurrentUsersTeams();
  const { createTriage, loading } = useCreateTriage();
  const { createMultipleRelations } = useCreateMultipleRelations();
  const { openRecord, openNewRecord } = useSidePanel();

  const triageTeams = teams.filter((team) => team.triageEnabled);
  const triageTeamId =
    triageTeams.find((team) => team._id === teamId)?._id ||
    triageTeams[0]?._id;

  const openTriageDraft = (
    draft: Omit<TTriageDraft, 'teamId'> = {},
    options?: IOpenRecordOptions,
  ) => {
    if (!triageTeamId) {
      toast({
        title: t('error'),
        description: t(
          'triage-team-required',
          'Turn on triage for a team to add triages',
        ),
        variant: 'destructive',
      });
      return;
    }

    openNewRecord(
      TRIAGE_CONTENT_TYPE,
      { ...draft, teamId: triageTeamId },
      options,
    );
  };

  // Creates a named triage from its draft; it replaces the draft.
  const createTriageRecord = ({
    name,
    teamId: draftTeamId,
    customerIds,
    companyIds,
    host,
  }: TTriageDraft & { name: string }) => {
    if (loading || !draftTeamId) {
      return;
    }

    createTriage({
      variables: {
        input: { name, teamId: draftTeamId, customerIds, companyIds },
      },
      onCompleted: ({ operationAddTriage: created }) => {
        if (!created?._id) {
          return;
        }

        // A contact is linked by the mutation; any other record here.
        if (host) {
          createMultipleRelations(
            [
              {
                entities: [
                  host,
                  { contentType: TRIAGE_CONTENT_TYPE, contentId: created._id },
                ],
              },
            ],
            { silent: true },
          );
        }

        openRecord(
          { contentType: TRIAGE_CONTENT_TYPE, contentId: created._id },
          { replace: true },
        );
      },
    });
  };

  return {
    openTriageDraft,
    createTriageRecord,
    loading,
    canCreate: !!triageTeamId,
  };
};
