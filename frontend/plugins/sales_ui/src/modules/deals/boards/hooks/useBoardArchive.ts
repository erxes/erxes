import { ApolloError, useApolloClient, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { IBoard } from '@/deals/types/boards';
import { SALES_BOARD_ARCHIVE_PREVIEW } from '@/deals/graphql/queries/BoardsQueries';
import {
  SALES_BOARDS_ARCHIVE,
  SALES_BOARDS_UNARCHIVE,
} from '@/deals/graphql/mutations/BoardMutations';
import { refetchBoardArchiveQueries } from '../utils/refetchBoardArchiveQueries';
import type { SalesBoardArchivePreviewQuery } from '~/gql/graphql';

export type ArchivePreview =
  SalesBoardArchivePreviewQuery['salesBoardArchivePreview'];

type BoardArchiveConfirmation = Partial<ArchivePreview> & { board: IBoard };

type UseBoardArchiveResult = {
  archiveBoard: (
    board: IBoard,
  ) => Promise<BoardArchiveConfirmation | undefined>;
  confirmArchive: (preview: BoardArchiveConfirmation) => Promise<void>;
  loading: boolean;
};

export const useBoardArchive = (): UseBoardArchiveResult => {
  const client = useApolloClient();
  const { t } = useTranslation('sales');
  const [loading, setLoading] = useState(false);
  const [archive] = useMutation(SALES_BOARDS_ARCHIVE);
  const [unarchive] = useMutation(SALES_BOARDS_UNARCHIVE);

  const showError = (error: unknown, restoring = false): void => {
    toast({
      title: restoring
        ? t('unarchive-board-failed', 'Could not unarchive board')
        : t('archive-board-failed', 'Could not archive board'),
      description: error instanceof Error ? error.message : String(error),
      variant: 'destructive',
    });
  };

  const archiveBoard = async (
    board: IBoard,
  ): Promise<BoardArchiveConfirmation | undefined> => {
    if (loading) return;
    if (board.status === 'archived') return { board };
    setLoading(true);
    try {
      const { data } = await client.query({
        query: SALES_BOARD_ARCHIVE_PREVIEW,
        variables: { _id: board._id },
        fetchPolicy: 'network-only',
      });
      return { ...data.salesBoardArchivePreview, board };
    } catch (error: unknown) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmArchive = async (
    preview: BoardArchiveConfirmation,
  ): Promise<void> => {
    if (loading) return;
    const restoring = preview.board.status === 'archived';
    setLoading(true);
    try {
      if (restoring) {
        await unarchive({ variables: { _id: preview.board._id } });
      } else {
        await archive({
          variables: {
            _id: preview.board._id,
            acknowledgeAutomations: (preview.automationCount ?? 0) > 0,
            acknowledgeConnections: Boolean(
              preview.automationCount ||
                preview.posCount ||
                preview.paymentCount,
            ),
          },
        });
      }
      if (
        !restoring &&
        localStorage.getItem('erxesCurrentBoardId') === preview.board._id
      ) {
        localStorage.removeItem('erxesCurrentBoardId');
        localStorage.removeItem('erxesCurrentPipelineId');
      }
      toast({
        title: restoring
          ? t('board-unarchived', 'Board unarchived')
          : t('board-archived', 'Board archived'),
        variant: 'success',
      });
      await refetchBoardArchiveQueries(client).catch((error: unknown) => {
        toast({
          title: restoring
            ? t(
                'unarchive-board-refresh-failed',
                'Board unarchived, but views could not refresh',
              )
            : t(
                'archive-board-refresh-failed',
                'Board archived, but views could not refresh',
              ),
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive',
        });
      });
    } catch (error: unknown) {
      showError(error, restoring);
      if (
        error instanceof ApolloError &&
        error.graphQLErrors.some(
          ({ extensions }) => extensions?.code === 'ARCHIVE_INCOMPLETE',
        )
      ) {
        await refetchBoardArchiveQueries(client).catch(() => undefined);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    archiveBoard,
    confirmArchive,
    loading,
  };
};
