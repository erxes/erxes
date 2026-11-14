import type { User } from '@erxes/core-contract';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { USER_LINK_FIELDS } from '../constants';
import { useMemberPermissions, useTeamMemberEdit } from '../useTeamMembers';
import { MemberPanelTextField } from './MemberFieldInputs';
import { PanelField } from './PanelField';

const toLinkUrl = (linkField: string, value: string) => {
  const trimmed = value.trim();

  if (linkField === 'discord' && /^\d{17,19}$/.test(trimmed)) {
    return `https://discord.com/users/${trimmed}`;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const MemberLinks = ({ user }: { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const edit = useTeamMemberEdit();
  const permissions = useMemberPermissions(user);

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        {USER_LINK_FIELDS.map((field) => {
          const value = user.links[field.name] ?? '';

          return (
            <PanelField key={field.name} icon={field.Icon} label={field.label}>
              <div className="flex items-center gap-1">
                <MemberPanelTextField
                  icon={field.Icon}
                  scope={`${user.id}.links.${field.name}`}
                  value={value}
                  placeholder={field.label}
                  disabled={!permissions?.canEdit}
                  onSave={(next) =>
                    edit.mutate({ id: user.id, links: { [field.name]: next || null } })
                  }
                />
                {value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 flex-none"
                    title={t('visit-link', 'Open link')}
                    onClick={() =>
                      window.open(toLinkUrl(field.name, value), '_blank', 'noopener,noreferrer')
                    }
                  >
                    <IconExternalLink className="size-4" />
                  </Button>
                )}
              </div>
            </PanelField>
          );
        })}
      </div>
    </ScrollArea>
  );
};
