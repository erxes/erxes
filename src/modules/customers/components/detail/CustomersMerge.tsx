import { Button, Icon } from 'modules/common/components';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __, renderFullName } from 'modules/common/utils';
import * as moment from 'moment';
import * as React from 'react';
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
  IFacebookData,
  IMessengerData,
  ITwitterData,
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

    this.renderCustomer = this.renderCustomer.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  save(e: React.FormEvent) {
    e.preventDefault();
    const { objects } = this.props;
    const selectedValues = { ...this.state.selectedValues };
    const owner = selectedValues.owner;

    if (owner) {
      selectedValues.ownerId = owner._id;

      delete selectedValues.owner;
    }

    this.props.save({
      callback: () => {
        this.props.closeModal();
      },
      data: { ...selectedValues },
      ids: objects.map(customer => customer._id)
    });
  }

  handleChange(type: string, key: string, value: string | ICustomerLinks) {
    const selectedValues = { ...this.state.selectedValues };

    if (type === 'add') {
      selectedValues[key] = value;
    } else {
      delete selectedValues[key];
    }

    this.setState({ selectedValues });
  }

  renderCustomer(customer: ICustomerDoc, icon: string) {
    const properties = CUSTOMER_BASIC_INFO.ALL.concat(CUSTOMER_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>{renderFullName(customer)}</Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!customer[key]) return null;

            if (info.field === 'links')
              return this.renderLinks(customer[key], icon);

            return this.renderCustomerProperties(key, customer[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  }

  renderCustomerProperties(key: string, value: string, icon: string) {
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

  renderTitle(key: string) {
    const title = CUSTOMER_BASIC_INFO[key] || CUSTOMER_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field: string, value: any) {
    switch (field) {
      case 'facebookData':
        return this.renderFacebookData(value);
      case 'twitterData':
        return this.renderTwitterData(value);
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

  renderFacebookData(data: IFacebookData) {
    return (
      <div>
        <InfoDetail>
          <a
            target="_blank"
            href={`http://facebook.com/${data.id}`}
            rel="noopener noreferrer"
          >
            [view]
          </a>
        </InfoDetail>
      </div>
    );
  }

  renderMessengerData(data: IMessengerData) {
    return (
      <Info>
        <InfoTitle>{__('Last seen at')}:</InfoTitle>
        <InfoDetail>{moment(data.lastSeenAt).format('lll')}</InfoDetail>
        <InfoTitle>{__('Session count')}:</InfoTitle>
        <InfoDetail>{data.sessionCount}</InfoDetail>
      </Info>
    );
  }

  renderTwitterData(data: ITwitterData) {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{data.name}</InfoDetail>
        <InfoTitle>{__('Screen name')}: </InfoTitle>
        <InfoDetail>{data.screen_name}</InfoDetail>
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

  renderLinks(data: ICustomerLinks, icon: string) {
    const { selectedValues } = this.state;

    return CUSTOMER_LINKS.ALL.map(info => {
      const field = info.field;
      const value = data[field];

      if (!data[field]) return null;

      return (
        <li
          key={field}
          onClick={() => {
            const links = { ...selectedValues.links, [field]: value };

            return this.handleChange(icon, `links`, links);
          }}
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
    const { objects } = this.props;
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
          <Button
            btnStyle="simple"
            onClick={() => this.props.closeModal()}
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

export default CustomersMerge;
