import { GET_CP_EXAMPLE_POSTS } from '../graphql/queries/getExamplePosts';
import { useQuery } from '@apollo/client/react';

type IPost = {
  id: string;
  title: string;
  content: string;
};

export const useGetCPPosts = () => {
  const { data, loading, error } = useQuery<{ getCPExamplePosts: IPost[] }>(
    GET_CP_EXAMPLE_POSTS,
  );
  return { data, loading, error };
};
