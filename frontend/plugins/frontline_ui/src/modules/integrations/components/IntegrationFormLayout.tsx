import { Button, Sheet } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface IntegrationFormLayoutProps {
  children: ReactNode;
  actions: ReactNode;
}

/** Renders integration form fields with the shared sheet footer and cancel action. */
export const IntegrationFormLayout = ({
  children,
  actions,
}: IntegrationFormLayoutProps) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  return (
    <>
      <Sheet.Content className="min-h-0 overflow-auto p-3 styled-scroll">
        <div className="grid grid-cols-1 gap-3">{children}</div>
      </Sheet.Content>
      <Sheet.Footer className="h-auto min-h-12 shrink-0 border-t px-2 gap-1">
        <Sheet.Close asChild>
          <Button className="mr-auto text-muted-foreground" variant="ghost">
            {t('cancel')}
          </Button>
        </Sheet.Close>
        {actions}
      </Sheet.Footer>
    </>
  );
};
