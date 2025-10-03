import { Select } from 'erxes-ui';
import { ITeam } from '@/team/types';
import { TeamEstimateTypes } from '@/team/types';
import { useTeamUpdate } from '@/team/hooks/useTeamUpdate';
import { useToast } from 'erxes-ui';

export const EstimateSection = ({ team }: { team: ITeam }) => {
  const { updateTeam } = useTeamUpdate();
  const { toast } = useToast();

  const submitHandler = (value: string) => {
    updateTeam({
      variables: {
        _id: team._id,
        estimateType: Number(value),
      },
      onCompleted: () => {
        toast({ title: 'Success!' });
      },
      onError: (error) =>
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer">
      <section className="w-full px-4 py-2">
        <div className="flex items-center justify-between">
          <p>Estimate</p>

          <div className="flex items-center gap-2">
            <Select
              value={
                team.estimateType?.toString() || TeamEstimateTypes.NOT_IN_USE
              }
              onValueChange={submitHandler}
            >
              <Select.Trigger id="time-unit">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={TeamEstimateTypes.NOT_IN_USE}>
                  <p className="text-xs">Not in use</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.DEFAULT}>
                  <p className="text-xs">Default (1, 2, 3, 4, 5)</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.FIBONACCI}>
                  <p className="text-xs">Fibonacci (1, 2, 3, 5, 8)</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.EXPONENTIAL}>
                  <p className="text-xs">Exponential (1, 2, 4, 8, 16)</p>
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
};
