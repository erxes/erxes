import { Input } from 'erxes-ui/components';
import React, { useEffect, useState } from 'react';
import { FullNameFieldContext } from 'erxes-ui/modules/inputs/contexts/FullNameFieldContext';
import { useFullNameField } from 'erxes-ui/modules/inputs/hooks/useFullNameField';
import { PopoverScoped } from 'erxes-ui/modules/hotkey';
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
    return <span className="text-accent-foreground/70">Unknown</span>;
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
        className="rounded-r-none focus-visible:z-10 max-w-36 shadow-none"
        placeholder="First name"
      />
      <Input
        value={lastName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setLastName(e.target.value);
        }}
        className="rounded-l-none focus-visible:z-10 max-w-36 shadow-none"
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

  useEffect(() => {
    if (firstNameState === firstName && lastNameState === lastName) {
      return;
    }
    setFirstName(firstName || '');
    setLastName(lastName || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName]);

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
      >
        {children}
        <RecordTableInlineCell.Content className="w-72">
          <FullNameFieldContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </FullNameFieldProvider>
  );
};
