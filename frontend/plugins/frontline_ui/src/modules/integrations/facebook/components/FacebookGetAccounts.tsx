import { useEffect, useState } from 'react';
import {
  Button,
  cn,
  Command,
  Input,
  REACT_APP_API_URL,
  RadioGroup,
  Spinner,
} from 'erxes-ui';
import { useFacebookAccounts } from '../hooks/useFacebookAccounts';
import { IconBrandFacebook } from '@tabler/icons-react';
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
  const { facebookGetAccounts, loading } = useFacebookAccounts();
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedFacebookAccountAtom,
  );
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#_=_') {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  const handleFacebookLogin = () => {
    setIsLoggingIn(true);
    window.location.href = `${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=facebook`;
  };

  const onNext = () => setActiveStep(2);

  const filteredAccounts = facebookGetAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
              <Input
                placeholder="Search for an account"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Command.Primitive.Input>
          </div>

          <div className="flex justify-between items-center px-1 py-2">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {loading ? (
                <>
                  <Spinner className="w-3 h-3" />
                  Loading accounts...
                </>
              ) : (
                `${filteredAccounts.length} accounts found`
              )}
            </div>

            <Button
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 font-medium"
              onClick={handleFacebookLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Connecting to Facebook...
                </>
              ) : (
                <>
                  <IconBrandFacebook className="w-4 h-4 mr-2 text-blue-600" />
                  Connect Facebook Account
                </>
              )}
            </Button>
          </div>

          <RadioGroup
            value={selectedAccount}
            onValueChange={(value) =>
              setSelectedAccount(selectedAccount === value ? undefined : value)
            }
            className="flex-1 overflow-hidden"
          >
            <Command.List className="max-h-none overflow-y-auto">
              {filteredAccounts.map((account) => (
                <Command.Item
                  key={account._id}
                  value={account._id}
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
