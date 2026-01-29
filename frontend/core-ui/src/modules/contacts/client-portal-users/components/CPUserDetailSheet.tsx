import { Sheet, useQueryState } from 'erxes-ui';
import { CPUserDetailView } from '@/contacts/client-portal-users/components/CPUserDetailView';

export function CPUserDetailSheet() {
  const [cpUserId, setCpUserId] = useQueryState<string>('cpUserId');

  return (
    <Sheet open={!!cpUserId} onOpenChange={() => cpUserId && setCpUserId(null)}>
      <Sheet.View className="md:w-[calc(100vw-1rem)] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none sm:max-w-5xl">
        <Sheet.Header>
          <Sheet.Title>Client Portal User</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex-1 min-h-0 overflow-hidden">
          {cpUserId && <CPUserDetailView />}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
