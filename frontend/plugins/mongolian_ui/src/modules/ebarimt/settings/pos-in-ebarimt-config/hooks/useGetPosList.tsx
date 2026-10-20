import { useQuery } from '@apollo/client';
import { GET_POS_LIST } from '@/shared/graphql/posList';
import { compactList } from '@/shared/utils/cursorList';

export const useGetPoslist = () => {
  const { data, loading, error } = useQuery(GET_POS_LIST);

  return {
    poss: compactList(data?.posList).flatMap((pos) =>
      pos._id ? [{ ...pos, _id: pos._id, name: pos.name ?? '' }] : [],
    ),
    loading,
    error,
  };
};
