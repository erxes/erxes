import { useErxesForm } from '../context/erxesFormContext';
import { InfoCard, readImage } from 'erxes-ui';

export const ErxesFormFinal = () => {
  const formData = useErxesForm();

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
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
