import { Avatar } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { IconPencil, IconUser } from '@tabler/icons-react';
import { useCustomerData } from '../hooks/useCustomerData';
import { contactEditOpenAtom } from '../states';

// Shows who this browser is talking as; the session's own customer only.
export const ContactChip = () => {
  const { customer, hasEmailOrPhone } = useCustomerData();
  const setEditing = useSetAtom(contactEditOpenAtom);

  const contact =
    customer?.primaryEmail ||
    customer?.emails?.[0] ||
    customer?.primaryPhone ||
    customer?.phones?.[0];
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex items-center gap-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors h-8 pl-1 pr-3 min-w-0 max-w-[220px]"
      aria-label={hasEmailOrPhone ? 'Edit your contact info' : 'Leave your email'}
    >
      {hasEmailOrPhone && contact ? (
        <>
          <Avatar size="sm" className="flex-none">
            <Avatar.Fallback>
              {(name || contact).charAt(0).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <span className="truncate text-xs text-primary-foreground">
            {contact}
          </span>
          <IconPencil
            size={12}
            className="flex-none text-primary-foreground/60"
          />
        </>
      ) : (
        <>
          <IconUser
            size={14}
            className="flex-none ml-1.5 text-primary-foreground/80"
          />
          <span className="truncate text-xs text-primary-foreground">
            Leave your email
          </span>
        </>
      )}
    </button>
  );
};
