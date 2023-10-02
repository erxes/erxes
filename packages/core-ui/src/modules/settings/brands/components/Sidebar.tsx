import ActionButtons from 'modules/common/components/ActionButtons';
import BrandForm from '@erxes/ui/src/brands/components/BrandForm';
import Button from 'modules/common/components/Button';
import { Description } from '@erxes/ui-settings/src/styles';
import { IBrand } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import Tip from 'modules/common/components/Tip';
import { __ } from '../../../common/utils';

type Props = {
  brands: IBrand[];
  remove: (brandId: string) => void;
  currentBrandId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class Sidebar extends React.Component<Props, {}> {
  renderEditAction = brand => {
    const { renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <BrandForm
        {...props}
        brand={brand}
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

  remove = brand => {
    const { remove } = this.props;

    remove(brand._id);
  };

  render() {
    const { brands } = this.props;

    return brands.map(brand => (
      <tr key={brand._id}>
        <td>{brand.name}</td>
        <td>
          <Description noMargin={true} halfWidth={true}>
            {brand.description || '-'}
          </Description>
        </td>
        <td>
          <ActionButtons>
            <ActionButtons>
              {this.renderEditAction(brand)}
              <Tip text={__('Delete')} placement="bottom">
                <Button
                  btnStyle="link"
                  onClick={() => this.remove(brand)}
                  icon="cancel-1"
                />
              </Tip>
            </ActionButtons>
          </ActionButtons>
        </td>
      </tr>
    ));
  }
}

export default Sidebar;
