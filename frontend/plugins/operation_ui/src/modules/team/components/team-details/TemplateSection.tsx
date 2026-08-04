import { IconChevronRight } from '@tabler/icons-react';
import { ITeam } from '@/team/types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TemplateSection = ({ team }: { team: ITeam }) => {
  const { t } = useTranslation('operation');
  const navigate = useNavigate();

  return (
    <div
      className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() => navigate(`/settings/operation/team/templates/${team._id}`)}
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('templates')}</p>

          <div className="flex items-center gap-2">
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};
