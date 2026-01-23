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
import { SpinHotKeyScope } from '../../types/SpinHotKeyScope';

import { useSpins } from '../../hooks/useSpins';
import { spinFormSchema, SpinFormValues } from '../../constants/spinFormSchema';
import { EditSpinTabs } from './EditSpinTabs';

type Props = {
  spinId?: string;
};

export const LoyaltySpinEditSheet = ({ spinId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { spins } = useSpins();
  const [editSpinId, setEditSpinId] = useQueryState('editSpinId') as [
    string | null,
    (value: string | null) => void,
  ];

  const form = useForm<SpinFormValues>({
    resolver: zodResolver(spinFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      conditions: [
        {
          name: '',
          voucherCampaignId: '',
          probablity: 0,
          buyScore: 0,
        },
      ],
    },
  });

  const spinDetail = spins?.find((spin) => spin._id === editSpinId);

  useEffect(() => {
    if (spinDetail && spinDetail._id === editSpinId) {
      form.reset({
        title: spinDetail.name || '',
        status: spinDetail.status || 'active',
        startDate: spinDetail.startDate
          ? new Date(spinDetail.startDate)
          : undefined,
        endDate: spinDetail.endDate ? new Date(spinDetail.endDate) : undefined,
        kind: spinDetail.kind || '',
        conditions: spinDetail.conditions || [
          {
            name: spinDetail.conditions?.name || '',
            voucherCampaignId: spinDetail.conditions?.voucherCampaignId || '',
            probablity: spinDetail.conditions?.probablity || 0,
            buyScore: spinDetail.buyScore || 0,
          },
        ],
      });
    }
  }, [spinDetail, editSpinId, form]);

  useEffect(() => {
    if (editSpinId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(SpinHotKeyScope.SpinEditSheet);
    } else {
      setOpen(false);
      setHotkeyScope(SpinHotKeyScope.SpinPage);
    }
  }, [editSpinId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditSpinId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (spinDetail && !editSpinId) {
        setEditSpinId(spinDetail._id);
      }
    },
    SpinHotKeyScope.SpinPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), SpinHotKeyScope.SpinEditSheet);

  return (
    <Sheet
      onOpenChange={(open: boolean) => (!open ? onClose() : null)}
      open={open}
      modal
    >
      {spinId && (
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm">
            <IconEdit className="h-4 w-4" />
            Edit
            <Kbd>E</Kbd>
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View
        className="sm:max-w-2xl p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Edit spin campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditSpinTabs
            onOpenChange={(open: boolean) => !open && onClose()}
            form={form}
            spinId={editSpinId}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
