import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FILES_ACCESS_ADD, FILES_REFETCH_QUERIES } from 'ui-modules';
import { FILES_ROLES } from '../constants/filesAccess';
import { useFilesPage } from '../context/FilesPageContext';
import {
  filesAccessSchema,
  principalTypeOf,
  TFilesAccessForm,
  toGrantInput,
} from '../utils/filesAccessForm';

const EMPTY_GRANT = {
  type: 'user' as const,
  id: undefined,
  role: 'viewer' as const,
};

export const useFilesBulkShareForm = () => {
  const { t } = useTranslation('files');
  const { bulkShareOpen, setBulkShareOpen, selection } = useFilesPage();
  const form = useForm<TFilesAccessForm>({
    resolver: zodResolver(filesAccessSchema),
    defaultValues: { restricted: false, access: [EMPTY_GRANT] },
  });
  const grants = useFieldArray({ control: form.control, name: 'access' });
  const close = () => setBulkShareOpen(false);
  const [addAccess, { loading }] = useMutation(FILES_ACCESS_ADD, {
    refetchQueries: [
      ...FILES_REFETCH_QUERIES,
      'FilesFolders',
      'FilesFolderAccess',
      'FilesFileAccess',
    ],
    onCompleted: () => {
      toast({ title: t('access-saved'), variant: 'success' });
      close();
      selection.clear();
    },
    onError: (error) =>
      toast({
        title: t('action-failed'),
        description: error.message,
        variant: 'destructive',
      }),
  });

  useEffect(() => {
    if (bulkShareOpen) {
      form.reset({ restricted: false, access: [EMPTY_GRANT] });
    }
  }, [bulkShareOpen, form]);

  return {
    open: bulkShareOpen,
    close,
    count: selection.count,
    hasFiles: !!selection.fileIds.length,
    form,
    grants,
    roles: [...FILES_ROLES],
    saving: loading,
    addGrant: () => grants.append(EMPTY_GRANT),
    changeType: (index: number, value: string) => {
      const type = principalTypeOf(value);

      if (type) {
        grants.update(index, {
          ...form.getValues(`access.${index}`),
          type,
          id: undefined,
        });
      }
    },
    onSubmit: form.handleSubmit(({ access }) =>
      addAccess({
        variables: {
          fileIds: selection.fileIds,
          folderIds: selection.folderIds,
          access: access.map(toGrantInput),
        },
      }),
    ),
  };
};
