import { IconChevronRight } from '@tabler/icons-react';
import { ITeam } from '@/team/types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const DiscordSection = ({ team }: Readonly<{ team: ITeam }>) => {
  const { t } = useTranslation('operation');

  return (
    <Link
      to={`/operation/settings/team/discord/${team._id}`}
      className="mt-4 block w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50"
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('discord', 'Discord')}</p>

          <div className="flex items-center gap-2">
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </section>
    </Link>
  );
};
