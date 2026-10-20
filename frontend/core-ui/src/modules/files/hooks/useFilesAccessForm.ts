import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  FILES_FILE_ACCESS,
  FILES_FOLDER_ACCESS,
  IFile,
  IFilesAccessGrant,
  IFilesFolder,
  TFilesRole,
} from 'ui-modules';
import { FILES_ROLES } from '../constants/filesAccess';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';
import {
  filesAccessSchema,
  principalTypeOf,
  TFilesAccessForm,
  toFormGrant,
  toGrantInput,
} from '../utils/filesAccessForm';

const FILE_ROLES: TFilesRole[] = ['viewer', 'manager'];

const isOwnerGrant = (grant: IFilesAccessGrant, ownerId?: string) =>
  !!ownerId && grant.type === 'user' && grant.id === ownerId;

export const useFilesAccessForm = () => {
  const { accessTarget, setAccessTarget } = useFilesPage();
  const { updateAccess, updateFileAccess, loading: saving } = useFilesActions();
  const open = !!accessTarget;
  const isFile = accessTarget?.itemType === 'file';

  const folderQuery = useQuery<{ filesFolderDetail: IFilesFolder }>(
    FILES_FOLDER_ACCESS,
    {
      variables: { _id: accessTarget?._id },
      skip: !open || isFile,
      fetchPolicy: 'network-only',
    },
  );
  const fileQuery = useQuery<{ filesDetail: IFile }>(FILES_FILE_ACCESS, {
    variables: { _id: accessTarget?._id },
    skip: !open || !isFile,
    fetchPolicy: 'network-only',
  });
  const folder = isFile ? undefined : folderQuery.data?.filesFolderDetail;
  const item = isFile ? fileQuery.data?.filesDetail : folder;
  const ownerId = folder?.space ? undefined : item?.createdBy;

  const form = useForm<TFilesAccessForm>({
    resolver: zodResolver(filesAccessSchema),
    defaultValues: { restricted: false, access: [] },
  });
  const grants = useFieldArray({ control: form.control, name: 'access' });

  useEffect(() => {
    if (item?.access) {
      form.reset({
        restricted: !!folder?.restricted,
        access: item.access
          .filter((g) => !isOwnerGrant(g, ownerId))
          .map(toFormGrant),
      });
    }
  }, [item, folder, ownerId, form]);

  const close = () => setAccessTarget(null);

  const onSubmit = form.handleSubmit(async ({ restricted, access }) => {
    if (!accessTarget) {
      return;
    }

    const list = access.map(toGrantInput);
    // The server re-adds the owner.
    const result = isFile
      ? await updateFileAccess(accessTarget._id, list)
      : await updateAccess(accessTarget._id, { restricted, access: list });

    if (!result.errors) {
      close();
    }
  });

  const restricted = form.watch('restricted');

  return {
    open,
    close,
    isFile,
    item,
    ownerId,
    loading: folderQuery.loading || fileQuery.loading,
    error: folderQuery.error || fileQuery.error,
    saving,
    form,
    grants,
    roles: isFile ? FILE_ROLES : [...FILES_ROLES],
    addGrant: () =>
      grants.append({ type: 'user', id: undefined, role: 'viewer' }),
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
    canRestrict: !!folder && !folder.space,
    inherited: restricted ? [] : item?.inheritedAccess || [],
    forbidden: !!item && !item.access,
    onSubmit,
  };
};
