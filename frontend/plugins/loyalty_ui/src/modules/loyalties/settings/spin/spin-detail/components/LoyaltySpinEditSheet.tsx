import { IconEdit } from '@tabler/icons-react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useQueryState,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SpinHotKeyScope } from '../../types/SpinHotKeyScope';

import { spinFormSchema, SpinFormValues } from '../../constants/spinFormSchema';
import { useSpins } from '../../hooks/useSpins';
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
      buyScore: 0,

      awards: [
        {
          name: '',
          voucherCampaignId: '',
          probablity: 0,
        },
      ],
    },
  });

  const spinDetail = spins?.find((spin) => spin._id === editSpinId);

  useEffect(() => {
    if (spinDetail?._id === editSpinId) {
      form.reset({
        title: spinDetail.title || '',
        status: spinDetail.status || 'active',
        startDate: spinDetail.startDate
          ? new Date(spinDetail.startDate)
          : undefined,
        endDate: spinDetail.endDate ? new Date(spinDetail.endDate) : undefined,
        kind: spinDetail.kind || '',
        buyScore: spinDetail.buyScore || 0,

        awards: spinDetail.awards || [
          {
            name: spinDetail.awards?.name || '',
            voucherCampaignId: spinDetail.awards?.voucherCampaignId || '',
            probablity: spinDetail.awards?.probablity || 0,
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
      onOpenChange={(open: boolean) => !open && onClose()}
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
