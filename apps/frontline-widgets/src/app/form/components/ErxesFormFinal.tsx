import { useAtom, useAtomValue } from 'jotai';
import { activeStepAtom, formValuesAtom } from '../states/erxesFormStates';
import { useFormWidgetLead } from '../hooks/useFormWidgetLead';
import { browserInfoAtom } from '../../messenger/states';
import { useErxesForm } from '../ context/erxesFormContext';
import { Button, InfoCard, readImage, Spinner } from 'erxes-ui';
import { useState } from 'react';

export const ErxesFormFinal = () => {
  const [activeStep, setActiveStep] = useAtom(activeStepAtom);
  const [formValues, setFormValues] = useAtom(formValuesAtom);
  const browserInfo = useAtomValue(browserInfoAtom) || {};
  const { saveLead, loading: saveLeadLoading } = useFormWidgetLead();
  const formData = useErxesForm();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const formValuesArray = Object.values(formValues || {});
    const submissions = formValuesArray.reduce((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    }, {});
    saveLead({
      variables: {
        formId: formData._id,
        submissions: Object.entries(submissions).map(([key, value]) => {
          const field = formData.fields.find((field) => field._id === key);
          return {
            _id: key,
            type: field?.type || 'input',
            text: field?.text || key,
            value,
          };
        }),
        browserInfo,
      },
      onCompleted: (data) => {
        setIsSubmitted(true);
        setFormValues({});
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="p-5">
        <InfoCard title={formData.leadData.thankTitle}>
          <InfoCard.Content>
            <p className="text-muted-foreground">
              {formData.leadData.thankContent}
            </p>
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="p-5">
      <InfoCard title={formData.leadData.thankTitle}>
        <InfoCard.Content>
          <p className="text-muted-foreground">
            {formData.leadData.thankContent}
          </p>
          {formData.leadData.thankImage && (
            <div className="relative rounded-md aspect-video">
              <img
                src={readImage(formData.leadData.thankImage)}
                alt="confirmation"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <Button onClick={handleSubmit} disabled={saveLeadLoading}>
            {saveLeadLoading && (
              <Spinner containerClassName="size-4 flex-none" />
            )}
            {formData.buttonText || 'Send'}
          </Button>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
