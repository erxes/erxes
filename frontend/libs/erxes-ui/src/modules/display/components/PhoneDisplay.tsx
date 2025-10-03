import { IPhoneFieldProps } from 'erxes-ui/modules/inputs';
import { Badge } from 'erxes-ui/components';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { ValidationStatus } from 'erxes-ui/types';
import { formatPhones } from 'erxes-ui/modules/display/utils/formatPhones';
import { formatPhoneNumber } from 'erxes-ui/utils/format';

export const PhoneDisplay = ({
  primaryPhone,
  phones,
  phoneValidationStatus,
}: IPhoneFieldProps) => {
  const formattedPhones = formatPhones(
    primaryPhone,
    phones,
    phoneValidationStatus,
  );

  return (
    <div className="flex gap-2">
      {formattedPhones.map(
        (phone) =>
          phone.phone && (
            <Badge key={phone.phone} variant="secondary">
              {phone.isPrimary &&
                (phone.status === ValidationStatus.Valid ? (
                  <IconCircleDashedCheck className="text-success size-4" />
                ) : (
                  <IconCircleDashed className="text-muted-foreground size-4" />
                ))}
              {formatPhoneNumber({ value: phone.phone || '' })}
            </Badge>
          ),
      )}
    </div>
  );
};
