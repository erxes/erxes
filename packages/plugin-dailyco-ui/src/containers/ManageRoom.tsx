import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __, Alert } from 'coreui/utils';
import { IConversation, IVideoCallData } from '@erxes/ui-inbox/src/inbox/types';
import React, { useState } from 'react';
import { mutations } from '../graphql';
import { openWindow } from '../utils';

type Props = {
  activeVideo?: IVideoCallData;
  conversation: any;
  refetchDetail: () => void;
  refetchMessages: () => void;
};

function ManageRoom(props: Props) {
  const [loading, setLoading] = useState(false);

  // const openWindow = (conversationId: string, url: string, name: string) => {
  //   if (!window || !window.top) {
  //     return;
  //   }

  //   const height = 600;
  //   const width = 480;

  //   const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
  //   const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;

  //   const link = `/videoCall?url=${url}&name=${name}&conversationId=${conversationId}`;

  //   console.log('link', link);

  //   window.open(
  //     `/videoCall?url=${url}&name=${name}&conversationId=${conversationId}`,
  //     '_blank',
  //     `toolbar=no,titlebar=no,directories=no,menubar=no,location=no,scrollbars=yes,status=no,height=${height},width=${width},top=${y},left=${x}`
  //   );
  // };

  const createVideoRoom = () => {
    const { conversation, activeVideo, refetchDetail, refetchMessages } = props;

    const conversationId = conversation._id;

    if (activeVideo && activeVideo.url) {
      openWindow(conversationId, activeVideo.url, activeVideo.name || '');
    } else {
      setLoading(true);

      client
        .mutate({
          mutation: gql(mutations.createRoom),
          variables: {
            contentTypeId: conversationId,
            contentType: 'inbox:conversations'
          }
        })
        .then(({ data }: any) => {
          setLoading(false);

          refetchDetail();
          refetchMessages();

          const { url, name } = data.dailyCreateRoom;

          openWindow(conversationId, url, name);
        })
        .catch(error => {
          setLoading(false);

          Alert.error(error.message);
        });
    }
  };

  return (
    <Tip text={__('Invite to video call')}>
      <label onClick={createVideoRoom}>
        {loading ? <SmallLoader /> : <Icon icon="video" />}
      </label>
    </Tip>
  );
}

export default ManageRoom;
