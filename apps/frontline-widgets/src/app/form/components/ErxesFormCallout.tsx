import { Button, readImage } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useErxesForm } from '../context/erxesFormContext';
import { calloutPassedAtom } from '../states/erxesFormStates';
import { ErxesFormShell } from './ErxesFormShell';

export const ErxesFormCallout = () => {
  const formData = useErxesForm();
  const setCalloutPassed = useSetAtom(calloutPassedAtom);

  const callout = formData.callout;

  return (
    <ErxesFormShell
      title={callout?.title || formData?.title}
      description={formData?.description}
      bodyClassName="space-y-4"
      isCallout
      actions={
        <Button
          type="button"
          variant={'secondary'}
          onClick={() => setCalloutPassed(true)}
          className="flex-1 text-primary-foreground bg-primary hover:bg-primary/70 capitalize"
          size={'lg'}
        >
          {callout?.buttonText || 'Start'}
        </Button>
      }
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
    </ErxesFormShell>
  );
};
