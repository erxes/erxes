import React from 'react';

import { IProductRule } from '@erxes/ui-products/src/types';
import { ActionButtons, Button, Tip } from '@erxes/ui/src/components';

type Props = {
  rule: IProductRule;
  removeRule: (_id: string) => void;
}

export default function ProductRuleRow(props: Props) {
  const { rule, removeRule } = props;

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
      <td key="actions">
        <ActionButtons>
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={() => removeRule(rule._id)} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </td>
    </tr>
  );
};
