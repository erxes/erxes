import React from 'react';

import { IProductRule } from '@erxes/ui-products/src/types';
import { ActionButtons, Button, Icon, ModalTrigger, Tip } from '@erxes/ui/src/components';
import ProductRuleForm from './ProductRuleForm';
import { __ } from '@erxes/ui/src/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  rule: IProductRule;
  removeRule: (_id: string) => void;
  renderButton: (props: IButtonMutateProps) => void;
}

export default function ProductRuleRow(props: Props) {
  const { rule, removeRule, renderButton } = props;

  const categoryNames = (rule.categories || []).map(c => `${c.name}, `);
  const excludeCategoryNames = (rule.excludeCategories || []).map(c => `${c.name}, `);
  const productNames = (rule.products || []).map(c => `${c.name}, `);
  const excludeProductNames = (rule.excludeProducts || []).map(c => `${c.name}, `);
  const tagNames = (rule.tags || []).map(c => `${c.name}, `);
  const excludeTagNames = (rule.excludeTags || []).map(c => `${c.name}, `);

  const renderEditAction = () => {
    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__("Edit")} placement="bottom">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => (
      <ProductRuleForm
        {...props}
        rule={rule}
        extended={true}
        renderButton={renderButton}
      />
    );

    return (
      <ModalTrigger
        size="lg"
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  };

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
          {renderEditAction()}
          <Button btnStyle="link" onClick={() => removeRule(rule._id)}>
            <Tip text="Delete" placement="bottom">
              <Icon icon='cancel-1' />
            </Tip>
          </Button>
        </ActionButtons>
      </td>
    </tr>
  );
};
