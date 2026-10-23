import { Combobox, Popover } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectCustomer } from 'ui-modules/modules/contacts/components/SelectCustomer';
import { SelectMember } from 'ui-modules/modules/team-members/components/SelectMember';
import { useDataExtensionRecordTypes } from '../hooks/useDataExtensionRecordTypes';
import { IDataExtensionLinkedRecord, IDataExtensionRecordType } from '../types';
import { DataExtensionRecordSearchPicker } from './DataExtensionRecordSearchPicker';

type PickerValue = string | string[] | undefined;

type PickerProps = {
  value: PickerValue;
  mode: 'single' | 'multiple';
  onChange: (value: string | string[] | null) => void;
  id?: string;
};

/**
 * Every record type the tenant endpoint serves can be searched by name;
 * only types whose owner is disabled fall back to typed ids.
 */
export const canPickRecordType = (
  recordType: string,
  recordTypes: IDataExtensionRecordType[],
) => recordTypes.some((candidate) => candidate.recordType === recordType);

/**
 * Picks records by name so nobody has to copy ids around. Contacts and team
 * members use the selectors their modules already ship (lead and customer
 * share the customer picker); every other record type, from any module,
 * uses the generic search on the tenant endpoint. The server still enforces
 * each record type's scope.
 */
export const DataExtensionRecordPicker = ({
  recordType,
  value,
  mode,
  onChange,
  id,
  known,
}: PickerProps & {
  recordType: string;
  known?: IDataExtensionLinkedRecord[];
}) => {
  const [open, setOpen] = useState(false);
  const { recordTypes } = useDataExtensionRecordTypes();
  const handleChange = (next: string | string[] | null) => {
    onChange(next);

    if (mode === 'single') {
      setOpen(false);
    }
  };

  const popover = (valueNode: ReactNode, contentNode: ReactNode) => (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger id={id} className="w-full shadow-xs">
        {valueNode}
      </Combobox.Trigger>
      <Combobox.Content>{contentNode}</Combobox.Content>
    </Popover>
  );

  if (recordType === 'core:company') {
    return (
      <SelectCompany.Provider
        value={value}
        mode={mode}
        onValueChange={handleChange}
      >
        {popover(<SelectCompany.Value />, <SelectCompany.Content />)}
      </SelectCompany.Provider>
    );
  }

  if (recordType === 'core:customer' || recordType === 'core:lead') {
    return (
      <SelectCustomer.Provider
        value={value}
        mode={mode}
        onValueChange={handleChange}
      >
        {popover(<SelectCustomer.Value />, <SelectCustomer.Content />)}
      </SelectCustomer.Provider>
    );
  }

  if (recordType === 'core:teamMember') {
    return (
      <SelectMember.Provider
        value={value}
        mode={mode}
        onValueChange={handleChange}
      >
        {popover(<SelectMember.Value />, <SelectMember.Content />)}
      </SelectMember.Provider>
    );
  }

  const descriptor = recordTypes.find(
    (candidate) => candidate.recordType === recordType,
  );

  if (!descriptor) {
    return null;
  }

  return (
    <DataExtensionRecordSearchPicker
      id={id}
      recordType={descriptor}
      mode={mode}
      value={value}
      known={known}
      onChange={onChange}
    />
  );
};
