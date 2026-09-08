import { useState } from 'react';
import {
  Button,
  cn,
  Command,
  Form,
  Input,
  REACT_APP_API_URL,
  RadioGroup,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useFacebookAccounts } from '../hooks/useFacebookAccounts';
import { IconBrandFacebook } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  activeFacebookFormStepAtom,
  selectedFacebookAccountAtom,
} from '../states/facebookStates';
import {
  FacebookIntegrationFormLayout,
  FacebookIntegrationFormSteps,
} from './FacebookIntegrationForm';
import { useFacebookPages } from '../hooks/useFacebookPages';
import { useFbAuthPopup } from '../hooks/useFbAuthPopup';
import { useFbIntegrationContext } from '../contexts/FbIntegrationContext';
import { SecretInput } from '@/integrations/components/SecretInput';
import { FACEBOOK_CONNECT_PAGE_TOKEN } from '../graphql/mutations/fbConfig';

const PAGE_TOKEN_SCHEMA = z.object({
  pageAccessToken: z.string().trim().min(1, 'Page access token is required'),
});

type TPageTokenForm = z.infer<typeof PAGE_TOKEN_SCHEMA>;

const FacebookAccountRow = ({
  account,
  selectedAccount,
  onSelect,
}: {
  account: { _id: string; name: string };
  selectedAccount: string | undefined;
  onSelect: (id: string) => void;
}) => {
  const { facebookGetPages, loading: pagesLoading } = useFacebookPages(
    account._id,
  );
  return (
    <Command.Item
      key={account._id}
      value={account._id}
      onSelect={() => onSelect(account._id)}
      className={cn(
        'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
        selectedAccount === account._id && 'text-primary',
      )}
    >
      <RadioGroup.Item
        value={account._id}
        checked={selectedAccount === account._id}
        className="bg-background"
        onClick={() => onSelect(account._id)}
      />
      <div className="font-semibold">{account.name}</div>
      <div className="text-sm text-muted-foreground font-mono uppercase ml-auto">
        {pagesLoading ? (
          <Spinner className="w-3 h-3" />
        ) : (
          `${facebookGetPages.length} pages`
        )}
      </div>
    </Command.Item>
  );
};

export const FacebookGetAccounts = () => {
  const { t } = useTranslation('frontline');
  const { isPost } = useFbIntegrationContext();
  const integrationKind = isPost ? 'facebook-post' : 'facebook-messenger';
  const { facebookGetAccounts, loading, refetch } =
    useFacebookAccounts(integrationKind);
  const [selectedAccount, setSelectedAccount] = useAtom(
    selectedFacebookAccountAtom,
  );
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const pageTokenForm = useForm<TPageTokenForm>({
    resolver: zodResolver(PAGE_TOKEN_SCHEMA),
    defaultValues: { pageAccessToken: '' },
  });
  const [connectPageToken, { loading: connectingPageToken }] = useMutation<{
    facebookConnectPageToken: {
      account: { _id: string; name: string };
      page: { id: string; name: string };
    };
  }>(FACEBOOK_CONNECT_PAGE_TOKEN);

  const { popupWindow } = useFbAuthPopup(() => {
    refetch();
    setIsLoggingIn(false);
  });

  const handleFacebookLogin = () => {
    setIsLoggingIn(true);
    popupWindow(
      `${REACT_APP_API_URL}/pl:frontline/facebook/fblogin?kind=${integrationKind}`,
      'Facebook Login',
      660,
      750,
    );
  };

  const handlePageTokenConnect = async ({
    pageAccessToken,
  }: TPageTokenForm) => {
    await connectPageToken({
      variables: { pageAccessToken, integrationKind },
      onCompleted: ({ facebookConnectPageToken }) => {
        setSelectedAccount(facebookConnectPageToken.account._id);
        pageTokenForm.reset();
        refetch();
        toast({
          title: t('success'),
          description: t('facebook-page-token-connected', {
            defaultValue: 'Facebook Page connected',
          }),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
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
            {t('previous-step')}
          </Button>
          <Button onClick={onNext} disabled={!selectedAccount}>
            {t('next-step')}
          </Button>
        </>
      }
    >
      <FacebookIntegrationFormSteps
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

          <Form {...pageTokenForm}>
            <form
              className="flex items-start gap-2 px-1 pb-2"
              onSubmit={pageTokenForm.handleSubmit(handlePageTokenConnect)}
            >
              <Form.Field
                control={pageTokenForm.control}
                name="pageAccessToken"
                render={({ field }) => (
                  <Form.Item className="flex-1">
                    <Form.Label>
                      {t('facebook-page-access-token', {
                        defaultValue: 'Page access token',
                      })}
                    </Form.Label>
                    <Form.Control>
                      <SecretInput
                        {...field}
                        autoComplete="off"
                        placeholder={t('paste-facebook-page-access-token', {
                          defaultValue: 'Paste a Page access token',
                        })}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                className="mt-6"
                disabled={connectingPageToken}
              >
                {connectingPageToken ? (
                  <Spinner className="size-4" />
                ) : (
                  t('connect-page-token', { defaultValue: 'Connect token' })
                )}
              </Button>
            </form>
          </Form>

          <RadioGroup
            value={selectedAccount}
            onValueChange={(value) =>
              setSelectedAccount(selectedAccount === value ? undefined : value)
            }
            className="flex-1 overflow-hidden"
          >
            <Command.List className="max-h-none overflow-y-auto">
              {filteredAccounts.map((account) => (
                <FacebookAccountRow
                  key={account._id}
                  account={account}
                  selectedAccount={selectedAccount}
                  onSelect={(id) =>
                    setSelectedAccount(selectedAccount === id ? undefined : id)
                  }
                />
              ))}
            </Command.List>
          </RadioGroup>
        </Command>
      </div>
    </FacebookIntegrationFormLayout>
  );
};
