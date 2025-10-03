import { useFacebookAccounts } from '@/integrations/facebook/hooks/useFacebookAccounts';
import { selectedFacebookAccountAtom } from '@/integrations/facebook/states/facebookStates';
import { IntegrationType } from '@/types/Integration';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  Command,
  Input,
  RadioGroup,
  REACT_APP_API_URL,
  Spinner,
} from 'erxes-ui';
import { useAtom } from 'jotai';

export const FacebookBotPageAccountsStep = ({
  accountId,
}: {
  accountId?: string;
}) => {
  const [selectedAccountId, setSelectedAccountId] = useAtom(
    selectedFacebookAccountAtom,
  );
  const { facebookGetAccounts, loading } = useFacebookAccounts();

  return (
    <div className="flex-1 overflow-hidden p-4 pt-0">
      <Command>
        <div className="p-1">
          <Command.Primitive.Input asChild>
            <Input placeholder="Search for an account" />
          </Command.Primitive.Input>
        </div>
        <div className="flex justify-between items-center px-1 py-2">
          <div className="text-sm text-muted-foreground">
            {facebookGetAccounts.length} accounts found
          </div>
          <Button variant="ghost" className="text-primary" asChild>
            <a
              href={`${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=${IntegrationType.FACEBOOK_MESSENGER}`}
              target="_blank"
              rel="noreferrer"
            >
              <IconPlus />
              Add account via facebook
            </a>
          </Button>
        </div>
        <RadioGroup
          value={selectedAccountId}
          onValueChange={(value) =>
            setSelectedAccountId(
              value === selectedAccountId ? undefined : value,
            )
          }
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
  if (loading) {
    return <Spinner />;
  }

  return facebookGetAccounts.map((account) => (
    <Command.Item
      key={account._id}
      value={account.name}
      onSelect={() =>
        setSelectedAccountId(
          selectedAccountId === account._id ? undefined : account._id,
        )
      }
      className={cn(
        'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
        selectedAccountId === account._id && 'text-primary',
      )}
    >
      <RadioGroup.Item value={account._id} className="bg-background" />
      <div className="font-semibold">{account.name}</div>
    </Command.Item>
  ));
};
