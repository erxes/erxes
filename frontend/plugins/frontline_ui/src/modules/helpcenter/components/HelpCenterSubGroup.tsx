import { IconLifebuoy } from '@tabler/icons-react';
import {
  Button,
  NavigationMenuGroup,
  Skeleton,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAllHelpCenters } from '@/helpcenter/hooks/useHelpCenters';
import { IHelpCenter } from '@/helpcenter/types';

const HelpCenterItem = ({
  helpCenter,
  isActive,
  onSelect,
}: {
  helpCenter: IHelpCenter;
  isActive: boolean;
  onSelect: (id: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="overflow-hidden relative flex-auto justify-start p-2 text-left"
      onClick={() => onSelect(helpCenter._id)}
    >
      <IconLifebuoy className="size-3 text-accent-foreground shrink-0" />
      <TextOverflowTooltip value={helpCenter.title || t('unnamed-topic')} />
    </Button>
  );
};

export const HelpCenterSubGroup = () => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const [editId] = useQueryState<string>('editId');
  const { helpCenters: data, loading } = useAllHelpCenters();

  const helpCenters = data ?? [];

  const handleSelect = (id: string) => {
    navigate(`/frontline/helpcenter?editId=${id}`);
  };

  const renderContent = () => {
    if (loading && helpCenters.length === 0) {
      return (
        <div className="flex flex-col gap-1">
          <Skeleton className="mt-1 w-32 h-4" />
          <Skeleton className="mt-1 w-36 h-4" />
          <Skeleton className="mt-1 w-32 h-4" />
        </div>
      );
    }

    if (helpCenters.length === 0) {
      return (
        <div className="my-4 ml-3 text-sm text-accent-foreground">
          {t('kb-no-topics-yet')}
        </div>
      );
    }

    return helpCenters.map((helpCenter) => (
      <HelpCenterItem
        key={helpCenter._id}
        helpCenter={helpCenter}
        isActive={editId === helpCenter._id}
        onSelect={handleSelect}
      />
    ));
  };

  return (
    <NavigationMenuGroup name={t('help-center', 'Help Center')}>
      {renderContent()}
    </NavigationMenuGroup>
  );
};
