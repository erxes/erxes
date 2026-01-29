import {
  Badge,
  Empty,
  RelativeDateDisplay,
  ScrollArea,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { DataListItem } from '@/contacts/components/ContactDataListItem';
import { useClientPortalUser } from '@/contacts/client-portal-users/hooks/useClientPortalUser';

function displayName(
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  } | null,
) {
  if (!user) return '-';
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return user.email || user.phone || user.username || '-';
}

export const CPUserDetailView = () => {
  const [_id] = useQueryState<string>('cpUserId');
  const { cpUser, loading, error } = useClientPortalUser();

  const notFound = !_id || (!loading && !cpUser);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  if (notFound) {
    return (
      <Empty className="flex-1">
        <Empty.Header>
          <Empty.Title>Client Portal User not found</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  }

  return cpUser ? (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <DataListItem label="Name">
          <span>{displayName(cpUser)}</span>
        </DataListItem>
        <DataListItem label="Email">
          <span className="text-muted-foreground">{cpUser.email || '-'}</span>
        </DataListItem>
        <DataListItem label="Phone">
          <span className="text-muted-foreground">{cpUser.phone || '-'}</span>
        </DataListItem>
        <DataListItem label="Type">
          {cpUser.type ? (
            <Badge variant="secondary">{cpUser.type}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DataListItem>
        <DataListItem label="Company">
          <span className="text-muted-foreground">
            {cpUser.companyName || '-'}
          </span>
        </DataListItem>
        <DataListItem label="Verified">
          <Badge variant={cpUser.isVerified ? 'success' : 'secondary'}>
            {cpUser.isVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        <DataListItem label="Email verified">
          <Badge variant={cpUser.isEmailVerified ? 'success' : 'secondary'}>
            {cpUser.isEmailVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        <DataListItem label="Phone verified">
          <Badge variant={cpUser.isPhoneVerified ? 'success' : 'secondary'}>
            {cpUser.isPhoneVerified ? 'Yes' : 'No'}
          </Badge>
        </DataListItem>
        {cpUser.lastLoginAt && (
          <DataListItem label="Last login">
            <RelativeDateDisplay value={cpUser.lastLoginAt} asChild>
              <RelativeDateDisplay.Value value={cpUser.lastLoginAt} />
            </RelativeDateDisplay>
          </DataListItem>
        )}
        <DataListItem label="Created">
          {cpUser.createdAt ? (
            <RelativeDateDisplay value={cpUser.createdAt} asChild>
              <RelativeDateDisplay.Value value={cpUser.createdAt} />
            </RelativeDateDisplay>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </DataListItem>
      </div>
    </ScrollArea>
  ) : null;
};
