import { useLazyQuery, useQuery } from '@apollo/client';
import {
  Combobox,
  Command,
  Form,
  PopoverScoped,
  TextOverflowTooltip,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GET_HELP_CENTER_CMS_OPTIONS,
  GET_HELP_CENTER_CMS_PORTAL_TOKEN,
} from '@/helpcenter/graphql/queries/getHelpCenterCmsOptions';

type TCmsOption = {
  _id: string;
  name?: string;
  clientPortalId?: string;
};

type TCmsPortalTokenResponse = {
  getClientPortal: { _id: string; token?: string | null } | null;
};

export const SelectHelpCenterCms = ({
  value,
  onValueChange,
  scope,
}: {
  value: string;
  onValueChange: (cmsId: string, cmsAppToken: string) => void;
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, loading, error } = useQuery<{
    contentCMSList: TCmsOption[] | null;
  }>(GET_HELP_CENTER_CMS_OPTIONS, { fetchPolicy: 'cache-and-network' });

  const [getPortalToken, { loading: tokenLoading }] =
    useLazyQuery<TCmsPortalTokenResponse>(GET_HELP_CENTER_CMS_PORTAL_TOKEN, {
      fetchPolicy: 'network-only',
    });

  const cmsList = data?.contentCMSList ?? [];
  const selected = cmsList.find((cms) => cms._id === value);

  const selectCms = async (cms: TCmsOption) => {
    setOpen(false);

    if (cms._id === value) {
      onValueChange('', '');
      return;
    }

    const result = cms.clientPortalId
      ? await getPortalToken({ variables: { _id: cms.clientPortalId } })
      : null;
    const token = result?.data?.getClientPortal?.token;

    if (!token) {
      toast({
        title: t('error'),
        description:
          result?.error?.message ||
          t(
            'helpcenter-cms-no-token',
            "This CMS's client portal has no app token.",
          ),
        variant: 'destructive',
      });
      return;
    }

    onValueChange(cms._id, token);
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs" disabled={tokenLoading}>
          <Combobox.Value
            loading={(loading && !data) || tokenLoading}
            value={selected?.name}
            placeholder={t('select', 'Select...')}
          />
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search', 'Search')} focusOnMount />
          <Command.List>
            {loading || error ? (
              <Combobox.Empty loading={loading} error={error} />
            ) : (
              <Command.Empty>
                <p className="p-8 text-center text-muted-foreground">
                  {t('no-cms-found', 'No CMS found')}
                </p>
              </Command.Empty>
            )}
            {cmsList.map((cms) => {
              const name = cms.name || t('unnamed-cms', 'Untitled CMS');

              return (
                <Command.Item
                  key={cms._id}
                  value={cms._id}
                  keywords={[name]}
                  onSelect={() => selectCms(cms)}
                >
                  <TextOverflowTooltip
                    value={name}
                    className="flex-auto w-auto font-medium"
                  />
                  <Combobox.Check checked={value === cms._id} />
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
