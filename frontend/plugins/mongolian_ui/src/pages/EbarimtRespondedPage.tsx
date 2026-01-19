import { useSubscription } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { currentUserState } from 'ui-modules';
import { EBARIMT_RESPONDED } from '~/modules/ebarimt/responded/graphql/respondedSubscription';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';

export const EbarimtRespondedPage = () => {

  const currentUser = useAtomValue(currentUserState);

  useSubscription(EBARIMT_RESPONDED, {
    variables: {
      userId: currentUser?._id,
      processId: '',
    },
    shouldResubscribe: false,
    skip: !currentUser?._id,
    onData: ({ data }) => {
      const { ebarimtResponded } = data?.data;
      const { content: contents, processId, userId, responseId } = ebarimtResponded;

      if (!contents?.length) {
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
