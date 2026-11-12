import type { IPhoneFieldProps } from 'erxes-ui/modules/inputs';
import { Badge } from 'erxes-ui/components';
import { IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { ValidationStatus } from 'erxes-ui/types';
import { formatPhones } from 'erxes-ui/modules/display/utils/formatPhones';
import { formatPhoneNumber } from 'erxes-ui/utils/format';

export const PhoneDisplay = ({
  maxVisible,
  primaryPhone,
  phones,
  phoneValidationStatus,
}: IPhoneFieldProps & { maxVisible?: number }) => {
  const formattedPhones = formatPhones(primaryPhone, phones, phoneValidationStatus);

  const values = formattedPhones.filter((item) => item.phone);
  const visible = maxVisible === undefined ? values : values.slice(0, maxVisible);
  const remaining = values.length - visible.length;

  return (
    <div
      className={
        maxVisible === undefined ? 'flex gap-2' : 'flex min-w-0 max-w-full items-center gap-1'
      }
    >
      {visible.map(
        (phone) =>
          phone.phone && (
            <Badge key={phone.phone} variant="secondary" className="min-w-0">
              {phone.isPrimary &&
                (phone.status === ValidationStatus.Valid ? (
                  <IconCircleDashedCheck className="text-success size-4" />
                ) : (
                  <IconCircleDashed className="text-muted-foreground size-4" />
                ))}
              <span className="truncate">{formatPhoneNumber({ value: phone.phone || '' })}</span>
            </Badge>
          ),
      )}
      {remaining > 0 && (
        <Badge variant="secondary" className="shrink-0 text-muted-foreground">
          +{remaining}
        </Badge>
      )}
    </div>
  );
};
