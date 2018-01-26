import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import {
  Button,
  Icon,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { Title, Columns, Column, InfoTitle, InfoDetail } from '../../styles';

const propTypes = {
  datas: PropTypes.array.isRequired,
  basicInfos: PropTypes.object,
  save: PropTypes.func
};

const contextTypes = {
  closeModal: PropTypes.func
};

class CommonMerge extends Component {
  constructor(props) {
    super(props);
    const data = {};
    const { basicInfos } = this.props;

    this.renderingOptions = {
      messengerData: data => this.renderMessengerData(data),
      twitterData: data => this.renderTwitterData(data),
      facebookData: data => this.renderFacebookData(data)
    };

    for (let info in basicInfos) {
      if (basicInfos.hasOwnProperty(info) && !this.renderingOptions[info]) {
        data[info] = '';
      }
    }

    this.state = {
      data
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.save = this.save.bind(this);
  }

  // Rendering merged data infos
  renderMergedData() {
    const { data } = this.state;
    const { basicInfos } = this.props;
    const properties = [];

    for (let property in data) {
      if (data.hasOwnProperty(property)) {
        // Checking if data has messenger, twitter, facebook data
        if (!this.renderingOptions[property]) {
          //If data doesn't have messenger, twitter, facebook datas then pushing only input
          properties.push(
            <FormGroup key={properties.length}>
              {basicInfos[property]}
              <FormControl
                onChange={e => this.handleInputChange(e, property)}
                value={data[property] || ''}
              />
            </FormGroup>
          );
        } else {
          properties.push(
            this.renderProperty('close', { [property]: data[property] })
          );
        }
      }
    }

    return properties;
  }

  // Rendering data fields to be merged
  renderDatas(data) {
    const { basicInfos } = this.props;
    const properties = [];

    for (let property in data) {
      if (data.hasOwnProperty(property)) {
        // Rendering only basic infos of data
        if (basicInfos[property] && data[property]) {
          properties.push(
            this.renderProperty('plus', { [property]: data[property] })
          );
        }
      }
    }
    return properties;
  }

  renderProperty(icon, property) {
    const { basicInfos } = this.props;
    const propertyName = Object.keys(property);

    return (
      <li key={(propertyName, property[propertyName])}>
        <InfoTitle>{basicInfos[propertyName]}:</InfoTitle>
        {/* Checking if data has messenger, twitter, facebook datas*/}
        {this.renderingOptions[propertyName] ? (
          this.renderingOptions[propertyName](property[propertyName])
        ) : (
          <InfoDetail>{property[propertyName] || 'N/A'}</InfoDetail>
        )}
        <Icon
          icon={icon}
          onClick={() =>
            this.handleChange(icon, { [propertyName]: property[propertyName] })
          }
        />
      </li>
    );
  }

  save() {
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

    if (type === 'plus') {
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
    return (
      <div>
        <span>Last seen at:</span>
        <InfoDetail>{moment(data.lastSeenAt).format('lll')}</InfoDetail>
        <span>Session count:</span> <InfoDetail>{data.sessionCount}</InfoDetail>
      </div>
    );
  }

  renderTwitterData(data) {
    return (
      <div>
        <span>Name: </span>
        <InfoDetail>{data.name}</InfoDetail>
        <span>Screen name: </span>
        <InfoDetail>{data.screenName}</InfoDetail>
      </div>
    );
  }

  render() {
    const { datas } = this.props;

    return (
      <div>
        <Columns>
          {datas.map(data => {
            return (
              <Column key={data._id}>
                <Title>{renderFullName(data)}</Title>
                <ul>{this.renderDatas(data)}</ul>
              </Column>
            );
          })}
          <Column>
            <Title>Infos</Title>
            <ul>{this.renderMergedData()}</ul>
          </Column>
        </Columns>
        <Modal.Footer>
          <Button
            btnStyle="simple"
            onClick={() => this.context.closeModal()}
            icon="close"
          >
            Cancel
          </Button>
          <Button onClick={this.save} btnStyle="success" icon="checkmark">
            Save
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
