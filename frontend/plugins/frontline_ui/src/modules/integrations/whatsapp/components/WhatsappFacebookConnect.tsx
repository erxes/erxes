import { useState } from 'react';
import {
  Button,
  cn,
  Command,
  Input,
  REACT_APP_API_URL,
  RadioGroup,
  Spinner,
  toast,
} from 'erxes-ui';
import { IconBrandFacebook } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { useFacebookAccounts } from '@/integrations/facebook/hooks/useFacebookAccounts';
import { useFbAuthPopup } from '@/integrations/facebook/hooks/useFbAuthPopup';
import { IntegrationType } from '@/types/Integration';
import {
  activeWhatsappFormStepAtom,
  selectedWhatsappAccountAtom,
} from '../states/whatsappStates';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';

export const WhatsappFacebookConnect = () => {
  const { facebookGetAccounts, loading, error, refetch } =
    useFacebookAccounts();
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedWhatsappAccountAtom,
  );
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { popupWindow } = useFbAuthPopup(() => {
    refetch().catch(() =>
      toast({
        title: 'Facebook authentication failed',
        description: 'Could not load your Facebook accounts. Please retry.',
        variant: 'destructive',
      }),
    );
    setIsLoggingIn(false);
  });

  const handleFacebookLogin = () => {
    setIsLoggingIn(true);
    popupWindow(
      `${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=${IntegrationType.WHATSAPP_MESSENGER}`,
      'Facebook Login',
      660,
      750,
    );
  };

  const onNext = () => setActiveStep(2);

  const filteredAccounts = facebookGetAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <WhatsappIntegrationFormLayout
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
      <WhatsappIntegrationFormSteps
        title="Connect Facebook"
        step={1}
        description="Connect the Facebook account that manages your WhatsApp Business."
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
                  Connect Facebook
                </>
              )}
            </Button>
          </div>

          {error ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="text-sm font-medium text-destructive">
                Failed to load Facebook accounts
              </div>
              <div className="text-sm text-muted-foreground">
                {error.message}
              </div>
              <Button variant="secondary" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <RadioGroup
              value={selectedAccount}
              onValueChange={(value) =>
                setSelectedAccount(selectedAccount === value ? undefined : value)
              }
              className="flex-1 overflow-hidden"
            >
              <Command.List className="max-h-none overflow-y-auto">
                {!loading && filteredAccounts.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    No Facebook accounts connected yet. Connect Facebook to
                    continue.
                  </div>
                )}
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
                      checked={selectedAccount === account._id}
                      className="bg-background"
                      onClick={() => setSelectedAccount(account._id)}
                    />
                    <div className="font-semibold">{account.name}</div>
                  </Command.Item>
                ))}
              </Command.List>
            </RadioGroup>
          )}
        </Command>
      </div>
    </WhatsappIntegrationFormLayout>
  );
};
