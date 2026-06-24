import { useFacebookBots } from '@/integrations/facebook/hooks/useFacebookBots';
import { useFacebookPages } from '@/integrations/facebook/hooks/useFacebookPages';
import { selectedFacebookPageAtom } from '@/integrations/facebook/states/facebookStates';
import { cn, Command, Input, RadioGroup, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type FacebookPageOption = {
  id: string;
  name: string;
  isUsed: boolean;
  isBotUsed: boolean;
};

const getBotPageIds = (bots: { pageId?: string | null }[]) =>
  new Set(
    bots
      .map(({ pageId }) => pageId)
      .filter((pageId): pageId is string => Boolean(pageId)),
  );

export const FacebookBotPagesStep = () => {
  const { t } = useTranslation('frontline');
  const [selectedPage, setSelectedPage] = useAtom(selectedFacebookPageAtom);

  const { facebookGetPages, loading } = useFacebookPages();
  const { bots, loading: botsLoading } = useFacebookBots();

  const botPageIds = useMemo(() => getBotPageIds(bots), [bots]);

  const pages = useMemo<FacebookPageOption[]>(
    () =>
      facebookGetPages.map((page) => ({
        ...page,
        isBotUsed: botPageIds.has(page.id),
      })),
    [botPageIds, facebookGetPages],
  );

  useEffect(() => {
    if (selectedPage && botPageIds.has(selectedPage)) {
      setSelectedPage(undefined);
    }
  }, [botPageIds, selectedPage, setSelectedPage]);

  return (
    <div className="flex-1 overflow-hidden p-4 pt-0">
      <Command>
        <div className="p-1">
          <Command.Primitive.Input asChild>
            <Input placeholder={t('search-for-a-page')} />
          </Command.Primitive.Input>
        </div>
        <div className="flex justify-between items-center px-1 py-2">
          <div className="text-sm text-muted-foreground">
            {t('pages-found', { count: facebookGetPages.length })}
          </div>
        </div>
        <RadioGroup
          value={selectedPage}
          onValueChange={setSelectedPage}
        >
          <Command.List>
            <FacebookBotPagesStepContent
              loading={loading || botsLoading}
              facebookGetPages={pages}
            />
          </Command.List>
        </RadioGroup>
      </Command>
    </div>
  );
};

const FacebookBotPagesStepContent = ({
  loading,
  facebookGetPages,
}: {
  loading: boolean;
  facebookGetPages: FacebookPageOption[];
}) => {
  const [selectedPage, setSelectedPage] = useAtom(selectedFacebookPageAtom);

  const handleSelect = (page: FacebookPageOption) => {
    if (page.isBotUsed) {
      return;
    }

    setSelectedPage(page.id);
  };

  if (loading) {
    return <Spinner />;
  }

  return facebookGetPages.map((page) => {
    const isSelected = selectedPage === page.id;

    return (
      <Command.Item
        disabled={page.isBotUsed}
        key={page.id}
        value={page.name}
        onSelect={() => handleSelect(page)}
        className={cn(
          'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3 cursor-pointer',
          isSelected && 'text-primary',
          page.isBotUsed && 'cursor-not-allowed text-muted-foreground',
        )}
      >
        <RadioGroup.Item
          value={page.id}
          checked={isSelected}
          disabled={page.isBotUsed}
          className="bg-background"
        />
        <div className={cn('font-semibold', isSelected && 'text-primary')}>
          {page.name}
        </div>
        {page.isBotUsed && (
          <span className="ml-auto text-xs text-muted-foreground">
            Already used by bot
          </span>
        )}
      </Command.Item>
    );
  });
};
