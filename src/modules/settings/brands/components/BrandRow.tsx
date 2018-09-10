import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ActionButtons, SidebarListItem } from '../../styles';
import { BrandForm } from '../containers';
import { IBrand } from '../types';

type Props = {
  brand: IBrand,
  remove: (id: string) => void,
  save: () => void,
  isActive: boolean
}

class BrandRow extends Component<Props> {
  static contextTypes =  {
    __: PropTypes.func
  }

  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
    this.renderEditForm = this.renderEditForm.bind(this);
  }

  remove() {
    const { remove, brand } = this.props;
    remove(brand._id);
  }

  renderEditAction() {
    const { __ } = this.context;
    const { brand, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ brand, save })}
      </ModalTrigger>
    );
  }

  renderEditForm(props) {
    return <BrandForm {...props} />;
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
