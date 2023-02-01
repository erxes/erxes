import { RowTitle } from '@erxes/ui-engage/src/styles';
import { DateWrapper } from '@erxes/ui/src/styles/main';
import { renderFullName } from '@erxes/ui/src/utils/core';
import dayjs from 'dayjs';
import React from 'react';

type Props = {
  topup: any;
};

const Row = (props: Props) => {
  const { topup } = props;

  return (
    <tr>
      <td key={Math.random()}>
        <RowTitle>{renderFullName(topup.customer)}</RowTitle>
      </td>

      <td key={Math.random()}>
        <RowTitle>
          {parseFloat(topup.amount)
            .toFixed(2)
            .split('')}
        </RowTitle>
      </td>

      <td key={Math.random()}>
        <DateWrapper>{dayjs(topup.createdAt).format('ll')}</DateWrapper>
      </td>
    </tr>
  );
};

export default Row;
