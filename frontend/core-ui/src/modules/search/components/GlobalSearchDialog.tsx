import { GlobalSearchGroup } from '@/search/components/GlobalSearchGroup';
import {
  GlobalSearchEmpty,
  GlobalSearchFailure,
  GlobalSearchHint,
  GlobalSearchLoading,
} from '@/search/components/GlobalSearchStates';
import { TGlobalSearchGroup } from '@/search/types/GlobalSearch';
import { Command, Dialog } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const GlobalSearchDialog = ({
  open,
  onOpenChange,
  value,
  onValueChange,
  isTyping,
  hasFailure,
  loading,
  hasResults,
  groups,
  onSelect,
  onRetry,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onValueChange: (value: string) => void;
  isTyping: boolean;
  hasFailure: boolean;
  loading: boolean;
  hasResults: boolean;
  groups: TGlobalSearchGroup[];
  onSelect: (path: string) => void;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'global-search' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md overflow-hidden rounded-lg border-0 p-0">
        <Dialog.Title className="sr-only">
          {t('placeholder', 'Search')}
        </Dialog.Title>
        <Dialog.Description className="sr-only">
          {t('placeholder', 'Search')}
        </Dialog.Description>
        <Command
          shouldFilter={false}
          className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 **:[[cmdk-group]]:px-2"
        >
          <Command.Input
            focusOnMount
            variant="primary"
            placeholder={t('placeholder', 'Search')}
            value={value}
            onValueChange={onValueChange}
          />
          <GlobalSearchResults
            isTyping={isTyping}
            hasFailure={hasFailure}
            loading={loading}
            hasResults={hasResults}
            groups={groups}
            onSelect={onSelect}
            onRetry={onRetry}
          />
        </Command>
      </Dialog.Content>
    </Dialog>
  );
};

const GlobalSearchResults = ({
  isTyping,
  hasFailure,
  loading,
  hasResults,
  groups,
  onSelect,
  onRetry,
}: {
  isTyping: boolean;
  hasFailure: boolean;
  loading: boolean;
  hasResults: boolean;
  groups: TGlobalSearchGroup[];
  onSelect: (path: string) => void;
  onRetry: () => void;
}) => {
  const hasGroupError = groups.some((group) => group.status === 'error');

  return (
    <Command.List className="styled-scroll min-h-32">
      {!isTyping && <GlobalSearchHint />}

      {isTyping && hasFailure && <GlobalSearchFailure onRetry={onRetry} />}

      {isTyping && !hasFailure && loading && !hasResults && (
        <GlobalSearchLoading />
      )}

      {isTyping &&
        !hasFailure &&
        !loading &&
        !hasResults &&
        !hasGroupError && <GlobalSearchEmpty />}

      {isTyping &&
        !hasFailure &&
        groups.map((group) => (
          <GlobalSearchGroup key={group.key} group={group} onSelect={onSelect} />
        ))}
    </Command.List>
  );
};
