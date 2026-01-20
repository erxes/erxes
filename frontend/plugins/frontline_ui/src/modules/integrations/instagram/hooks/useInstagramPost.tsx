import { useQuery } from '@apollo/client';
import { GET_POST } from '../graphql/queries/igPostQueries';
import { IAttachment } from 'erxes-ui';

export const useInstagramPost = ({ erxesApiId }: { erxesApiId: string }) => {
  const { data, loading, error } = useQuery<{
    instagramGetPost: {
      content: string;
      permalink_url: string;
      attachments: IAttachment[];
    };
  }>(GET_POST, {
    variables: { erxesApiId },
    skip: !erxesApiId,
  });

  return {
    post: data?.instagramGetPost,
    loading,
    error,
  };
};
