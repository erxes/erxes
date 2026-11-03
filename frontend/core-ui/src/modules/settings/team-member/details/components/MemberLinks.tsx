import { USER_LINK_FIELDS } from '@/settings/team-member/constants/memberDetailFields';
import { MemberPanelTextField } from '@/settings/team-member/details/components/MemberPanelDetail';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { useUserObjectEdit } from '@/settings/team-member/hooks/useUserEdit';
import { UserLinks } from '@/settings/team-member/types';
import { IconExternalLink } from '@tabler/icons-react';
import { Button, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';

const toLinkUrl = (linkField: string, value: string) => {
  const trimmed = value.trim();

  if (linkField === 'discord' && /^\d{17,19}$/.test(trimmed)) {
    return `https://discord.com/users/${trimmed}`;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const MemberLinks = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { userDetail } = useUserDetail();
  const links = (userDetail?.links ?? {}) as UserLinks;
  const editLinks = useUserObjectEdit(userDetail?._id || '', 'links', links);

  if (!userDetail) {
    return null;
  }

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-2 p-3">
        {USER_LINK_FIELDS.map((field) => {
          const value = links[field.name as keyof UserLinks] || '';

          return (
            <PanelField
              key={field.name}
              label={
                <span className="flex items-center gap-1.5">
                  <field.Icon className="size-3.5 flex-none" />
                  {field.label}
                </span>
              }
            >
              <div className="flex items-center gap-1">
                <MemberPanelTextField
                  scope={`links.${field.name}`}
                  value={value}
                  placeholder={field.label}
                  onSave={(next) => editLinks({ [field.name]: next })}
                />
                {value && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 flex-none"
                    title={t('visit-link', 'Open link')}
                    onClick={() =>
                      window.open(
                        toLinkUrl(field.name, value),
                        '_blank',
                        'noopener,noreferrer',
                      )
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
