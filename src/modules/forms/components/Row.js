import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Alert, confirm } from 'modules/common/utils';
import { Tip, Button, Icon, ModalTrigger } from 'modules/common/components';

const ActionButtons = styled.div`
  display: flex;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;

  * {
    padding: 0;
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const TableRow = styled.tr`
  &:hover {
    ${ActionButtons} {
      width: auto;
      position: inherit;
      justify-content: flex-end;
    }
  }
`;

const propTypes = {
  integration: PropTypes.object.isRequired,
  remove: PropTypes.func
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    confirm().then(() => {
      const { integration, remove } = this.props;

      remove(integration._id, error => {
        if (error) {
          return Alert.error(error.reason);
        }

        return Alert.success('Congrats');
      });
    });
  }

  renderEditAction(integration) {
    return (
      <Link to={`/forms/edit/${integration._id}/${integration.formId}`}>
        <Button btnStyle="link">
          <Tip text="Edit">
            <Icon icon="edit" />
          </Tip>
        </Button>
      </Link>
    );
  }

  manageAction() {
    const { __ } = this.context;

    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Install code')}>
          <Icon icon="navicon-round" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger title="Install code" trigger={trigger}>
        <div>hi</div>
      </ModalTrigger>
    );
  }

  render() {
    const { integration } = this.props;
    const form = integration.form || {};
    console.log(integration);
    return (
      <TableRow>
        <td>{integration.name}</td>
        <td>{integration.brand ? integration.brand.name : ''}</td>
        <td>{form.viewCount}</td>
        <td>{form.contactsGathered / form.viewCount} %</td>
        <td>{form.contactsGathered}</td>
        <td>{moment(form.createdDate).format('ll')}</td>
        <td width="10%">
          <ActionButtons>
            {this.manageAction(integration)}
            {this.renderEditAction(integration)}
            <Tip text="Delete">
              <Button btnStyle="link" onClick={this.remove} icon="close" />
            </Tip>
          </ActionButtons>
        </td>
      </TableRow>
    );
  }
}

Row.propTypes = propTypes;
Row.contextTypes = {
  __: PropTypes.func
};

export default Row;
