import { Button, Icon } from 'modules/common/components';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { COMPANY_DATAS, COMPANY_INFO } from 'modules/companies/constants';
import { Info, InfoDetail, InfoTitle } from 'modules/customers/styles';
import * as React from 'react';

type Props = {
  objects: any[],
  save: (doc: {
    ids: string[],
    data: any,
    callback: () => void
  }) => void,
  closeModal: () => void,
};

type State = {
  selectedValues: any;
};

class CompaniesMerge extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };

    this.renderCompany = this.renderCompany.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };
    const owner = selectedValues.owner;
    const parentCompany = selectedValues.parentCompany;

    if (owner) {
      selectedValues.ownerId = owner._id;

      delete selectedValues.owner;
    }

    if (parentCompany) {
      selectedValues.parentCompanyId = parentCompany._id;

      delete selectedValues.parentCompany;
    }

    this.props.save({
      ids: objects.map(company => company._id),
      data: { ...selectedValues },
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
        <Title>{company.primaryName || company.website}</Title>
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
        <InfoDetail>{data.primaryName}</InfoDetail>
      </Info>
    );
  }

  render() {
    const { selectedValues } = this.state;
    const { objects, closeModal } = this.props;
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
            onClick={() => closeModal()}
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

export default CompaniesMerge;
