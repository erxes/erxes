import { Input } from 'erxes-ui/components/input';
import React, { useState } from 'react';
import { FullNameFieldContext } from 'erxes-ui/modules/inputs/contexts/FullNameFieldContext';
import { useFullNameField } from 'erxes-ui/modules/inputs/hooks/useFullNameField';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';

const FullNameFieldProvider = ({
  children,
  firstName,
  lastName,
  setFirstName,
  setLastName,
}: {
  children: React.ReactNode;
  firstName: string;
  lastName: string;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
}) => {
  return (
    <FullNameFieldContext.Provider
      value={{
        firstName,
        lastName,
        setFirstName,
        setLastName,
        fullName: `${firstName || ''}${firstName ? ' ' : ''}${lastName || ''}`,
      }}
    >
      {children}
    </FullNameFieldContext.Provider>
  );
};

export const FullNameValue = () => {
  const { fullName } = useFullNameField();

  if (fullName.replace(/\s/g, '').length === 0)
    return <span className="text-accent-foreground">Unknown</span>;

  return fullName;
};

const FullNameFieldContent = () => {
  const { firstName, lastName, setFirstName, setLastName } = useFullNameField();

  return (
    <div className="flex gap-px bg-border w-72 rounded shadow-sm">
      <Input
        value={firstName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setFirstName(e.target.value);
        }}
        variant="flush"
        className="focus-visible:z-10 max-w-36"
        placeholder="First name"
      />
      <Input
        value={lastName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setLastName(e.target.value);
        }}
        variant="flush"
        className="focus-visible:z-10 max-w-36"
        placeholder="Last name"
      />
    </div>
  );
};

export const FullNameField = ({
  children,
  firstName,
  lastName,
  onValueChange,
  scope,
}: {
  children: React.ReactNode;
  scope: string;
  firstName?: string;
  lastName?: string;
  onValueChange: (firstName: string, lastName: string) => void;
}) => {
  const [firstNameState, setFirstName] = useState<string>(firstName || '');
  const [lastNameState, setLastName] = useState<string>(lastName || '');
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenChange = (op: boolean) => {
    setOpen(op);

    if (!op) {
      onValueChange(firstNameState.trim(), lastNameState.trim());
    }
  };

  // A new name from the record replaces what is being typed.
  const [syncedName, setSyncedName] = useState({ firstName, lastName });

  if (syncedName.firstName !== firstName || syncedName.lastName !== lastName) {
    setSyncedName({ firstName, lastName });
    setFirstName(firstName ?? '');
    setLastName(lastName ?? '');
  }

  return (
    <FullNameFieldProvider
      firstName={firstNameState}
      lastName={lastNameState}
      setFirstName={setFirstName}
      setLastName={setLastName}
    >
      <PopoverScoped
        scope={scope}
        open={open}
        onOpenChange={handleOpenChange}
        closeOnEnter
        dependencies={[firstNameState, lastNameState]}
      >
        {children}
        <RecordTableInlineCell.Content className="w-72">
          <FullNameFieldContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </FullNameFieldProvider>
  );
};
