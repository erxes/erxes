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
import { useTranslation } from 'react-i18next';
import { useFacebookAccounts } from '@/integrations/facebook/hooks/useFacebookAccounts';
import { useFbAuthPopup } from '@/integrations/facebook/hooks/useFbAuthPopup';
import { IntegrationType } from '@/types/Integration';
import {
  activeWhatsappFormStepAtom,
  selectedWhatsappAccountAtom,
  selectedWhatsappBusinessAccountAtom,
  selectedWhatsappPageAtom,
  selectedWhatsappPhoneNumberAtom,
} from '../states/whatsappStates';
import {
  WhatsappIntegrationFormLayout,
  WhatsappIntegrationFormSteps,
} from './WhatsappIntegrationForm';
import { WhatsappListError } from './WhatsappListError';
import { WhatsappStepNav } from './WhatsappStepNav';

export const WhatsappFacebookConnect = () => {
  const { t } = useTranslation('frontline');
  const { facebookGetAccounts, loading, error, refetch } =
    useFacebookAccounts();
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedWhatsappAccountAtom,
  );
  const setActiveStep = useSetAtom(activeWhatsappFormStepAtom);
  const setSelectedPage = useSetAtom(selectedWhatsappPageAtom);
  const setSelectedBusinessAccount = useSetAtom(
    selectedWhatsappBusinessAccountAtom,
  );
  const setSelectedPhoneNumber = useSetAtom(selectedWhatsappPhoneNumberAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const clearDownstreamSelection = () => {
    setSelectedPage(undefined);
    setSelectedBusinessAccount(undefined);
    setSelectedPhoneNumber(undefined);
  };

  const { popupWindow } = useFbAuthPopup(() => {
    refetch().catch(() =>
      toast({
        title: t('facebook-auth-failed', 'Facebook authentication failed'),
        description: t(
          'facebook-auth-failed-description',
          'Could not load your Facebook accounts. Please retry.',
        ),
        variant: 'destructive',
      }),
    );
    setIsLoggingIn(false);
  });

  const handleFacebookLogin = () => {
    setIsLoggingIn(true);
    const popup = popupWindow(
      `${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=${IntegrationType.WHATSAPP_MESSENGER}`,
      'Facebook Login',
      660,
      750,
    );

    if (!popup) {
      setIsLoggingIn(false);
      toast({
        title: t('popup-blocked', 'Pop-up blocked'),
        description: t(
          'popup-blocked-description',
          'Allow pop-ups for this site and try connecting Facebook again.',
        ),
        variant: 'destructive',
      });
    }
  };

  const selectAccount = (accountId: string) => {
    const nextAccount =
      selectedAccount === accountId ? undefined : accountId;
    if (nextAccount !== selectedAccount) {
      clearDownstreamSelection();
    }
    setSelectedAccount(nextAccount);
  };

  const onNext = () => setActiveStep(2);

  const filteredAccounts = facebookGetAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <WhatsappIntegrationFormLayout
      actions={
        <WhatsappStepNav
          onPrevious={() => undefined}
          previousDisabled
          onNext={onNext}
          nextDisabled={!selectedAccount}
        />
      }
    >
      <WhatsappIntegrationFormSteps
        title={t('whatsapp-connect-facebook', 'Connect Facebook')}
        step={1}
        description={t(
          'whatsapp-connect-facebook-description',
          'Connect the Facebook account that manages your WhatsApp Business.',
        )}
      />

      <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col">
        <Command className="flex-1">
          <div className="p-1">
            <Command.Primitive.Input asChild>
              <Input
                placeholder={t('search-for-an-account')}
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
                  {t('loading-accounts')}
                </>
              ) : (
                t('accounts-found', { count: filteredAccounts.length })
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 font-medium"
              onClick={handleFacebookLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {t('connecting-to-facebook')}
                </>
              ) : (
                <>
                  <IconBrandFacebook className="w-4 h-4 mr-2 text-blue-600" />
                  {t('connect-facebook-account')}
                </>
              )}
            </Button>
          </div>

          {error ? (
            <WhatsappListError
              title={t(
                'failed-to-load-facebook-accounts',
                'Failed to load Facebook accounts',
              )}
              error={error}
              onRetry={() => refetch()}
            />
          ) : (
            <RadioGroup
              value={selectedAccount}
              onValueChange={(value) => selectAccount(value)}
              className="flex-1 overflow-hidden"
            >
              <Command.List className="max-h-none overflow-y-auto">
                {!loading && filteredAccounts.length === 0 && (
                  <div className="p-6 text-sm text-muted-foreground text-center">
                    {t(
                      'no-facebook-accounts-connected',
                      'No Facebook accounts connected yet. Connect Facebook to continue.',
                    )}
                  </div>
                )}
                {filteredAccounts.map((account) => (
                  <Command.Item
                    key={account._id}
                    value={account.name}
                    onSelect={() => selectAccount(account._id)}
                    className={cn(
                      'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
                      selectedAccount === account._id && 'text-primary',
                    )}
                  >
                    <RadioGroup.Item
                      value={account._id}
                      checked={selectedAccount === account._id}
                      className="bg-background"
                      onClick={() => selectAccount(account._id)}
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
