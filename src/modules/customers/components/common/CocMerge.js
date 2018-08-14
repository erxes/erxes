import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { ModalFooter } from 'modules/common/styles/main';
import { Title, Columns, Column } from 'modules/common/styles/chooser';
import { InfoTitle } from '../../styles';

const propTypes = {
  cocs: PropTypes.array.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func,
  __: PropTypes.func
};

class CocMerge extends Component {
  constructor(props) {
    super(props);

    this.state = { coc: {} };
  }

  handleChange(property) {
    const coc = { ...this.state.coc };
    const propertyName = Object.keys(property);

    coc[propertyName] = property[propertyName];

    this.setState({
      coc
    });
  }

  renderMergedData() {
    const { coc } = this.state;

    return Object.keys(coc).map(property => {
      return this.renderListElement(coc, { field: property, label: 'asd' });
    });
  }

  renderListElement(coc, info) {
    const field = info.field;

    if (coc[field]) {
      return (
        <li
          key={info.field}
          onClick={() => {
            this.handleChange({ [field]: coc[field] });
          }}
        >
          <InfoTitle>{info.label}:</InfoTitle>
          {this.renderValue(field, coc[field])}

          <Icon icon="plus" />
        </li>
      );
    }

    return null;
  }

  renderFields(constant, customer) {
    return constant.map(info => {
      return this.renderListElement(customer, info);
    });
  }

  render() {
    const { cocs } = this.props;
    const { __ } = this.context;

    return (
      <form onSubmit={this.save}>
        <Columns>
          {cocs.map((data, index) => {
            return (
              <Column key={index} className="multiple">
                <Title>{renderFullName(data)}</Title>
                <ul>{this.renderDatas(data)}</ul>
              </Column>
            );
          })}

          <Column>
            <Title>{__('Merged Info')}</Title>
            <ul>{this.renderMergedData()}</ul>
          </Column>
        </Columns>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={() => this.context.closeModal()}
            icon="cancel-1"
          >
            Cancel
          </Button>
          <Button type="submit" btnStyle="success" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

CocMerge.propTypes = propTypes;
CocMerge.contextTypes = contextTypes;

export default CocMerge;
