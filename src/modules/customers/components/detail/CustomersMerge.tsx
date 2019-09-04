import dayjs from 'dayjs';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __, renderFullName } from 'modules/common/utils';
import React from 'react';
import { IUser } from '../../../auth/types';
import {
  CUSTOMER_BASIC_INFO,
  CUSTOMER_DATAS,
  CUSTOMER_LINKS
} from '../../constants';
import { Info, InfoAvatar, InfoDetail, InfoTitle } from '../../styles';
import {
  ICustomer,
  ICustomerDoc,
  ICustomerLinks,
  IMessengerData,
  IVisitorContact
} from '../../types';

type Props = {
  objects: ICustomer[];
  save: (
    doc: {
      ids: string[];
      data: ICustomerDoc;
      callback: () => void;
    }
  ) => void;
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

    if (type === 'add') {
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

  renderTitle(key: string) {
    const title = CUSTOMER_BASIC_INFO[key] || CUSTOMER_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'messengerData':
        return this.renderMessengerData(value);
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

  renderMessengerData(data: IMessengerData) {
    return (
      <Info>
        <InfoTitle>{__('Last seen at')}:</InfoTitle>
        <InfoDetail>{dayjs(data.lastSeenAt).format('lll')}</InfoDetail>
        <InfoTitle>{__('Session count')}:</InfoTitle>
        <InfoDetail>{data.sessionCount}</InfoDetail>
      </Info>
    );
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
    const { objects, closeModal } = this.props;
    const [customer1, customer2] = objects;

    return (
      <form onSubmit={this.save}>
        <Columns>
          <Column className="multiple">
            {this.renderCustomer(customer1, 'add')}
          </Column>

          <Column className="multiple">
            {this.renderCustomer(customer2, 'add')}
          </Column>

          <Column>{this.renderCustomer(selectedValues, 'minus-circle')}</Column>
        </Columns>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
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

export default CustomersMerge;
