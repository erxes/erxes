import { ITeam } from '@/team/types';
import { useTeamUpdate } from '@/team/hooks/useTeamUpdate';
import { useQuery } from '@apollo/client';
import { GET_STATUSES_CHOICES_BY_TEAM } from '@/team/graphql/queries/getStatusesChoicesByTeam';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from 'erxes-ui';

interface StatusChoice {
  value: string;
  label: string;
}

/**
 * DefaultStatusSection component allows team admins to configure the default
 * status that will be automatically assigned to newly created tasks.
 * 
 * @param {object} props - Component props
 * @param {ITeam} props.team - The team object containing configuration
 * @returns {JSX.Element | null} The default status configuration section or null if loading
 */
export const DefaultStatusSection = ({ team }: { team: ITeam }) => {
  const { updateTeam } = useTeamUpdate();
  const { toast } = useToast();

  const { data, loading } = useQuery(GET_STATUSES_CHOICES_BY_TEAM, {
    variables: { teamId: team._id },
  });

  const statusChoices: StatusChoice[] = data?.getStatusesChoicesByTeam || [];

  /**
   * Handles the change of default status selection.
   * Updates the team's default status and shows appropriate toast notifications.
   * 
   * @param {string} value - The selected status ID
   */
  function handleStatusChange(value: string) {
    updateTeam({
      variables: {
        _id: team._id,
        defaultStatusId: value,
      },
      onCompleted: () => {
        toast({ title: 'Default status updated successfully' });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  }

  if (loading) {
    return null;
  }

  return (
    <div className="mt-4 w-full border border-muted-foreground/15 rounded-md">
      <section className="w-full p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Default Task Status</p>
              <p className="text-sm text-muted-foreground">
                New tasks will automatically be assigned this status if no status is specified
              </p>
            </div>
          </div>
          
          <div className="w-full max-w-xs">
            <Select value={team.defaultStatusId || ''} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select default status" />
              </SelectTrigger>
              <SelectContent>
                {statusChoices.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
};

