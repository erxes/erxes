import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import BrandForm from 'modules/settings/brands/components/BrandForm';
import React from 'react';
import { Link } from 'react-router-dom';
import { __ } from '../../../common/utils';
import { ActionButtons, SidebarListItem } from '../../styles';
import { IBrand } from '../types';

type Props = {
  brand: IBrand;
  remove: (id: string) => void;
  isActive: boolean;
  renderButton: (props: any) => JSX.Element;
};

class BrandRow extends React.Component<Props> {
  remove = () => {
    const { remove, brand } = this.props;
    remove(brand._id);
  };

  renderEditAction = () => {
    const { brand, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <BrandForm {...props} brand={brand} renderButton={renderButton} />
    );

    return (
      <ModalTrigger title="Edit" trigger={editTrigger} content={content} />
    );
  };

  render() {
    const { brand, isActive } = this.props;

    return (
      <SidebarListItem
        id={'ManageIntegrationUL'}
        key={brand._id}
        isActive={isActive}
      >
        <Link to={`?_id=${brand._id}`}>{brand.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text={__('Delete')} placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default BrandRow;
