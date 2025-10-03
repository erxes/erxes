import { Switch, useToast } from 'erxes-ui';
import { useTeamUpdate } from '@/team/hooks/useTeamUpdate';
import { ApolloError } from '@apollo/client';
import { ITeam } from '@/team/types';

export const CycleSection = ({ team }: { team: ITeam }) => {
  const { updateTeam } = useTeamUpdate();
  const { toast } = useToast();

  const submitHandler = (value: boolean) => {
    updateTeam({
      variables: {
        _id: team._id,
        cycleEnabled: value,
      },
      onCompleted: () => {
        toast({ title: 'Success!' });
      },
      onError: (error: ApolloError) =>
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer">
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>Cycle</p>
          <div className="flex items-center gap-2">
            <Switch
              onCheckedChange={submitHandler}
              checked={team.cycleEnabled}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
