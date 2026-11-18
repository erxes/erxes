import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { EBARIMT_RESPONDED } from '~/modules/ebarimt/responded/graphql/respondedSubscription';
import { printEbarimtResponses } from '~/modules/ebarimt/responded/utils/printEbarimtResponses';

const SESSION_CODE_STORAGE_KEY = 'sessioncode';

export const EbarimtRespondedPage = () => {
  const currentUser = useAtomValue(currentUserState);
  const sessionCode = sessionStorage.getItem(SESSION_CODE_STORAGE_KEY) || '';

  useSubscription(EBARIMT_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode,
    },
    skip: !currentUser?._id || !sessionCode,
    onError: (error) => {
      console.log('EBARIMT RESPONDED SUB ERROR:', error);
    },
    onData: ({ data }) => {
      const response = data?.data?.ebarimtResponded;
      const { content: contents } = response ?? {};

      if (
        !contents?.length ||
        response?.sessionCode !== sessionStorage.getItem(SESSION_CODE_STORAGE_KEY)
      ) {
        return;
      }

      if (!printEbarimtResponses(contents)) {
        alert('please allow Pop-ups and redirects on site settings!!!');
      }
    },
  });

  return <></>;
};
