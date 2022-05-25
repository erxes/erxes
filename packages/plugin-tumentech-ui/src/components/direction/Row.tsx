import React from 'react';
import { RowTitle } from '@erxes/ui-engage/src/styles';

type Props = {
  direction: any;
};

const Row = (props: Props) => {
  const { direction } = props;
  return (
    <tr>
      <td key={direction.locationA}>
        <RowTitle>{direction.locationA || '-'}</RowTitle>
      </td>

      <td key={direction.locationB}>
        <RowTitle>{direction.locationB || '-'}</RowTitle>
      </td>
    </tr>
  );
};

export default Row;
