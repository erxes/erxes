import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { currentUserState } from 'ui-modules';
import { EBARIMT_RESPONDED } from '~/modules/ebarimt/responded/graphql/respondedSubscription';
import { PerResponse } from '~/modules/ebarimt/responded/components/PerResponse';
import { Response } from '~/modules/ebarimt/responded/components/Response';

export const EbarimtRespondedPage = () => {
  const currentUser = useAtomValue(currentUserState);
  const [processId, setProcessId] = useState(
    () => sessionStorage.getItem('processId') || '',
  );

  useEffect(() => {
    const handleProcessIdChanged = () => {
      setProcessId(sessionStorage.getItem('processId') || '');
    };

    window.addEventListener('erxes-process-id-changed', handleProcessIdChanged);

    return () => {
      window.removeEventListener(
        'erxes-process-id-changed',
        handleProcessIdChanged,
      );
    };
  }, []);

  useSubscription(EBARIMT_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      processId,
    },
    skip: !currentUser?._id || !processId,
    onData: ({ data }) => {
      const response = data?.data?.ebarimtResponded;
      const { content: contents } = response ?? {};

      if (
        !contents?.length ||
        response?.processId !== sessionStorage.getItem('processId')
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
