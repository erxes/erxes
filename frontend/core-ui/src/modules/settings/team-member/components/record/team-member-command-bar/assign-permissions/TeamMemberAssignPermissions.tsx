import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconArmchair,
  IconArrowLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  Button,
  Command,
  Form,
  RecordTable,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Can, currentUserState } from 'ui-modules';
import {
  EMPTY_STRUCTURE_SEAT_TARGET,
  getStructureSeatTargetSchema,
  resolveStructureSeatTarget,
  StructureSeatTargetFields,
  TStructureSeatTargetForm,
  useStructureSeatMutations,
} from '@/structure-access';

export const TeamMemberAssignPermissionsTrigger = ({
  teamMemberIds,
  onSelect,
}: {
  teamMemberIds: string[];
  onSelect: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const currentUserId = useAtomValue(currentUserState)?._id;
  const hasRecipients =
    !!currentUserId && teamMemberIds.some((id) => id !== currentUserId);

  return (
    <Can action="structureEntitiesManage">
      <Command.Item
        className="w-full justify-between"
        disabled={!hasRecipients}
        onSelect={onSelect}
      >
        <span className="flex items-center gap-2">
          <IconArmchair />
          {t('assign-seat')}
        </span>
        <IconChevronRight />
      </Command.Item>
    </Can>
  );
};

export const TeamMemberAssignPermissionsContent = ({
  teamMemberIds,
  onBack,
  onClose,
}: {
  teamMemberIds: string[];
  onBack: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: tStructure } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
  const { toast } = useToast();
  const { table } = RecordTable.useRecordTable();
  const currentUserId = useAtomValue(currentUserState)?._id;
  const recipientIds = currentUserId
    ? teamMemberIds.filter((id) => id !== currentUserId)
    : [];
  const schema = useMemo(
    () => getStructureSeatTargetSchema(tStructure),
    [tStructure],
  );
  const form = useForm<TStructureSeatTargetForm>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_STRUCTURE_SEAT_TARGET,
  });
  const { addSeat, addHolders, loading } = useStructureSeatMutations();

  const onSubmit = async (values: TStructureSeatTargetForm) => {
    if (!recipientIds.length) {
      return;
    }

    try {
      const seatId = await resolveStructureSeatTarget(values, async (input) => {
        const { data } = await addSeat({ variables: input });

        return data?.structureSeatsAdd._id;
      });

      if (!seatId) {
        return;
      }

      form.setValue('seatId', seatId);

      await addHolders({ variables: { seatId, userIds: recipientIds } });
      toast({
        title: t('seat-assigned'),
        description: t('updated-team-members', {
          count: recipientIds.length,
        }),
        variant: 'success',
      });
      onClose();
      table.setRowSelection({});
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex w-96 flex-col">
      <div className="border-b p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onBack}
        >
          <IconArrowLeft />
          {t('back')}
        </Button>
      </div>
      <Form {...form}>
        <form
          className="flex flex-col gap-4 p-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1 styled-scroll">
            <StructureSeatTargetFields
              disabled={loading || !recipientIds.length}
            />
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {t('members-count', { count: recipientIds.length })}
            </span>
            <Button
              size="sm"
              type="submit"
              disabled={loading || !recipientIds.length}
            >
              {loading ? <Spinner size="sm" /> : t('apply')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
