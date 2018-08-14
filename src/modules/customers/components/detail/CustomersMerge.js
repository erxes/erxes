import React, { Fragment } from 'react';
import moment from 'moment';
import { InfoTitle, InfoDetail, Info } from '../../styles';
import { CUSTOMER_BASIC_INFO, CUSTOMER_DATAS } from '../../constants';
import CocMerge from '../common/CocMerge';

class CustomersMerge extends CocMerge {
  renderDatas(customer) {
    return (
      <Fragment>
        {this.renderFields(CUSTOMER_BASIC_INFO.ALL, customer)}
        {this.renderFields(CUSTOMER_DATAS.ALL, customer)}
      </Fragment>
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
    const { __ } = this.context;

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
    const { __ } = this.context;
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
    const { __ } = this.context;
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
}

export default CustomersMerge;
