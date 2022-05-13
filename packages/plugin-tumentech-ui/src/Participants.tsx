import React from 'react';
import ParticipantsSection from './containers/participants/ParticipantsSection';

export default ({ id }: { id: string }) => {
  return <ParticipantsSection title="Participantss" dealId={id} />;
};
