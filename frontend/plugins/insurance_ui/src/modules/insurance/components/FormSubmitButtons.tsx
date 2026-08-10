import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FormSubmitButtonsProps {
  creating: boolean;
  success: boolean;
  cancelPath?: string;
  submitText?: string;
  submittingText?: string;
}

export const FormSubmitButtons = ({
  creating,
  success,
  cancelPath = '/insurance/products',
  submitText = 'Create Contract',
  submittingText = 'Creating...',
}: FormSubmitButtonsProps) => {
  const { t } = useTranslation('insurance');
  return (
    <div className="flex justify-end gap-3 pt-4">
      <Button type="button" variant="outline" asChild disabled={creating}>
        <Link to={cancelPath}>{t('cancel')}</Link>
      </Button>
      <Button type="submit" disabled={creating || success}>
        <IconPlus size={16} />
        {creating ? submittingText : submitText}
      </Button>
    </div>
  );
};
