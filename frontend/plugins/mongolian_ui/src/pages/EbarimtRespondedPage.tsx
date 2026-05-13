import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { EBARIMT_RESPONDED } from '~/modules/ebarimt/responded/graphql/respondedSubscription';
import { PerResponse } from '~/modules/ebarimt/responded/components/PerResponse';
import { Response } from '~/modules/ebarimt/responded/components/Response';

const SESSION_CODE_STORAGE_KEY = 'sessioncode';

const getSessionCode = () => {
  const existingSessionCode = sessionStorage.getItem(SESSION_CODE_STORAGE_KEY);

  if (existingSessionCode) {
    return existingSessionCode;
  }

  const sessionCode =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(SESSION_CODE_STORAGE_KEY, sessionCode);

  return sessionCode;
};

export const EbarimtRespondedPage = () => {
  const currentUser = useAtomValue(currentUserState);
  const sessionCode = getSessionCode();

  useSubscription(EBARIMT_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      sessionCode,
    },
    skip: !currentUser?._id || !sessionCode,
    onData: ({ data }) => {
      const response = data?.data?.ebarimtResponded;
      const { content: contents } = response ?? {};

      if (
        !contents?.length ||
        response?.sessionCode !==
          sessionStorage.getItem(SESSION_CODE_STORAGE_KEY)
      ) {
        return;
      }

      const printContents: any[] = [];
      let counter = 0;

      for (const content of contents) {
        printContents.push(PerResponse(content, counter));
        counter += 1;
      }

      const printMainContent = Response(printContents);

      const myWindow =
        window.open(`__`, '_blank', 'width=800, height=800') || ({} as any);

      if ('document' in myWindow && 'write' in myWindow.document) {
        myWindow.document.write(printMainContent);
      } else {
        alert('please allow Pop-ups and redirects on site settings!!!');
      }
    },
  });

  return <></>;
};
