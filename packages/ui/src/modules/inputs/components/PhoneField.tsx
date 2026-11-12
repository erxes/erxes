import { IconBookmarkFilled, IconCircleDashed, IconCircleDashedCheck } from '@tabler/icons-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button } from 'erxes-ui/components/button';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import { cn } from 'erxes-ui/lib/utils';
import { formatPhones } from 'erxes-ui/modules/display/utils/formatPhones';
import { ValidationStatus } from 'erxes-ui/types/ValidationStatus';
import { formatPhoneNumber } from 'erxes-ui/utils/format/formatPhoneNumber';
import { forwardRef, useState } from 'react';
import { PhoneFieldsContext, usePhoneFields } from '../contexts/PhoneFieldsContext';
import type { IPhoneField, IPhoneFieldProps, TPhones } from '../types/phoneField';
import { PhoneFieldForm } from './PhoneFieldForm';
import { PhoneFieldOptions } from './PhoneFieldOptions';

export type { IPhoneFieldProps } from '../types/phoneField';

const PhoneItem = ({ phone, status, isPrimary }: IPhoneField) => (
  <Button
    variant="secondary"
    className={cn(
      'w-full font-medium text-left justify-start px-2 flex-auto overflow-hidden',
      isPrimary && 'text-primary bg-primary/10 hover:bg-primary/20',
    )}
    size="lg"
  >
    {status === ValidationStatus.Valid ? (
      <IconCircleDashedCheck className="text-success" />
    ) : (
      <IconCircleDashed className="text-muted-foreground" />
    )}
    <TextOverflowTooltip value={formatPhoneNumber({ value: phone ?? '' })} />
    {isPrimary && <IconBookmarkFilled className="text-primary" />}
  </Button>
);

const PhoneList = () => {
  const { phones } = usePhoneFields();
  const [animationParent] = useAutoAnimate();

  return (
    <div className="p-1 space-y-1">
      <div ref={animationParent} className="space-y-1">
        {phones.map(
          (item) =>
            item.phone && (
              <div className="flex items-center overflow-hidden gap-1 w-full" key={item.phone}>
                <PhoneItem {...item} />
                <PhoneFieldOptions item={item} />
              </div>
            ),
        )}
      </div>
    </div>
  );
};

/** Back to the stored shape: the primary phone and its status, then the other numbers. */
const toPhoneFieldProps = (values: TPhones): IPhoneFieldProps => {
  const primary = values.find((item) => item.isPrimary);

  return {
    primaryPhone: primary?.phone ?? '',
    phones: values.flatMap((item) => (!item.isPrimary && item.phone ? [item.phone] : [])),
    phoneValidationStatus: primary && (primary.status ?? ValidationStatus.Invalid),
  };
};

type PhoneFieldBodyProps = {
  phones: TPhones;
  onValueChange: (phones: TPhones) => void;
  onValidationStatusChange?: (status: ValidationStatus) => void;
};

/** Holds which phone is being edited and whether the input is open. */
const PhoneFieldBody = ({
  phones,
  onValueChange,
  onValidationStatusChange,
}: PhoneFieldBodyProps) => {
  const [inputOpen, setInputOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);

  const context = {
    phones,
    onValueChange,
    onValidationStatusChange,
    showInput: inputOpen || !phones.some((item) => item.phone),
    openInput: () => setInputOpen(true),
    editingPhone,
    startEditing: (phone: string) => {
      setEditingPhone(phone);
      setInputOpen(true);
    },
    closeInput: () => {
      setEditingPhone(null);
      setInputOpen(false);
    },
  };

  return (
    <PhoneFieldsContext.Provider value={context}>
      <PhoneList />
      <PhoneFieldForm key={editingPhone ?? ''} />
    </PhoneFieldsContext.Provider>
  );
};

type PhoneFieldProps = IPhoneFieldProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    /** The record the phones belong to; another record starts with the input closed. */
    recordId: string;
    onValueChange: (values: IPhoneFieldProps) => void;
    onValidationStatusChange?: (status: ValidationStatus) => void;
  };

/** A record's phones: the list with a menu per phone, and an input to add or edit one. */
export const PhoneField = forwardRef<HTMLDivElement, PhoneFieldProps>(
  (
    {
      recordId,
      onValueChange,
      onValidationStatusChange,
      primaryPhone,
      phones,
      phoneValidationStatus,
      ...props
    },
    ref,
  ) => (
    <div ref={ref} {...props}>
      <PhoneFieldBody
        key={recordId}
        phones={formatPhones(primaryPhone, phones, phoneValidationStatus)}
        onValueChange={(values) => onValueChange(toPhoneFieldProps(values))}
        onValidationStatusChange={onValidationStatusChange}
      />
    </div>
  ),
);

PhoneField.displayName = 'PhoneField';
