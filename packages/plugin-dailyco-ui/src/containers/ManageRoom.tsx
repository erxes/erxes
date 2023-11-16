import { gql } from '@apollo/client';
import { IVideoCallData } from '@erxes/ui-inbox/src/inbox/types';
import client from '@erxes/ui/src/apolloClient';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import { __, Alert } from 'coreui/utils';
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
      <label
        onClick={createVideoRoom}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            createVideoRoom();
          }
        }}
        tabIndex={0} // This makes the element focusable
      >
        {loading ? <SmallLoader /> : <Icon icon="video" />}
      </label>
    </Tip>
  );
}

export default ManageRoom;
