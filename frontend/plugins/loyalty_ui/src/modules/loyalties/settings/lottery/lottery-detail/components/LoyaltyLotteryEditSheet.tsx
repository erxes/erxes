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
import { useLottery } from '../../hooks/useLotteries';
import {
  lotteryFormSchema,
  LotteryFormValues,
} from '../../constants/lotteryFormSchema';
import { LotteryHotKeyScope } from '../../types/LotteryHotKeyScope';
import { EditLotteryTabs } from './EditLotteryTabs';

type Props = {
  lotteryId?: string;
};

export const LoyaltyLotteryEditSheet = ({ lotteryId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { lottery } = useLottery();
  const [editLotteryId, setEditLotteryId] = useQueryState('editLotteryId') as [
    string | null,
    (value: string | null) => void,
  ];

  const form = useForm<LotteryFormValues>({
    resolver: zodResolver(lotteryFormSchema),
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

  const lotteryDetail = lottery?.find(
    (lottery) => lottery._id === editLotteryId,
  );

  useEffect(() => {
    if (lotteryDetail && lotteryDetail._id === editLotteryId) {
      form.reset({
        title: lotteryDetail.name || '',
        status: lotteryDetail.status || 'active',
        startDate: lotteryDetail.startDate
          ? new Date(lotteryDetail.startDate)
          : undefined,
        endDate: lotteryDetail.endDate
          ? new Date(lotteryDetail.endDate)
          : undefined,
        kind: lotteryDetail.kind || '',
        conditions: lotteryDetail.conditions || [
          {
            name: lotteryDetail.conditions?.name || '',
            voucherCampaignId:
              lotteryDetail.conditions?.voucherCampaignId || '',
            probablity: lotteryDetail.conditions?.probablity || 0,
            buyScore: lotteryDetail.buyScore || 0,
          },
        ],
      });
    }
  }, [lotteryDetail, editLotteryId, form]);

  useEffect(() => {
    if (editLotteryId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        LotteryHotKeyScope.LotteryEditSheet,
      );
    } else {
      setOpen(false);
      setHotkeyScope(LotteryHotKeyScope.LotteryPage);
    }
  }, [editLotteryId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditLotteryId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (lotteryDetail && !editLotteryId) {
        setEditLotteryId(lotteryDetail._id);
      }
    },
    LotteryHotKeyScope.LotteryPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), LotteryHotKeyScope.LotteryEditSheet);

  return (
    <Sheet
      onOpenChange={(open: boolean) => (!open && onClose())}
      open={open}
      modal
    >
      {lotteryId && (
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
          <Sheet.Title>Edit lottery campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditLotteryTabs
            onOpenChange={(open: boolean) => !open && onClose()}
            form={form}
            lotteryId={editLotteryId}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
