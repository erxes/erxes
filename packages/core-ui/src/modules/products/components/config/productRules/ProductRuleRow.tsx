import React from 'react';

import { IProductRule } from '@erxes/ui-products/src/types';

type Props = {
  rule: IProductRule;
}

export default function ProductRuleRow(props: Props) {
  const { rule } = props;

  const categoryNames = (rule.categories || []).map(c => `${c.name}, `);
  const excludeCategoryNames = (rule.excludeCategories || []).map(c => `${c.name}, `);
  const productNames = (rule.products || []).map(c => `${c.name}, `);
  const excludeProductNames = (rule.excludeProducts || []).map(c => `${c.name}, `);
  const tagNames = (rule.tags || []).map(c => `${c.name}, `);
  const excludeTagNames = (rule.excludeTags || []).map(c => `${c.name}, `);

  return (
    <tr>
      <td>{rule.name}</td>
      <td>{rule.unitPrice}</td>
      <td>{categoryNames}</td>
      <td>{excludeCategoryNames}</td>
      <td>{productNames}</td>
      <td>{excludeProductNames}</td>
      <td>{tagNames}</td>
      <td>{excludeTagNames}</td>
      <td>action</td>
    </tr>
  );
};
