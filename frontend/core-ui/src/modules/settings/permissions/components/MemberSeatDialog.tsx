import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { Button, Dialog, Form, Spinner, toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { currentUserState } from 'ui-modules';
import {
  EMPTY_STRUCTURE_SEAT_TARGET,
  getStructureSeatTargetSchema,
  resolveStructureSeatTarget,
  StructureSeatTargetFields,
  TStructureSeatTargetForm,
  useStructureSeatMutations,
} from '@/structure-access';
import { evictUserStructureMemberships } from '@/settings/team-member/utils/evictUserStructureMemberships';

const MemberSeatForm = ({
  userId,
  onDone,
}: {
  userId: string;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const { t: tStructure } = useTranslation('settings', {
    keyPrefix: 'structure',
  });
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
    try {
      const seatId = await resolveStructureSeatTarget(values, async (input) => {
        const { data } = await addSeat({ variables: input });

        return data?.structureSeatsAdd._id;
      });

      if (!seatId) {
        return;
      }

      form.setValue('seatId', seatId);

      await addHolders({
        variables: { seatId, userIds: [userId] },
        update: (cache) => evictUserStructureMemberships(cache, userId),
      });
      toast({ title: t('seat-assigned'), variant: 'success' });
      onDone();
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <StructureSeatTargetFields disabled={loading} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onDone}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : t('assign-seat')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const MemberSeatDialog = ({ userId }: { userId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const currentUser = useAtomValue(currentUserState);
  const [open, setOpen] = useState(false);

  if (!currentUser || currentUser._id === userId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary">
          <IconPlus />
          {t('add-seat')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-lg">
        <Dialog.HeaderCombined
          title={t('add-seat')}
          description={t('add-seat-description')}
        />
        {open && (
          <MemberSeatForm userId={userId} onDone={() => setOpen(false)} />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
