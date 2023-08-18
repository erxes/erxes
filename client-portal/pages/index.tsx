import React from 'react';
import CategoriesContainer from '../modules/knowledgeBase/containers/CategoryList';
import { useRouter } from 'next/router';
import { gql, useMutation, useQuery } from '@apollo/client';

const socialPayLogin = gql`
  mutation clientPortalLoginWithSocialPay(
    $clientPortalId: String!
    $token: String!
  ) {
    clientPortalLoginWithSocialPay(
      clientPortalId: $clientPortalId
      token: $token
    )
  }
`;

const getConfigId = gql`
  query clientPortalGetConfigByDomain {
    clientPortalGetConfigByDomain {
      _id
    }
  }
`;

export default function Home() {
  const router = useRouter();
  const { data } = useQuery(getConfigId, {
    skip: !router.query.token,
    fetchPolicy: 'cache-first',
  });
  const [loginWithSocialPay] = useMutation(socialPayLogin);
  const token = router.query.token;

  const configId = data?.clientPortalGetConfigByDomain?._id;

  React.useEffect(() => {
    if (token && configId) {
      loginWithSocialPay({
        variables: {
          clientPortalId: configId,
          token,
        },
      }).then((res) => {
        if (res.data.clientPortalLoginWithSocialPay) {
          router.push('/profile');
        }
      });
    }
  }, [token, configId]);

  return <CategoriesContainer />;
}
