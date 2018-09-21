import { Button, Icon } from 'modules/common/components';
import { Column, Columns, Title } from 'modules/common/styles/chooser';
import { ModalFooter } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import moment from 'moment';
import * as React from 'react';
import { CUSTOMER_BASIC_INFO, CUSTOMER_DATAS } from '../../constants';
import { Info, InfoDetail, InfoTitle } from '../../styles';

type Props = {
  objects: any[];
  save: (doc: {
    ids: string[];
    data: any;
    callback: () => void;
  }) => void;
  closeModal: () => void;
};

type State = {
  selectedValues: any;
}

class CustomersMerge extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedValues: {}
    };

    this.renderCustomer = this.renderCustomer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  save(e) {
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

  renderCustomer(customer, icon) {
    const properties = CUSTOMER_BASIC_INFO.ALL.concat(CUSTOMER_DATAS.ALL);

    return (
      <React.Fragment>
        <Title>
          {customer.firstName ||
            customer.lastName ||
            customer.primaryEmail ||
            customer.primaryPhone ||
            'N/A'}
        </Title>
        <ul>
          {properties.map(info => {
            const key = info.field;

            if (!customer[key]) return null;

            return this.renderCustomerProperties(key, customer[key], icon);
          })}
        </ul>
      </React.Fragment>
    );
  }

  renderCustomerProperties(key, value, icon) {
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
    const title = CUSTOMER_BASIC_INFO[key] || CUSTOMER_DATAS[key];

    return <InfoTitle>{title}:</InfoTitle>;
  }

  renderValue(field, value) {
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

      default:
        return <InfoDetail>{value}</InfoDetail>;
    }
  }

  renderFacebookData(data) {
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

  renderMessengerData(data) {
    return (
      <Info>
        <InfoTitle>{__('Last seen at')}:</InfoTitle>
        <InfoDetail>{moment(data.lastSeenAt).format('lll')}</InfoDetail>
        <InfoTitle>{__('Session count')}:</InfoTitle>
        <InfoDetail>{data.sessionCount}</InfoDetail>
      </Info>
    );
  }

  renderTwitterData(data) {
    return (
      <Info>
        <InfoTitle>{__('Name')}: </InfoTitle>
        <InfoDetail>{data.name}</InfoDetail>
        <InfoTitle>{__('Screen name')}: </InfoTitle>
        <InfoDetail>{data.screenName}</InfoDetail>
      </Info>
    );
  }

  renderVisitorContactInfo(data) {
    return (
      <Info>
        <InfoTitle>{__('E-mail')}: </InfoTitle>
        <InfoDetail>{data.email}</InfoDetail>
        <InfoTitle>{__('Phone')}: </InfoTitle>
        <InfoDetail>{data.phone}</InfoDetail>
      </Info>
    );
  }

  renderOwner(data) {
    return (
      <Info>
        <InfoTitle>Name: </InfoTitle>
        <InfoDetail>{data.details.fullName}</InfoDetail>
      </Info>
    );
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
