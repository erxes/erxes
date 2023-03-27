import React from 'react';
import { mutations } from '../graphql';

import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import VerifyComponent from '../components/Verify';

function VerifyContainer() {
  const router = useRouter();
  const { code, state } = router.query;
  const [sendVerificationCode] = useMutation(gql(mutations.getGoogleCode));

  const verify = () => {
    sendVerificationCode({
      variables: {
        code,
        clientPortalId: process.env.CLIENT_PORTAL_ID
      }
    })
      .then((result) => {
        if (result?.data?.clientPortalGoogleAuthentication === 'loggedin') {
          router.push('/');
        }
      })
      .catch((e) => {
        console.log('error: ', e.message);
      });
  };
  if (code) {
    return <VerifyComponent verify={() => verify()} />;
  }
}

export default VerifyContainer;
