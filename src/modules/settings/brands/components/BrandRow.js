import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BrandForm } from '../containers';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import { SidebarListItem, ActionButtons } from '../../styles';

const propTypes = {
  brand: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};

class BrandRow extends Component {
  constructor(props) {
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
          <Icon erxes icon="edit" />
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
        <Link to={`?id=${brand._id}`}>{brand.name}</Link>
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

BrandRow.propTypes = propTypes;
BrandRow.contextTypes = {
  __: PropTypes.func
};

export default BrandRow;
