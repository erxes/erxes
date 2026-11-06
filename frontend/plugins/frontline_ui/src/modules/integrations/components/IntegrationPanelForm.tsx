import { Button } from 'erxes-ui';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { createContext, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import type { IIntegration } from '../types/Integration';

export const INTEGRATION_CONTENT_TYPE = 'frontline:integration';

export const IntegrationChannelContext = createContext<
  string | null | undefined
>(null);

/** Resolves the channel from the record panel context or route. */
export const useIntegrationChannelId = (): string | undefined => {
  const { id } = useParams();
  const channelId = useContext(IntegrationChannelContext);
  return channelId ?? id;
};

/** Opens a new integration record with its provider and channel. */
export const IntegrationCreateButton = ({
  kind,
  children,
  onClick,
}: {
  kind: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { openNewRecord } = useSidePanel();
  const channelId = useIntegrationChannelId();
  return (
    <Button
      className="self-start"
      onClick={() => {
        onClick?.();
        openNewRecord(INTEGRATION_CONTENT_TYPE, { kind, channelId });
      }}
    >
      <IconPlus />
      {children}
    </Button>
  );
};

/** Opens the selected integration record for editing. */
export const IntegrationEditButton = ({
  integration,
}: {
  integration: Pick<IIntegration, '_id'>;
}) => {
  const { openRecord } = useSidePanel();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={() =>
        openRecord({
          contentType: INTEGRATION_CONTENT_TYPE,
          contentId: integration._id,
        })
      }
    >
      <IconEdit />
      {t('edit')}
    </Button>
  );
};
