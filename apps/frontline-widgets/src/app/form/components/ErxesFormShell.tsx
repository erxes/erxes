import { cn } from 'erxes-ui';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useErxesForm } from '../context/erxesFormContext';
import { IconInbox } from '@tabler/icons-react';

/**
 * True when the form renders inside a dialog — the `popup` load type and the
 * live form route. Those cards float on an overlay, so they get their own
 * elevation and a bounded height with an internally scrolling body, while the
 * embedded form grows with its host container.
 */
export const useIsModalForm = (): boolean => {
  const formData = useErxesForm();
  const { id } = useParams<{ id: string }>();

  return Boolean(id) || formData?.leadData?.loadType === 'popup';
};

type ErxesFormShellProps = {
  title?: string;
  description?: string;
  /** Rendered above the scrolling body, e.g. the step indicator. */
  header?: React.ReactNode;
  /** Action row pinned below the body, e.g. Previous / Next / Submit. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
  isCallout?: boolean;
  /** When provided the shell renders as a `form` instead of a plain `div`. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

/**
 * The single card chrome shared by every form screen (callout, steps,
 * confirmation) and every load type. Keeping it in one place is what makes the
 * popup and live forms look identical to the embedded one.
 */
export const ErxesFormShell = ({
  title,
  description,
  header,
  actions,
  children,
  bodyClassName,
  onSubmit,
  isCallout,
}: ErxesFormShellProps) => {
  const isModal = useIsModalForm();

  const content = (
    <>
      {/* Header hero */}
      <header className="bg-sidebar gap-3.5 px-5.5 pt-5 relative box-border text-primary-foreground flex shrink-0">
        {isCallout ? (
          <span className="rounded-sm bg-primary/20 text-primary border-primary border flex items-center justify-center aspect-square size-8.5">
            <IconInbox size={16} />
          </span>
        ) : (
          <span className="bg-primary flex-[0_0_3px] self-stretch rounded-full" />
        )}
        <div className="max-w-3/4 min-w-0 isolate">
          <h2 className="text-foreground text-lg font-semibold leading-none uppercase">
            {title || ''}
          </h2>
          {description && (
            <p className="text-foreground/60 text-xs mt-1.25 leading-none font-light">
              {description}
            </p>
          )}
        </div>
      </header>
      <div
        className={cn(
          {
            'max-h-[600px] min-h-[400px] flex flex-col': isModal,
          },
          '[&_h3]:text-foreground bg-sidebar text-left [&_h3]:text-base [&_h3]:mx-auto [&_h3]:font-sans relative z-20 px-4.5 pt-5 pb-2.5',
        )}
      >
        {header}
        <div
          className={cn(
            {
              'flex-1': isModal,
            },
            'hide-scroll overflow-y-auto px-1',
            bodyClassName,
          )}
        >
          {children}
        </div>
        {actions && (
          <div className="flex justify-end mt-4 mb-2 mr-3 gap-2">{actions}</div>
        )}
      </div>
      <div className="flex items-center border-t gap-0.5 bg-sidebar justify-center py-2 text-muted-foreground font-medium text-[10px]">
        <span>Powered by erxes Inc</span>
      </div>
    </>
  );

  const shellClassName = cn(
    { 'shadow-2xl': isModal },
    'bg-sidebar text-sm rounded-2xl overflow-hidden',
  );

  if (onSubmit) {
    return (
      <form className={shellClassName} onSubmit={onSubmit}>
        {content}
      </form>
    );
  }

  return <div className={shellClassName}>{content}</div>;
};
