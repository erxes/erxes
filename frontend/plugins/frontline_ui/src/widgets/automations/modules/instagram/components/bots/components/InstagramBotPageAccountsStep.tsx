import { useInstagramAccounts } from '@/integrations/instagram/hooks/useInstagramAccounts';
import { selectedInstagramAccountAtom } from '@/integrations/instagram/states/instagramStates';
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

export const InstagramBotPageAccountsStep = ({
  accountId,
}: {
  accountId?: string;
}) => {
  const [selectedAccountId, setSelectedAccountId] = useAtom(
    selectedInstagramAccountAtom,
  );
  const { instagramGetAccounts, loading } = useInstagramAccounts();

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
            {instagramGetAccounts.length} accounts found
          </div>
          <Button variant="ghost" className="text-primary" asChild>
            <a
              href={`${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=${IntegrationType.INSTAGRAM_MESSENGER}`}
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
            <InstagramBotPageAccountsStepContent
              loading={loading}
              instagramGetAccounts={instagramGetAccounts}
            />
          </Command.List>
        </RadioGroup>
      </Command>
    </div>
  );
};

const InstagramBotPageAccountsStepContent = ({
  loading,
  instagramGetAccounts,
}: {
  loading: boolean;
  instagramGetAccounts: {
    _id: string;
    name: string;
    accessToken: string;
    pageId: string | null;
    pageName: string | null;
  }[];
}) => {
  const [selectedAccountId, setSelectedAccountId] = useAtom(
    selectedInstagramAccountAtom,
  );
  if (loading) {
    return <Spinner />;
  }

  return instagramGetAccounts.map((account) => (
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
