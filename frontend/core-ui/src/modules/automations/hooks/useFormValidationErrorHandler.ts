import { toast } from 'erxes-ui';
import { FieldErrors } from 'react-hook-form';

interface FormValidationErrorHandlerOptions {
  formName?: string;
  customTitle?: string;
  customDescription?: string;
  showErrorCount?: boolean;
}

interface FormValidationErrorHandler {
  handleValidationErrors: (errors: FieldErrors) => void;
}

export const useFormValidationErrorHandler = (
  options: FormValidationErrorHandlerOptions = {},
): FormValidationErrorHandler => {
  const {
    formName = 'Configuration',
    customTitle,
    customDescription,
    showErrorCount = true,
  } = options;

  const handleValidationErrors = (errors: FieldErrors) => {
    console.log({ errors });
    const errorCount = Object.keys(errors).length;

    const title =
      customTitle ||
      `${formName} Error${
        errorCount > 1 ? `s${showErrorCount ? ` (${errorCount})` : ''}` : ''
      }`;
    const description =
      customDescription ||
      'Validation errors found. Please review all tabs and fix the highlighted fields.';

    toast({
      title,
      description,
      variant: 'destructive',
    });
  };

  return {
    handleValidationErrors,
  };
};
