import { cn, Form, InfoCard } from 'erxes-ui';
import { createContext, ReactNode, useContext } from 'react';
import { PanelFormRow } from 'ui-modules';

export const KbFormPanelContext = createContext(false);

export const KbFormItem = ({
  label,
  required,
  wide,
  inline,
  labelAction,
  children,
  className,
}: {
  label: ReactNode;
  required?: boolean;
  wide?: boolean;
  inline?: boolean;
  labelAction?: ReactNode;
  children: ReactNode;
  className?: string;
}) => {
  const panel = useContext(KbFormPanelContext);

  return (
    <Form.Item
      className={cn(
        !panel && inline && 'flex flex-row items-center justify-between gap-2',
        className,
      )}
    >
      {panel && !wide ? (
        <PanelFormRow
          label={
            <Form.Label className="font-sans text-xs font-medium normal-case text-accent-foreground">
              {label}
            </Form.Label>
          }
          required={required}
        >
          {labelAction}
          {children}
        </PanelFormRow>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <Form.Label
              className={
                panel
                  ? 'font-sans text-xs normal-case text-accent-foreground'
                  : undefined
              }
            >
              {label}
              {required && <span className="text-destructive"> *</span>}
            </Form.Label>
            {labelAction}
          </div>
          {children}
        </>
      )}
    </Form.Item>
  );
};

const KbFormSectionRoot = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const panel = useContext(KbFormPanelContext);

  return panel ? (
    <section aria-label={title}>{children}</section>
  ) : (
    <InfoCard title={title}>{children}</InfoCard>
  );
};

const KbFormSectionContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const panel = useContext(KbFormPanelContext);

  return panel ? (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      {children}
    </div>
  ) : (
    <InfoCard.Content className={className}>{children}</InfoCard.Content>
  );
};

export const KbFormSection = Object.assign(KbFormSectionRoot, {
  Content: KbFormSectionContent,
});
