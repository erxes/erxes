import {
  Button,
  cn,
  Command,
  Input,
  RadioGroup,
  REACT_APP_API_URL,
} from 'erxes-ui';
import { useFacebookAccounts } from '../hooks/useFacebookAccounts';
import { IconPlus } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  selectedFacebookAccountAtom,
} from '../states/facebookStates';
import {
  FacebookIntegrationFormLayout,
  FacebookIntegrationFormSteps,
} from './FacebookIntegrationForm';

export const FacebookGetAccounts = () => {
  const { facebookGetAccounts } = useFacebookAccounts();
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedFacebookAccountAtom,
  );
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  const onNext = () => {
    setActiveStep(2);
  };

  return (
    <FacebookIntegrationFormLayout
      actions={
        <>
          <Button variant="secondary" className="bg-border" disabled>
            Previous step
          </Button>
          <Button onClick={onNext} disabled={!selectedAccount}>
            Next step
          </Button>
        </>
      }
    >
      <FacebookIntegrationFormSteps
        title="Connect accounts"
        step={1}
        description="Select the accounts where you want to integrate its pages with."
      />
      <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col">
        <Command className="flex-1">
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
                href={`${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=facebook`}
                target="_blank"
                rel="noreferrer"
              >
                <IconPlus />
                Add account via facebook
              </a>
            </Button>
          </div>
          <RadioGroup
            value={selectedAccount}
            onValueChange={(value) =>
              setSelectedAccount(value === selectedAccount ? undefined : value)
            }
            className="flex-1 overflow-hidden"
          >
            <Command.List className="max-h-none overflow-y-auto">
              {facebookGetAccounts.map((account) => (
                <Command.Item
                  key={account._id}
                  value={account.name}
                  onSelect={() =>
                    setSelectedAccount(
                      selectedAccount === account._id ? undefined : account._id,
                    )
                  }
                  className={cn(
                    'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
                    selectedAccount === account._id && 'text-primary',
                  )}
                >
                  <RadioGroup.Item
                    value={account._id}
                    className="bg-background"
                  />
                  <div className="font-semibold">{account.name}</div>
                </Command.Item>
              ))}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </FacebookIntegrationFormLayout>
  );
};
