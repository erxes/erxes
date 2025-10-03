import {
  Button,
  Input,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useCompaniesEdit } from 'ui-modules/modules/contacts/hooks';

export const CompanyName = ({
  _id,
  primaryName,
  scope,
  children,
}: {
  _id: string;
  primaryName: string;
  scope?: string;
  children?: React.ReactNode;
}) => {
  const { companiesEdit } = useCompaniesEdit();
  const [editingName, setEditingName] = useState(primaryName);
  useEffect(() => {
    if (primaryName !== editingName) {
      setEditingName(primaryName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryName]);

  const handleEnter = () => {
    if (editingName === primaryName) return;
    companiesEdit({
      variables: { _id, primaryName: editingName },
      onError() {
        setEditingName(primaryName);
      },
    });
  };

  return (
    <PopoverScoped scope={scope} closeOnEnter onEnter={handleEnter}>
      {children || <CompanyNameTrigger name={primaryName} />}
      <RecordTableInlineCell.Content>
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const CompanyNameTrigger = ({ name }: { name: string }) => {
  return (
    <Popover.Trigger asChild>
      <Button variant="ghost" className="text-base" size="lg">
        {name}
      </Button>
    </Popover.Trigger>
  );
};
