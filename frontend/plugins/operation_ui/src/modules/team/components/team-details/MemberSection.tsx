import { IconChevronRight } from '@tabler/icons-react';
import { ITeam } from '@/team/types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const MemberSection = ({ team }: { team: ITeam }) => {
  const { t } = useTranslation('operation');
  const navigate = useNavigate();

  return (
    <div
      className="mt-4 w-full border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer"
      onClick={() => navigate(`/settings/operation/team/members/${team._id}`)}
    >
      <section className="w-full p-4">
        <div className="flex items-center justify-between">
          <p>{t('manage-team-members')}</p>

          <div className="flex items-center gap-2">
            <p className="text-xs">
              {team.memberCount} {team.memberCount === 1 ? t('member') : t('members')}
            </p>
            <IconChevronRight className="w-4 h-4" />
            {/* <Popover>
          <Popover.Trigger asChild>
            <IconEdit />
          </Popover.Trigger>
          <Combobox.Content className="w-[120px]">
            <Command shouldFilter={false}>
              <Command.List>
                <Command.Item value="edit">
                  <IconEdit /> Edit
                </Command.Item>
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover> */}
          </div>
        </div>
      </section>
    </div>
  );
};
