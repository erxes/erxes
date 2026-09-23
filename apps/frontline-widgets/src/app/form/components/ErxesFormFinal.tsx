import { IconCheck } from '@tabler/icons-react';
import { useErxesForm } from '../context/erxesFormContext';
import { InfoCard, readImage } from 'erxes-ui';

export const ErxesFormFinal = () => {
  const formData = useErxesForm();

  return (
    <div className="">
      <InfoCard
        title={formData.leadData.thankTitle}
        className="bg-primary text-primary-foreground"
      >
        <InfoCard.Content className="bg-muted text-center">
          <span className="rounded-sm mx-auto bg-primary text-primary-foreground shadow-xs shadow-primary/20 flex items-center justify-center aspect-square size-8.5">
            <IconCheck size={16} />
          </span>
          <p className="text-muted-foreground">
            {formData.leadData.thankContent}
          </p>
          {formData.leadData.successImage && (
            <div className="relative rounded-md aspect-video">
              <img
                src={readImage(formData.leadData.successImage)}
                alt="confirmation"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
