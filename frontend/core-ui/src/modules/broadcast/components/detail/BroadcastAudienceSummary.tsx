import { IconTag, IconUsers } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type TAudienceItem = { _id: string; name?: string };

// Which segments or tags a campaign was aimed at. The card in the list says
// this and the detail did not, so the one place somebody goes to ask what a
// campaign is could not answer who it was for.
export const BroadcastAudienceSummary = ({ message }: { message: any }) => {
  const { t } = useTranslation('broadcasts');

  const {
    targetType,
    segments = [],
    customerTags = [],
  } = message || {};

  // Read from what the campaign was built as, not from whichever list happens
  // to be filled: a campaign switched from tags to segments keeps both.
  const isTag = targetType === 'tag';
  const list: TAudienceItem[] = isTag ? customerTags : segments;
  const Icon = isTag ? IconTag : IconUsers;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground">{t('columns.audience')}</span>

      {list.length ? (
        list.map((item) => (
          <Badge key={item._id} variant="secondary">
            <Icon className="size-3.5" />
            {item.name?.trim() || t('untitled')}
          </Badge>
        ))
      ) : (
        <span className="text-muted-foreground">{t('card.no-audience')}</span>
      )}
    </div>
  );
};
