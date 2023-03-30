import { mutations } from '../graphql';

import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import { Config } from '../../types';
type Props = {
  config: Config;
};
function VerifyContainer(props: Props) {
  const router = useRouter();
  const { code } = router.query;
  const { config } = props;
  const [sendVerificationCode] = useMutation(gql(mutations.googleLogin));

  config._id &&
    code &&
    sendVerificationCode({
      variables: {
        code,
        clientPortalId: config._id
      }
    })
      .then((result) => {
        if (result?.data?.clientPortalGoogleAuthentication === 'loggedin') {
          window.location.href = '/';
        }
      })
      .catch((e) => {
        console.error('error: ', e.message);
      });

  return <p />;
}

export default VerifyContainer;
