import React from 'react';
import Participants from './containers/Participants';

export default ({ id }: { id: string }) => {
  return <Participants title="Participantss" dealId={id} />;
};
