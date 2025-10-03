// ButtonWithData.stories.tsx
import { gql, useLazyQuery } from '@apollo/client';
import { Button } from 'erxes-ui';

const GET_USER = gql`
  query GetUser {
    user {
      id
      name
    }
  }
`;

const ButtonWithData = () => {
  const [getUser, { data, loading, error }] = useLazyQuery(GET_USER);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Button onClick={() => getUser()} className="bg-red-600">
      Hello, {data?.user?.name}
    </Button>
  );
};

export default {
  title: 'Components/ButtonWithData',
  component: ButtonWithData,
  parameters: {
    mocks: [
      {
        request: {
          query: GET_USER,
        },
        result: {
          data: {
            user: {
              id: '1',
              name: 'John Doe',
            },
          },
        },
      },
    ],
  },
};

export const Default = () => <ButtonWithData />;
