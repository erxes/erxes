import { TPhones } from 'erxes-ui/modules/inputs';
import { ValidationStatus } from 'erxes-ui/types';

export function formatPhones(
  primaryPhone: string,
  phones: string[],
  phoneValidationStatus?: ValidationStatus,
): TPhones {
  const formattedPhones = [
    ...(primaryPhone
      ? [
          {
            phone: primaryPhone,
            status: phoneValidationStatus,
            isPrimary: true,
          },
        ]
      : []),
    ...(phones || []).map((phone) => ({
      phone,
      status: ValidationStatus.Invalid,
    })),
  ];

  return formattedPhones.filter(
    (phone, index, self) =>
      index === self.findIndex((t) => t.phone === phone.phone),
  );
}
