import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, Spinner, isDeeplyEqual, useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AccountingSheet } from '~/modules/layout/components/Sheet';
import { useTechCardDetail } from '../hooks/useTechCardDetail';
import { useTechCardEdit } from '../hooks/useTechCardMutations';
import { TTechCardForm } from '../types/TechCard';
import {
  normalizeTechCardDurationType,
  techCardFormSchema,
} from '../types/techCardFormSchema';
import { TechCardForm } from './TechCardForm';

export const EditTechCardForm = () => {
  const { techCardDetail, closeDetail, loading } = useTechCardDetail();
  const { editTechCard, loading: editLoading } = useTechCardEdit();
  const form = useForm<TTechCardForm>({
    resolver: zodResolver(techCardFormSchema),
  });
  const { reset } = form;

  useEffect(() => {
    if (techCardDetail) {
      reset({
        code: techCardDetail.code || '',
        name: techCardDetail.name,
        description: techCardDetail.description || '',
        duration:
          techCardDetail.durationType === 'real'
            ? undefined
            : techCardDetail.duration ?? undefined,
        durationType: normalizeTechCardDurationType(
          techCardDetail.durationType,
        ),
        status: techCardDetail.status || 'active',
        inputs: techCardDetail.inputs,
        outputs: techCardDetail.outputs,
      });
    }
  }, [reset, techCardDetail]);

  const handleSubmit = (data: TTechCardForm) => {
    if (!techCardDetail) {
      return;
    }

    const initialData = {
      code: techCardDetail.code || '',
      name: techCardDetail.name,
      description: techCardDetail.description || '',
      duration:
        techCardDetail.durationType === 'real'
          ? undefined
          : techCardDetail.duration ?? undefined,
      durationType: normalizeTechCardDurationType(techCardDetail.durationType),
      status: techCardDetail.status || 'active',
      inputs: techCardDetail.inputs,
      outputs: techCardDetail.outputs,
    };

    if (isDeeplyEqual(data, initialData)) {
      reset();
      closeDetail();
      return;
    }

    editTechCard({
      variables: {
        _id: techCardDetail._id,
        ...data,
      },
      onCompleted: () => {
        closeDetail();
        reset();
      },
    });
  };

  return (
    <>
      <TechCardForm form={form} onSubmit={handleSubmit} loading={editLoading} />
      {loading && (
        <div className="absolute inset-0 bg-background/10 backdrop-blur-xs flex items-center justify-center rounded-md">
          <Spinner />
        </div>
      )}
    </>
  );
};

export const EditTechCard = () => {
  const [open, setOpen] = useQueryState<string>('tech_card_id');

  return (
    <Sheet
      open={open !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <AccountingSheet title="Технологийн карт засах" className="sm:max-w-4xl">
        <EditTechCardForm />
      </AccountingSheet>
    </Sheet>
  );
};
