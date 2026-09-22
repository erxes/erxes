import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateTmsForm from '@/tms/components/CreateTmsForm';
import { useSetAtom } from 'jotai';
import { currentStepAtom } from '~/modules/tms/states/tmsInformationFieldsAtoms';

export const TmsCreateSheet = () => {
  const { t } = useTranslation('tourism');
  const [open, setOpen] = useState<boolean>(false);
  const setCurrentStep = useSetAtom(currentStepAtom);

  const handleOpenChange = (openState: boolean) => {
    setOpen(openState);
    setCurrentStep(1);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('create-tms')}
        </Button>
      </Sheet.Trigger>
      <CreateTmsForm onOpenChange={handleOpenChange} isOpen={open} />
    </Sheet>
  );
};

export const TmsCreateSheetHeader = () => {
  const { t } = useTranslation('tourism');
  return (
    <Sheet.Header>
      <Sheet.Title>{t('create-tms-full')}</Sheet.Title>
      <Sheet.Close />
    </Sheet.Header>
  );
};
