import React from 'react';
import PropTypes from 'prop-types';
import { InfoTitle, InfoDetail, Info } from 'modules/customers/styles';
import { COMPANY_INFO, COMPANY_DATAS } from '../../constants';
import { Title, Columns, Column } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { Icon, Button } from 'modules/common/components';

const propTypes = {
  objects: PropTypes.array,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func,
  __: PropTypes.func
};

class CustomersMerge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };

    this.renderCompany = this.renderCompany.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  save(e) {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };
    const owner = selectedValues.owner;
    const parentCompany = selectedValues.parentCompany;

    if (owner) {
      selectedValues.ownerId = owner._id;
    }

    if (parentCompany) {
      selectedValues.parentCompanyId = parentCompany._id;
    }

    this.props.save({
      ids: objects.map(company => company._id),
      data: selectedValues,
      callback: () => {
        this.context.closeModal();
      }
    });
  }

  handleChange(type, key, value) {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'add') {
      selectedValues[key] = value;
    } else {
      delete selectedValues[key];
    }

    this.setState({ selectedValues });
  }

  renderCompany(company, icon) {
    const properties = COMPANY_INFO.ALL.concat(COMPANY_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>{company.name || company.website}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!company[key]) return null;

            return this.renderCompanyProperties(key, company[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  }

  renderCompanyProperties(key, value, icon) {
    return (
      <li
        key={key}
        onClick={() => {
          this.handleChange(icon, key, value);
        }}
      >
        {this.renderTitle(key)}
        {this.renderValue(key, value)}

        <Icon icon={icon} />
      </li>
    );
  }

  renderTitle(key) {
    const title = COMPANY_INFO[key] || COMPANY_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field, value) {
    switch (field) {
      case 'owner':
        return this.renderOwner(value);
      case 'parentCompany':
        return this.renderParentCompany(value);

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderOwner(data) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.details.fullName}</InfoDetail>
      </Info>
    );
  }

  renderParentCompany(data) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.name}</InfoDetail>
      </Info>
    );
  }

  render() {
    const { selectedValues } = this.state;
    const { objects } = this.props;
    const [company1, company2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple">
            {this.renderCompany(company1, 'add')}
          </Column>

          <Column className="multiple">
            {this.renderCompany(company2, 'add')}
          </Column>

          <Column>{this.renderCompany(selectedValues, 'minus-circle')}</Column>
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

CustomersMerge.propTypes = propTypes;
CustomersMerge.contextTypes = contextTypes;

export default CustomersMerge;
