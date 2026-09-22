import { Button, cn, readImage } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { useErxesForm } from '../context/erxesFormContext';
import { calloutPassedAtom } from '../states/erxesFormStates';

export const ErxesFormCallout = () => {
  const formData = useErxesForm();
  const setCalloutPassed = useSetAtom(calloutPassedAtom);
  const { id } = useParams<{ id: string }>();

  const callout = formData.callout;
  const isPopup = formData?.leadData?.loadType === 'popup';

  return (
    <div
      className={cn(
        { 'shadow-2xl': id || isPopup },
        'text-sm rounded-2xl overflow-hidden',
      )}
    >
      {/* Header hero */}
      <div className="min-h-10 bg-transparent px-5 pt-4.5 pb-24 relative text-primary-foreground flex-auto bg-[radial-gradient(120%_80%_at_88%_-10%,rgba(255,255,255,0.18)_0%,transparent_90%),radial-gradient(80%_60%_at_10%_110%,var(--color-background)_0%,transparent_60%),linear-gradient(var(--color-primary)_0%,var(--color-primary)_70%,var(--color-primary)_80%)]">
        <div className="mt-4 max-w-3/4 space-y-1">
          <h1 className="text-primary-foreground text-2xl leading-none uppercase">
            {callout?.title || formData?.title || ''}
          </h1>
        </div>
      </div>
      <div
        className={cn(
          { 'max-h-[600px] min-h-[400px] flex flex-col': id || isPopup },
          'p-2 text-left bg-sidebar relative z-20 px-4 pb-2 -mt-14',
        )}
      >
        <div
          className={cn(
            { 'flex-1': id || isPopup },
            'h-full px-8! py-4! bg-background rounded-2xl hide-scroll overflow-y-auto shadow-sm -mt-8 z-30 space-y-4',
          )}
        >
          {callout?.featuredImage && (
            <img
              src={readImage(callout.featuredImage)}
              alt={callout?.title || 'callout'}
              className="w-full h-auto rounded-xl object-cover"
            />
          )}
          {callout?.body && (
            <p className="text-accent-foreground whitespace-pre-line">
              {callout.body}
            </p>
          )}
        </div>
        <div className="flex justify-end mt-4 mb-2 mr-3">
          <Button type="button" onClick={() => setCalloutPassed(true)}>
            {callout?.buttonText || 'Start'}
          </Button>
        </div>
      </div>
      {!isPopup && !id && (
        <div className="flex items-center gap-0.5 bg-sidebar justify-center py-2 text-muted-foreground font-medium text-[10px]">
          <span>Powered by Erxes</span>
        </div>
      )}
    </div>
  );
};
