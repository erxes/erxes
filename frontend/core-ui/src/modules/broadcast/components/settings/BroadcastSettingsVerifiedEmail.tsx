import { useBroadcastMemberAdd } from '@/broadcast/hooks/useBroadcastMemberAdd';
import { useBroadcastMemberRemove } from '@/broadcast/hooks/useBroadcastMemberRemove';
import { useBroadcastMembers } from '@/broadcast/hooks/useBroadcastMembers';
import { IconShieldFilled } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  Skeleton,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useState } from 'react';
import validator from 'validator';
import { BroadcastMemberInline } from '../BroadcastMemberInline';

export const BroadcastSettingsVerifiedEmail = () => {
  const [open, setOpen] = useState(false);

  const [search, setSearch] = useState('');

  const { confirm } = useConfirm();

  const {
    members = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useBroadcastMembers({
    variables: {
      isVerified: true,
    },
  });

  const { removeBroadcastMember } = useBroadcastMemberRemove();
  const { addBroadcastMember } = useBroadcastMemberAdd();

  const handleAdd = (email: string) => {
    if (!validator.isEmail(email)) {
      return toast({
        title: 'Invalid email',
        description: 'Please enter a valid email',
        variant: 'destructive',
      });
    }

    addBroadcastMember(email, {
      onCompleted: () => {
        toast({
          title: 'Email added successfully',
          description:
            'Your email has been added! Please check your inbox for confirmation',
          variant: 'success',
        });

        setOpen(false);
      },
    });
  };

  const handleRemove = (email?: string) => {
    if (!email) return;

    confirm({
      message: `Are you sure you want to remove this email?`,
    }).then(() => {
      removeBroadcastMember(email);
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <div className="w-full flex gap-2 justify-start items-center overflow-x-auto hide-scroll">
            {loading ? (
              <>
                <Skeleton className="w-2/3 h-6 bg-primary/10" />
                <Skeleton className="w-32 h-6 bg-primary/10" />
              </>
            ) : members?.length ? (
              (members || []).map((member) => (
                <Badge key={member._id}>
                  <BroadcastMemberInline
                    size="sm"
                    members={[
                      {
                        ...member,
                      },
                    ]}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground font-medium">
                No verified emails
              </span>
            )}
          </div>
        </Button>
      </Popover.Trigger>

      <Combobox.Content className="p-0 min-w-[312px]" align="start">
        <Command>
          <Command.Input
            placeholder="Search or add email"
            value={search}
            onValueChange={setSearch}
          />
          <Command.List>
            {loading ? (
              <Command.Empty className="p-1">
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-2/3 h-7" />
                  <Skeleton className="w-full h-7" />
                  <Skeleton className="w-32 h-7" />
                </div>
              </Command.Empty>
            ) : members?.length === 0 ? (
              <Command.Empty>
                <div>No results found.</div>
              </Command.Empty>
            ) : (
              <Command.Empty className="p-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start relative flex gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 h-8 cursor-pointer ${validator.isEmail(search) ? 'text-success' : 'text-destructive'}`}
                  onClick={() => {
                    handleAdd(search);
                  }}
                >
                  <IconShieldFilled />
                  Verify email: "{search}"
                </Button>
              </Command.Empty>
            )}

            {(members || []).map((member) => (
              <Command.Item
                value={member.email}
                onSelect={() => handleRemove(member.email)}
              >
                <BroadcastMemberInline
                  members={[
                    {
                      ...member,
                    },
                  ]}
                />
              </Command.Item>
            ))}

            <Combobox.FetchMore
              fetchMore={handleFetchMore}
              totalCount={totalCount}
              currentLength={members.length}
            />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
