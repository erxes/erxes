import { IConversation } from '@erxes/ui-inbox/src/inbox/types';
import React from 'react';

type Props = {
  conversation: IConversation;
};

class CallPro extends React.Component<Props, {}> {
  render() {
    const { conversation } = this.props;
    const { callProAudio } = conversation;

    if (!callProAudio) {
      return <p>You dont have permission to listen</p>;
    }

    return (
      <>
        <audio controls={true}>
          <source src={callProAudio} type='audio/ogg' />
        </audio>
      </>
    );
  }
}

export default CallPro;
