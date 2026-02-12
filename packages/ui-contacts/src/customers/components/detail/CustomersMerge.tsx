import Button from '@erxes/ui/src/components/Button';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import Icon from '@erxes/ui/src/components/Icon';
import { Column, Columns, Title } from '@erxes/ui/src/styles/chooser';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, renderFullName } from '@erxes/ui/src/utils';
import React from 'react';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  CUSTOMER_BASIC_INFO,
  CUSTOMER_DATAS,
  CUSTOMER_LINKS
} from '../../constants';
import { InfoAvatar, InfoDetail } from '../../styles';
import { Info, InfoTitle } from '@erxes/ui/src/styles/main';
import {
  ICustomer,
  ICustomerDoc,
  ICustomerLinks,
  IVisitorContact
} from '../../types';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';

type Props = {
  objects: ICustomer[];
  mergeCustomerLoading: boolean;
  fieldsGroups: IFieldGroup[];
  save: (doc: {
    ids: string[];
    data: ICustomerDoc;
    callback: () => void;
  }) => void;
  closeModal: () => void;
};

type State = {
  selectedValues: any;
};

class CustomersMerge extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };
  }

  save = (e: React.FormEvent) => {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };
    const owner = selectedValues.owner;

    if (owner) {
      selectedValues.ownerId = owner._id;

      delete selectedValues.owner;
    }

    this.props.save({
      ids: objects.map(customer => customer._id),
      data: { ...selectedValues },
      callback: () => {
        this.props.closeModal();
      }
    });
  };

  handleChange = (
    type: string,
    key: string,
    value: string | ICustomerLinks
  ) => {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'plus-1') {
      selectedValues[key] = value;

      if (key === 'links') {
        const links = Object.assign(
          { ...this.state.selectedValues.links },
          value
        );
        selectedValues[key] = links;
      }
    } else {
      delete selectedValues[key];
    }

    this.setState({ selectedValues });
  };

  handleCustomFieldsChange = (
    type: string,
    value: { field: string, value: any }
  ) => {
    const selectedValues = { ...this.state.selectedValues };

    const current: Array<{field: string, value: any}> = selectedValues.customFieldsData || [];

    if (type === 'plus-1') {
     const index = current.findIndex(item => item.field === value.field);

      if (index > -1) {
         const updated = [...current];
         
         updated[index] = value;
         
         selectedValues.customFieldsData = updated;
      } else {
        selectedValues.customFieldsData = [...current, value];
      }
    } else {
      selectedValues.customFieldsData = current.filter(
        item => item.field !== value.field
      );
    }

    this.setState({ selectedValues });
  };

  renderCustomer = (customer: ICustomerDoc, icon: string) => {
    const properties = CUSTOMER_BASIC_INFO.ALL.concat(CUSTOMER_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>{renderFullName(customer)}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!customer[key]) {
              return null;
            }

            if (info.field === 'links') {
              return this.renderLinks(customer[key], icon);
            }

            return this.renderCustomerProperties(key, customer[key], icon);
          })}

          {this.renderCustomerCustomFields(customer, icon)}
        </ul>
      </React.Fragment>
    );
  };

  renderCustomerProperties(key: string, value: string, icon: string) {
    return (
      <li key={key} onClick={this.handleChange.bind(this, icon, key, value)}>
        {this.renderTitle(key)}
        {this.renderValue(key, value)}

        <Icon icon={icon} />
      </li>
    );
  }

  renderCustomerCustomFields(customer: ICustomerDoc, icon: string) {
    const { fieldsGroups } = this.props;

    const { customFieldsData } = customer || {};

    return (
      <>
        {(fieldsGroups || []).filter(group => group.isVisible && !group.parentId).map(group => {
          const fields = group.fields?.filter(field => field.isVisible && !field.isDisabled) || [];
          
          return fields.map(field => {
            const value = (customFieldsData || []).find((customField: { field: string, value: any })  => customField.field === field._id)?.value;

            if (!value) {
              return null;
            }
            
            return (
              <li key={field._id} onClick={this.handleCustomFieldsChange.bind(this, icon, { field: field._id, value })}>
                {this.renderTitle(field?.text || 'Unknown field')}
                {this.renderValue(field._id, value)}

                <Icon icon={icon} />
              </li>
            )
          })
        })}
      </>
    );
  }

  renderTitle(key: string) {
    const title = CUSTOMER_BASIC_INFO[key] || CUSTOMER_DATAS[key] || key;

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'visitorContactInfo':
        return this.renderVisitorContactInfo(value);
      case 'owner':
        return this.renderOwner(value);
      case 'avatar':
        return <InfoAvatar src={value} alt="avatar" />;

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderVisitorContactInfo(data: IVisitorContact) {
    return (
      <Info>
        <InfoTitle>{__('E-mail')}: </InfoTitle>
        <InfoDetail>{data.email}</InfoDetail>
        <InfoTitle>{__('Phone')}: </InfoTitle>
        <InfoDetail>{data.phone}</InfoDetail>
      </Info>
    );
  }

  renderOwner(data: IUser) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.details && data.details.fullName}</InfoDetail>
      </Info>
    );
  }

  renderLinks = (data: ICustomerLinks, icon: string) => {
    return CUSTOMER_LINKS.ALL.map(info => {
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
  };

  render() {
    const { selectedValues } = this.state;
    const { objects, closeModal, mergeCustomerLoading } = this.props;
    const [customer1, customer2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple" width="33%">
            {this.renderCustomer(customer1, 'plus-1')}
          </Column>

          <Column className="multiple" width="33%">
            {this.renderCustomer(customer2, 'plus-1')}
          </Column>

          <Column width="33%">
            {this.renderCustomer(selectedValues, 'times')}
          </Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>
          <Button
            type="submit"
            btnStyle="success"
            icon={mergeCustomerLoading ? undefined : 'check-circle'}
            disabled={mergeCustomerLoading}
            onClick={this.save}
          >
            {mergeCustomerLoading && <SmallLoader />}
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default CustomersMerge;
