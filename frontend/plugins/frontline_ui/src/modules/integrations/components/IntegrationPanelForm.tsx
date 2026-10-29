import { Button, Form, Sheet, Spinner } from 'erxes-ui';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { type PrimitiveAtom, useAtom } from 'jotai';
import { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PanelFormRow, useSidePanel, useSidePanelDraft } from 'ui-modules';
import type { IIntegration } from '../types/Integration';

export const INTEGRATION_CONTENT_TYPE = 'frontline:integration';

export const IntegrationChannelContext = createContext<string | undefined>(
  undefined,
);

export const useIntegrationChannelId = () => {
  const { id } = useParams();
  const channelId = useContext(IntegrationChannelContext);
  return channelId ?? id;
};

export const IntegrationCreateButton = ({
  kind,
  children,
  onClick,
}: {
  kind: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { openNewRecord, record } = useSidePanel();
  const draft = useSidePanelDraft<{ kind: string }>(INTEGRATION_CONTENT_TYPE);
  const channelId = useIntegrationChannelId();
  return (
    <Button
      className="self-start"
      onClick={() => {
        if (
          record?.contentType === INTEGRATION_CONTENT_TYPE &&
          record.contentId === 'new' &&
          draft.kind === kind
        )
          return;
        onClick?.();
        openNewRecord(INTEGRATION_CONTENT_TYPE, { kind, channelId });
      }}
    >
      <IconPlus />
      {children}
    </Button>
  );
};

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

export const IntegrationPanelForm = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { close } = useSidePanel();
  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden [&_input:not([type=checkbox])]:h-7 [&_input]:text-xs">
        {children}
      </div>
    </Sheet>
  );
};

export const IntegrationFormItem = ({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Form.Item>
    <PanelFormRow
      label={
        <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
          {label}
        </Form.Label>
      }
    >
      {children}
    </PanelFormRow>
  </Form.Item>
);

export const IntegrationFormSession = <T,>({
  state,
  value,
  closedValue,
  children,
}: {
  state: PrimitiveAtom<T>;
  value: T;
  closedValue: T;
  children: React.ReactNode;
}) => {
  const [current, setCurrent] = useAtom(state);
  const [ready, setReady] = useState(false);
  const { close } = useSidePanel();

  useEffect(() => {
    setCurrent(value);
    setReady(true);
    return () => setCurrent(closedValue);
  }, [state, value, closedValue, setCurrent]);

  useEffect(() => {
    if (ready && current === closedValue) close();
  }, [ready, current, closedValue, close]);

  return ready ? children : <Spinner containerClassName="py-12" />;
};
