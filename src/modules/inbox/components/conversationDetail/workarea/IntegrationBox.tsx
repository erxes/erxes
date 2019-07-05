import { IFrameBox } from 'modules/inbox/styles';
import * as React from 'react';

type Props = {
  email: string;
  conversationId: string;
};

const { REACT_APP_INTEGRATIONS_API_URL } = process.env;

const IntegrationBox = (props: Props) => {
  const { email, conversationId } = props;
  const src = `${REACT_APP_INTEGRATIONS_API_URL}/gmail/render?conversationId=${conversationId}&email=${email}`;

  return <IFrameBox src={src} />;
};

export default IntegrationBox;
