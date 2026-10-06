import { ApolloError, useLazyQuery } from '@apollo/client';
import {
  Badge,
  Combobox,
  Command,
  Form,
  PopoverScoped,
  TextOverflowTooltip,
  toast,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HELP_CENTER_CMS_PORTAL_TOKEN } from '@/helpcenter/graphql/queries/getHelpCenterCmsOptions';
import { IHelpCenterCmsConfig, IHelpCenterCmsOption } from '@/helpcenter/types';

const MAX_VISIBLE_BADGES = 3;

type TCmsPortalTokenResponse = {
  getClientPortal: { _id: string; token?: string | null } | null;
};

const getCmsName = (cms: IHelpCenterCmsOption, t: TFunction) =>
  cms.name || t('unnamed-cms', 'Untitled CMS');

const SelectedCmsValue = ({
  selectedCms,
  count,
  loading,
  t,
}: {
  selectedCms: IHelpCenterCmsOption[];
  count: number;
  loading: boolean;
  t: TFunction;
}) => {
  if (!count) {
    return <Combobox.Value placeholder={t('select', 'Select...')} />;
  }

  if (!selectedCms.length) {
    return (
      <Combobox.Value
        loading={loading}
        value={t('n-selected', '{{count}} selected', { count })}
      />
    );
  }

  const visibleCms = selectedCms.slice(0, MAX_VISIBLE_BADGES);
  const hiddenCount = count - visibleCms.length;

  return (
    <div className="flex overflow-hidden flex-1 gap-1 items-center min-w-0">
      {visibleCms.map((cms) => (
        <Badge key={cms._id} variant="secondary" className="max-w-40">
          <TextOverflowTooltip value={getCmsName(cms, t)} />
        </Badge>
      ))}
      {hiddenCount > 0 && <Badge variant="secondary">+{hiddenCount}</Badge>}
    </div>
  );
};

export const SelectHelpCenterCms = ({
  value,
  cmsList,
  loading,
  error,
  onValueChange,
  scope,
}: {
  value: IHelpCenterCmsConfig[];
  cmsList: IHelpCenterCmsOption[];
  loading: boolean;
  error?: ApolloError;
  onValueChange: (cmsConfigs: IHelpCenterCmsConfig[]) => void;
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const [getPortalToken, { loading: tokenLoading }] =
    useLazyQuery<TCmsPortalTokenResponse>(GET_HELP_CENTER_CMS_PORTAL_TOKEN, {
      fetchPolicy: 'network-only',
    });

  const selectedCms = value
    .map(({ cmsId }) => cmsList.find((cms) => cms._id === cmsId))
    .filter((cms): cms is IHelpCenterCmsOption => !!cms);

  const toggleCms = async (cms: IHelpCenterCmsOption) => {
    if (value.some(({ cmsId }) => cmsId === cms._id)) {
      onValueChange(value.filter(({ cmsId }) => cmsId !== cms._id));
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

    onValueChange([...value, { cmsId: cms._id, cmsAppToken: token }]);
  };

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs" disabled={tokenLoading}>
          <SelectedCmsValue
            selectedCms={selectedCms}
            count={value.length}
            loading={(loading && !cmsList.length) || tokenLoading}
            t={t}
          />
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search', 'Search')} focusOnMount />
          {selectedCms.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 p-2">
                {selectedCms.map((cms) => (
                  <Badge
                    key={cms._id}
                    variant="secondary"
                    className="max-w-56"
                    onClose={() => toggleCms(cms)}
                  >
                    <TextOverflowTooltip value={getCmsName(cms, t)} />
                  </Badge>
                ))}
              </div>
              <Command.Separator />
            </>
          )}
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
              const name = getCmsName(cms, t);

              return (
                <Command.Item
                  key={cms._id}
                  value={cms._id}
                  keywords={[name]}
                  onSelect={() => toggleCms(cms)}
                >
                  <TextOverflowTooltip
                    value={name}
                    className="flex-auto w-auto font-medium"
                  />
                  <Combobox.Check
                    checked={value.some(({ cmsId }) => cmsId === cms._id)}
                  />
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
