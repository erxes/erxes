import { PopoverScoped, RecordTableInlineCell, Command } from 'erxes-ui';
import { Roles } from '@/settings/team-member/constants/roles';
import { useRoleUpsert } from '@/settings/team-member/hooks/useRoleUpsert';
import { IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

export const TeamMemberRoleSelect = ({
  value,
  userId,
}: {
  value: string;
  userId: string;
}) => {
  const { roleUpsert } = useRoleUpsert();
  const [open, setOpen] = useState(false);
  const handleRoleChange = (role: string) => {
    roleUpsert({
      variables: {
        userId,
        role,
      },
      onCompleted: () => setOpen(false),
    });
  };

  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <span className="font-medium capitalize">{value}</span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command>
          <Command.Input placeholder="Search role" />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            {Object.values(Roles)
              .filter((role) => role !== 'owner')
              .map((role) => (
                <Command.Item
                  key={role}
                  value={role}
                  onSelect={() => handleRoleChange(role)}
                  className="font-medium capitalize"
                >
                  <span className="flex items-center gap-2">
                    {role}
                    {value === role && (
                      <IconCheck className="text-primary size-4" />
                    )}
                  </span>
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
