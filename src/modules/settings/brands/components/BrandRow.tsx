import BrandForm from 'modules/settings/brands/components/BrandForm';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon, ModalTrigger, Tip } from '../../../common/components';
import { __ } from '../../../common/utils';
import { ActionButtons, SidebarListItem } from '../../styles';
import { IBrand } from '../types';

type Props = {
  brand: IBrand,
  remove: (id: string) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, brand: IBrand) => void,
  isActive: boolean
}

class BrandRow extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    const { remove, brand } = this.props;
    remove(brand._id);
  }

  renderEditAction() {
    const { brand, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit').toString()}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        title="Edit"
        trigger={editTrigger}
        content={(props) => <BrandForm {...props} brand={brand} save={save} />}
      />
    );
  }

  render() {
    const { brand, isActive } = this.props;
    
    return (
      <SidebarListItem key={brand._id} isActive={isActive}>
        <Link to={`?_id=${brand._id}`}>{brand.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

export default BrandRow;
