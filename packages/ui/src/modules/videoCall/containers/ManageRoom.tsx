import client from 'apolloClient';
import gql from 'graphql-tag';
import { SmallLoader } from 'modules/common/components/ButtonMutate';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __, Alert } from 'modules/common/utils';
import { IVideoCallData } from 'modules/inbox/types';
import React, { useState } from 'react';
import { mutations } from '../graphql';

type Props = {
  activeVideo?: IVideoCallData;
  conversationId: string;
  refetchDetail: () => void;
  refetchMessages: () => void;
};

function ManageRoom(props: Props) {
  const [loading, setLoading] = useState(false);

  const openWindow = (conversationId: string, url: string, name: string) => {
    const height = 600;
    const width = 480;

    const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;

    window.open(
      `/videoCall?url=${url}&name=${name}&conversationId=${conversationId}`,
      '_blank',
      `toolbar=no,titlebar=no,directories=no,menubar=no,location=no,scrollbars=yes,status=no,height=${height},width=${width},top=${y},left=${x}`
    );
  };

  const createVideoRoom = () => {
    const {
      conversationId,
      activeVideo,
      refetchDetail,
      refetchMessages
    } = props;

    if (activeVideo && activeVideo.url) {
      openWindow(conversationId, activeVideo.url, activeVideo.name || '');
    } else {
      setLoading(true);

      client
        .mutate({
          mutation: gql(mutations.createVideoChatRoom),
          variables: { _id: conversationId }
        })
        .then(({ data }: any) => {
          setLoading(false);

          refetchDetail();
          refetchMessages();

          const { url, name } = data.conversationCreateVideoChatRoom;

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
