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
import { DonationHotKeyScope } from '../../types/DonationHotKeyScope';

import { useDonationDetailWithQuery } from '../hooks/useDonationDetailWithQuery';
import {
  donationFormSchema,
  DonationFormValues,
} from '../../constants/donationFormSchema';
import { EditDonationTabs } from './EditDonationTabs';

type Props = {
  donationId?: string;
};

export const LoyaltyDonationEditSheet = ({ donationId }: Props) => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { donationDetail } = useDonationDetailWithQuery();
  const [editDonationId, setEditDonationId] = useQueryState('editDonationId');

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      title: '',
      status: 'active',
      maxScore: 0,
      conditions: [
        {
          voucherCampaignId: '',
          minScore: 0,
        },
      ],
    },
  });

  useEffect(() => {
    if (donationDetail && donationDetail._id === editDonationId) {
      form.reset({
        title: donationDetail.name || '',
        status: donationDetail.status || 'active',
        startDate: donationDetail.startDate
          ? new Date(donationDetail.startDate)
          : undefined,
        endDate: donationDetail.endDate
          ? new Date(donationDetail.endDate)
          : undefined,
        kind: donationDetail.kind || '',
        maxScore: donationDetail.maxScore || 0,
        conditions: [
          {
            voucherCampaignId:
              donationDetail.conditions?.voucherCampaignId || '',
            minScore: donationDetail.conditions?.minScore || 0,
          },
        ],
      });
    }
  }, [donationDetail, editDonationId, form]);

  useEffect(() => {
    if (editDonationId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        DonationHotKeyScope.DonationEditSheet,
      );
    } else {
      setOpen(false);
      setHotkeyScope(DonationHotKeyScope.DonationPage);
    }
  }, [editDonationId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditDonationId(null);
  };

  useScopedHotkeys(
    `e`,
    () => {
      if (donationDetail && !editDonationId) {
        setEditDonationId(donationDetail._id);
      }
    },
    DonationHotKeyScope.DonationPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    DonationHotKeyScope.DonationEditSheet,
  );

  return (
    <Sheet
      onOpenChange={(open: boolean) => (!open ? onClose() : null)}
      open={open}
      modal
    >
      {donationId && (
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
          <Sheet.Title>Edit donation campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col overflow-hidden">
          <EditDonationTabs
            onOpenChange={(open: boolean) => !open && onClose()}
            form={form}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
