import React from 'react';
import BuildingsSection from '../../modules/buildings/containers/sections/BuildingsSection';

export default ({ id }: { id: string }) => {
  return <BuildingsSection title="Related Buildings" ticketId={id} />;
};
