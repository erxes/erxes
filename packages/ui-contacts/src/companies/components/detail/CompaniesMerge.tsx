import {
  COMPANY_DATAS,
  COMPANY_INFO,
  COMPANY_LINKS
} from '@erxes/ui-contacts/src/companies/constants';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import {
  ICompany,
  ICompanyLinks
} from '@erxes/ui-contacts/src/companies/types';
import { Info, InfoTitle, ModalFooter } from '@erxes/ui/src/styles/main';
import { InfoAvatar, InfoDetail } from '../../../customers/styles';

import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';

type Props = {
  objects: ICompany[];
  save: (doc: { ids: string[]; data: any; callback: () => void }) => void;
  closeModal: () => void;
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
  }

  save = e => {
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
        this.props.closeModal();
      }
    });
  };

  handleChange = (type, key, value) => {
    this.setState(prevState => {
      const selectedValues = { ...prevState.selectedValues };
    
      if (type === 'plus-1') {
        selectedValues[key] = value;
  
        if (key === 'links') {
          const links = Object.assign(
            { ...prevState.selectedValues.links },
            value
          );
          selectedValues[key] = links;
        }
      } else {
        delete selectedValues[key];
      }
  
      return { selectedValues };
    });
  };

  renderCompany = (company, icon) => {
    const properties = COMPANY_INFO.ALL.concat(COMPANY_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>{company.primaryName || company.website}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!company[key]) {
              return null;
            }

            if (info.field === 'links') {
              return this.renderLinks(company[key], icon);
            }

            return this.renderCompanyProperties(key, company[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  };

  renderCompanyProperties(key, value, icon) {
    return (
      <li key={key} onClick={this.handleChange.bind(this, icon, key, value)}>
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

  renderValue = (field, value) => {
    switch (field) {
      case 'owner':
        return this.renderOwner(value);
      case 'parentCompany':
        return this.renderParentCompany(value);
      case 'avatar':
        return <InfoAvatar src={value} alt="avatar" />;

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  };

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

  renderLinks(data: ICompanyLinks, icon: string) {
    return COMPANY_LINKS.ALL.map(info => {
      const field = info.field;
      const value = data[field];

      if (!data[field]) {
        return null;
      }

      return (
        <li
          key={field}
          onClick={this.handleChange.bind(this, icon, `links`, {
            [field]: value
          })}
        >
          <InfoTitle>{info.label}:</InfoTitle>
          <InfoDetail>{value}</InfoDetail>
          <Icon icon={icon} />
        </li>
      );
    });
  }

  render() {
    const { selectedValues } = this.state;
    const { objects, closeModal } = this.props;
    const [company1, company2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple" width="33%">
            {this.renderCompany(company1, 'plus-1')}
          </Column>

          <Column className="multiple" width="33%">
            {this.renderCompany(company2, 'plus-1')}
          </Column>

          <Column width="33%">
            {this.renderCompany(selectedValues, 'times')}
          </Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>
          <Button type="submit" btnStyle="success" icon="check-circle">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default CompaniesMerge;
