import { useGetTeam } from '@/team/hooks/useGetTeam';
import { useRemoveTeam } from '@/team/hooks/useRemoveTeam';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

export const DeleteTeamForm = () => {
  const { t } = useTranslation('operation');
  const { id: teamId } = useParams();
  const { removeTeam, loading } = useRemoveTeam();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const navigate = useNavigate();

  const handleRemoveTeam = () => {
    removeTeam({
      variables: {
        id: teamId,
      },
      onCompleted: () => {
        navigate('/operation/team');
      },
      onError: () => {
        toast({
          title: t('error'),
          description: t('failed-to-remove-team'),
          variant: 'destructive',
        });
      },
    });
  };

  const handleClick = () => {
    confirm({
      message: t('are-you-sure-delete'),
      options: confirmOptions,
    }).then(() => {
      handleRemoveTeam();
    });
  };

  const confirmOptions = { confirmationValue: 'delete' };

  return (
    <div className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer">
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('delete-team')}</p>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="destructive"
              onClick={handleClick}
              disabled={loading}
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
