import { useQuery } from '@apollo/client';
import { GET_BOARDS } from '@/pricing/graphql/queries';

export interface IBoard {
  _id: string;
  name: string;
  pipelines?: {
    _id: string;
    name: string;
  }[];
}

export const useBoards = () => {
  const { data, loading, error } = useQuery<{ salesBoards: IBoard[] }>(
    GET_BOARDS,
  );

  return { boards: data?.salesBoards, loading, error };
};
