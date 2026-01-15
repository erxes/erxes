import { IconEdit } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AssignmentHotKeyScope } from '../../types/AssignmentHotKeyScope';

import { useAssignmentDetailWithQuery } from '../hooks/useAssignmentDetailWithQuery';
import {
  assignmentFormSchema,
  AssignmentFormValues,
} from '../../constants/assignmentFormSchema';
import { EditAssignmentTabs } from './EditAssignmentTabs';

type Props = {
  assignmentId?: string;
};

export const LoyaltyAssignmentEditSheet = ({ assignmentId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { assignmentDetail } = useAssignmentDetailWithQuery();
  const [editAssignmentId, setEditAssignmentId] =
    useQueryState('editAssignmentId');

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

  useEffect(() => {
    if (assignmentDetail && assignmentDetail._id === editAssignmentId) {
      form.reset({
        title: assignmentDetail.name || '',
        status: assignmentDetail.status || 'active',
        startDate: assignmentDetail.startDate
          ? new Date(assignmentDetail.startDate)
          : undefined,
        endDate: assignmentDetail.endDate
          ? new Date(assignmentDetail.endDate)
          : undefined,
        kind: assignmentDetail.kind || '',
        conditions: {
          voucherCampaignId: assignmentDetail.conditions?.voucherCampaignId || '',
          segmentId: assignmentDetail.conditions?.segmentId || '',
        },
      });
    }
  }, [assignmentDetail, editAssignmentId, form]);

  useEffect(() => {
    if (editAssignmentId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        AssignmentHotKeyScope.AssignmentEditSheet,
      );
    } else {
      setOpen(false);
      setHotkeyScope(AssignmentHotKeyScope.AssignmentPage);
    }
  }, [
    editAssignmentId,
    setHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  ]);

  const onClose = () => {
    setEditAssignmentId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (assignmentDetail && !editAssignmentId) {
        setEditAssignmentId(assignmentDetail._id);
      }
    },
    AssignmentHotKeyScope.AssignmentPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    AssignmentHotKeyScope.AssignmentEditSheet,
  );

  return (
    <Sheet
      onOpenChange={(open: boolean) => (!open ? onClose() : null)}
      open={open}
      modal
    >
      {assignmentId && (
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm">
            <IconEdit className="h-4 w-4" />
            Edit
            <Kbd>E</Kbd>
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View
        className="sm:max-w-3xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Edit assignment campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditAssignmentTabs
            onOpenChange={(open: boolean) => !open && onClose()}
            form={form}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
