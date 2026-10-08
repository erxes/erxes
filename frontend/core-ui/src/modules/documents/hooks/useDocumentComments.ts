import { useApolloClient } from '@apollo/client';
import { GET_USER_DETAIL } from '@/settings/profile/graphql/queries/userDetail';
import { IBlockEditor, readImage, toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { currentUserState, IUser } from 'ui-modules';
import { DocumentThreadStore } from '../utils/DocumentThreadStore';
import { FormType } from './useDocumentForm';

type User = Awaited<
  ReturnType<NonNullable<IBlockEditor['resolveUsers']>>
>[number];

export const useDocumentComments = (): {
  threadStore: DocumentThreadStore;
  resolveUsers: (ids: string[]) => Promise<User[]>;
  connectEditor: (editor: IBlockEditor) => () => void;
} => {
  const client = useApolloClient();
  const currentUser = useAtomValue(currentUserState);
  const { setValue } = useFormContext<FormType>();
  const threadStore = useMemo(
    () => new DocumentThreadStore(currentUser?._id || ''),
    [currentUser?._id],
  );

  const resolveUsers = useCallback(
    async (ids: string[]): Promise<User[]> =>
      Promise.all(
        ids.map(async (id) => {
          let user: IUser | null = null;
          try {
            const { data } = await client.query<{ userDetail: IUser | null }>({
              query: GET_USER_DETAIL,
              variables: { _id: id },
            });
            user = data.userDetail;
          } catch (error) {
            toast({
              title: 'Could not load comment author',
              description:
                error instanceof Error ? error.message : 'Please try again.',
              variant: 'destructive',
            });
          }
          return {
            id,
            username:
              user?.details?.fullName ||
              user?.username ||
              user?.email ||
              'Unknown user',
            avatarUrl: user?.details?.avatar
              ? readImage(user.details.avatar)
              : '',
          };
        }),
      ),
    [client],
  );

  const connectEditor = useCallback(
    (editor: IBlockEditor): (() => void) => {
      const updateComments = () =>
        setValue('commentData', threadStore.serialize(editor), {
          shouldDirty: true,
        });
      threadStore.onMutation = () => {
        updateComments();
        toast({
          title: 'Comments updated',
          description: 'Save the document to keep your changes.',
        });
      };
      const unsubscribe = editor.onChange(updateComments);
      return () => {
        unsubscribe?.();
        threadStore.onMutation = undefined;
      };
    },
    [setValue, threadStore],
  );

  return { threadStore, resolveUsers, connectEditor };
};
