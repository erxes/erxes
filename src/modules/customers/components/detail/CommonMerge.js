import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Button,
  Icon,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { ModalFooter } from 'modules/common/styles/main';
import { Title, Columns, Column } from 'modules/common/styles/chooser';
import { InfoTitle, InfoDetail, Info } from '../../styles';

const propTypes = {
  datas: PropTypes.array.isRequired,
  basicInfos: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func,
  __: PropTypes.func
};

class CommonMerge extends Component {
  constructor(props) {
    super(props);
    const data = {};
    const { basicInfos } = this.props;

    this.renderingOptions = {
      messengerData: data => this.renderMessengerData(data),
      twitterData: data => this.renderTwitterData(data),
      facebookData: data => this.renderFacebookData(data),
      visitorContactInfo: data => this.renderVisitorContactInfo(data)
    };

    Object.keys(basicInfos).forEach(info => {
      if (!this.renderingOptions[info]) data[info] = '';
    });

    this.state = {
      data
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderMergedDataInputs = this.renderMergedDataInputs.bind(this);
    this.save = this.save.bind(this);
  }

  /**
   * Rendering merged data basic infos
   * @param {Object} data - Data shaped like below
   * Customer: {
   *   firstName: 'First name of customer'
   *   lastName: 'Last name of customer'
   *   Email: 'Email of customer'
   *   Phone: 'Phone of customer'
   * }
   * Or
   * Company: {
   *   name: 'Company name'
   *   website: 'Company website'
   *   size: 'Company size'
   *   industry: 'Company industry'
   *   plan: 'Company plan'
   * }
   *
   * @return Merged data basic infos
   */

  renderMergedData() {
    const { data } = this.state;

    return Object.keys(data).map((property, index) => {
      if (!this.renderingOptions[property]) {
        return this.renderMergedDataInputs(property, index);
      }
      return this.renderProperty(
        'minus-cirlce',
        { [property]: data[property] },
        index
      );
    });
  }

  /**
   * Rendering datas' basic infos only
   * @param {Object} basicInfos - Data shaped like below
   * Customer {
   *   firstName: 'First Name'
   *   lastName: 'Last Name'
   *   email: 'Email'
   *   phone: 'Phone'
   * }
   * Or
   * Company {
   *   name: 'Name',
   *   website: 'Website',
   *   size: 'Size',
   *   industry: 'Industry',
   *   plan: 'Plan'
   * }
   */

  renderDatas(data) {
    const { basicInfos } = this.props;

    return Object.keys(data).map(property => {
      if (basicInfos[property] && data[property])
        return this.renderProperty(
          'add',
          { [property]: data[property] },
          property
        );
      return null;
    });
  }

  renderProperty(icon, property, key) {
    const { basicInfos } = this.props;
    const propertyName = Object.keys(property);

    return (
      <li
        key={key}
        onClick={() =>
          this.handleChange(icon, { [propertyName]: property[propertyName] })
        }
      >
        <InfoTitle>{basicInfos[propertyName]}:</InfoTitle>
        {this.renderingOptions[propertyName] ? (
          this.renderingOptions[propertyName](property[propertyName])
        ) : (
          <InfoDetail>{property[propertyName] || 'N/A'}</InfoDetail>
        )}
        <Icon icon={icon} />
      </li>
    );
  }

  renderMergedDataInputs(property, key) {
    const { data } = this.state;
    const { basicInfos } = this.props;

    return (
      <FormGroup key={key}>
        {basicInfos[property]}
        <FormControl
          onChange={e => this.handleInputChange(e, property)}
          value={data[property] || ''}
          required={['firstName', 'primaryEmail', 'name', 'website'].includes(
            property
          )} //required fields
        />
      </FormGroup>
    );
  }

  save(e) {
    e.preventDefault();

    const { datas } = this.props;
    const data = { ...this.state.data };
    const ids = [];

    datas.forEach(data => {
      ids.push(data._id);
    });

    for (let field in data) {
      if (data.hasOwnProperty(field) && data[field] === '') {
        delete data[field];
      }
    }

    this.props.save({
      ids,
      data,
      callback: () => {
        this.context.closeModal();
      }
    });
  }

  handleInputChange(e, property) {
    const value = e.target.value;

    this.setState({
      data: {
        ...this.state.data,
        [property]: value
      }
    });
  }

  handleChange(type, property) {
    const data = { ...this.state.data };
    const propertyName = Object.keys(property);

    if (type === 'add') {
      data[propertyName] = property[propertyName];
    } else {
      delete data[propertyName];
    }

    this.setState({
      data
    });
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

  render() {
    const { datas } = this.props;
    const { __ } = this.context;

    return (
      <form onSubmit={this.save}>
        <Columns>
          {datas.map((data, index) => {
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

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
