import React from 'react';

import { IProductRule } from '@erxes/ui-products/src/types';

type Props = {
  rule: IProductRule;
}

export default function ProductRuleRow(props: Props) {
  const { rule } = props;

  return (
    <tr>
      <td>{rule.name}</td>
      <td>action</td>
    </tr>
  );
};
