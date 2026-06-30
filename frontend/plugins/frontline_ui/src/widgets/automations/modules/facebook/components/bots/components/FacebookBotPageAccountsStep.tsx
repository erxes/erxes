import { useFacebookAccounts } from '@/integrations/facebook/hooks/useFacebookAccounts';
import { selectedFacebookAccountAtom } from '@/integrations/facebook/states/facebookStates';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  Command,
  Input,
  RadioGroup,
  Spinner,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

export const FacebookBotPageAccountsStep = ({
  accountId,
}: {
  accountId?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [selectedAccountId, setSelectedAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );
  const { facebookGetAccounts, loading } = useFacebookAccounts();

  return (
    <div className="flex-1 overflow-hidden p-4 pt-0">
      <Command>
        <div className="p-1">
          <Command.Primitive.Input asChild>
            <Input placeholder={t('search-for-an-account')} />
          </Command.Primitive.Input>
        </div>
        <div className="flex justify-between items-center px-1 py-2">
          <div className="text-sm text-muted-foreground">
            {t('accounts-found', { count: facebookGetAccounts.length })}
          </div>

          <Button variant="ghost" className="text-primary" asChild>
            <Link
              to="/settings/frontline/channels"
              target="_blank"
              rel="noreferrer"
            >
              <IconPlus />
              {t('add-account-via-facebook')}
            </Link>
          </Button>
        </div>
        <RadioGroup
          value={selectedAccountId}
          onValueChange={setSelectedAccountId}
        >
          <Command.List>
            <FacebookBotPageAccountsStepContent
              loading={loading}
              facebookGetAccounts={facebookGetAccounts}
            />
          </Command.List>
        </RadioGroup>
      </Command>
    </div>
  );
};

const FacebookBotPageAccountsStepContent = ({
  loading,
  facebookGetAccounts,
}: {
  loading: boolean;
  facebookGetAccounts: {
    _id: string;
    name: string;
    accessToken: string;
    pageId: string | null;
    pageName: string | null;
  }[];
}) => {
  const [selectedAccountId, setSelectedAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );

  const handleSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  if (loading) {
    return <Spinner />;
  }

  return facebookGetAccounts.map((account) => {
    const isSelected = selectedAccountId === account._id;

    return (
      <Command.Item
        key={account._id}
        value={account.name}
        onSelect={() => handleSelect(account._id)}
        className={cn(
          'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3 cursor-pointer',
          isSelected && 'text-primary',
        )}
      >
        <RadioGroup.Item
          value={account._id}
          checked={isSelected}
          className="bg-background"
        />
        <div className={cn('font-semibold', isSelected && 'text-primary')}>
          {account.name}
        </div>
      </Command.Item>
    );
  });
};
