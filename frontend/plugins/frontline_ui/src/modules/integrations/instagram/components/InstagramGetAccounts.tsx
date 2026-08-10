import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  cn,
  Command,
  Input,
  REACT_APP_API_URL,
  RadioGroup,
  Spinner,
} from 'erxes-ui';
import { useInstagramAccounts } from '../hooks/useInstagramAccounts';
import { IconBrandInstagram } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  selectedInstagramAccountAtom,
} from '../states/instagramStates';
import {
  InstagramIntegrationFormLayout,
  InstagramIntegrationFormSteps,
} from './InstagramIntegrationForm';
import { useInstagramPages } from '../hooks/useInstagramPages';
import { useIgAuthPopup } from '../hooks/useIgAuthPopup';

export const InstagramGetAccounts = () => {
  const { t } = useTranslation('frontline');
  const { instagramGetAccounts, loading, refetch } = useInstagramAccounts();
  const { instagramGetPages } = useInstagramPages();
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedInstagramAccountAtom,
  );
  const setActiveStep = useSetAtom(activeInstagramFormStepAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { popupWindow } = useIgAuthPopup(() => {
    refetch();
    setIsLoggingIn(false);
  });

  const handleInstagramLogin = () => {
    setIsLoggingIn(true);
    popupWindow(
      `${REACT_APP_API_URL}/pl:frontline/instagram/iglogin`,
      'Instagram Login',
      660,
      750,
    );
  };

  const onNext = () => setActiveStep(2);

  const filteredAccounts = instagramGetAccounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <InstagramIntegrationFormLayout
      actions={
        <>
          <Button variant="secondary" className="bg-border" disabled>
            {t('previous-step')}
          </Button>
          <Button onClick={onNext} disabled={!selectedAccount}>
            {t('next-step')}
          </Button>
        </>
      }
    >
      <InstagramIntegrationFormSteps
        title={t('connect-accounts')}
        step={1}
        description={t('ig-select-accounts-description')}
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
              variant="outline"
              className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-all duration-200 font-medium"
              onClick={handleInstagramLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  {t('connecting-to-instagram')}
                </>
              ) : (
                <>
                  <IconBrandInstagram className="w-4 h-4 mr-2 text-pink-600" />
                  {t('connect-instagram-account')}
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
                    checked={selectedAccount === account._id}
                    className="bg-background"
                    onClick={() => setSelectedAccount(account._id)}
                  />
                  <div className="font-semibold">{account.name}</div>
                  {selectedAccount && instagramGetPages?.length ? (
                    <div className="text-sm text-muted-foreground font-mono uppercase ml-auto">
                      {t('pages-found', { count: instagramGetPages.length })}
                    </div>
                  ) : null}
                </Command.Item>
              ))}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </InstagramIntegrationFormLayout>
  );
};
