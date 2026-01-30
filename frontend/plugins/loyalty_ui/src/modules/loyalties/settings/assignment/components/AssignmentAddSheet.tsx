import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssignmentHotKeyScope } from '../types/AssignmentHotKeyScope';
import { AssignmentTabs } from '../add-assignment-campaign/components/AssignmentTabs';
import {
  assignmentFormSchema,
  AssignmentFormValues,
} from '../constants/assignmentFormSchema';

export const LoyaltyAssignmentAddSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      conditions: {
        voucherCampaignId: '',
        segmentId: '',
      },
    },
  });

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      AssignmentHotKeyScope.AssignmentAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(AssignmentHotKeyScope.AssignmentPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), AssignmentHotKeyScope.AssignmentPage);
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    AssignmentHotKeyScope.AssignmentAddSheet,
  );

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add assignment campaign
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-4xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Add assignment campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <AssignmentTabs onOpenChange={setOpen} form={form} />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
