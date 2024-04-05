import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { colors } from '@erxes/ui/src/styles';
import { Status } from '../../styles/item';

function ItemArchivedStatus({
  status,
  skipContainer
}: {
  status: string;
  skipContainer: boolean;
}) {
  if (status !== 'archived') {
    return null;
  }

  const renderStatus = () => (
    <span style={{ backgroundColor: colors.colorCoreYellow, float: 'right' }}>
      {__('Archived')}
    </span>
  );

  if (!skipContainer) {
    return <Status>{renderStatus()}</Status>;
  }

  return renderStatus();
}

export default ItemArchivedStatus;
