import { useTeamUpdate } from '@/team/hooks/useTeamUpdate';
import { ITeam, TeamEstimateTypes } from '@/team/types';
import { Select, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const EstimateSection = ({ team }: { team: ITeam }) => {
  const { t } = useTranslation('operation');
  const { updateTeam } = useTeamUpdate();
  const { toast } = useToast();

  const submitHandler = (value: string) => {
    updateTeam({
      variables: {
        _id: team._id,
        estimateType: Number(value),
      },
      onCompleted: () => {
        toast({ title: t('success') });
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer">
      <section className="w-full px-4 py-2">
        <div className="flex items-center justify-between">
          <p>{t('estimate')}</p>

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
                  <p className="text-xs">{t('not-in-use')}</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.DEFAULT}>
                  <p className="text-xs">{t('estimate-default')}</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.FIBONACCI}>
                  <p className="text-xs">{t('estimate-fibonacci')}</p>
                </Select.Item>
                <Select.Item value={TeamEstimateTypes.EXPONENTIAL}>
                  <p className="text-xs">{t('estimate-exponential')}</p>
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
};
