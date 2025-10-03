import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { FILES_VALIDATION_SCHEMA } from '@/settings/file-upload/schema';
import { UploadConfigFormT } from '@/settings/file-upload/types';

const useFileUploadForm = () => {
  const form = useForm<UploadConfigFormT>({
    mode: 'onBlur',
    defaultValues: {},
    resolver: zodResolver(FILES_VALIDATION_SCHEMA),
  });

  return { form };
};

export { useFileUploadForm };
