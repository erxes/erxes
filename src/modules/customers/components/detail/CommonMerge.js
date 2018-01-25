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

  renderDataFields() {
    const { data } = this.state;
    const { basicInfos } = this.props;
    const fields = [];
    let field = null;

    for (let infos in data) {
      if (data.hasOwnProperty(infos)) {
        if (!this.renderingOptions[infos]) {
          field = (
            <FormGroup key={fields.length}>
              {basicInfos[infos]}
              <FormControl
                onChange={e => this.handleInputChange(e, infos)}
                value={data[infos] || ''}
              />
            </FormGroup>
          );
        } else {
          field = this.renderInfo('close', { [infos]: data[infos] });
        }
        fields.push(field);
      }
    }

    return fields;
  }

  renderDatas(data) {
    const { basicInfos } = this.props;
    const fields = [];

    for (let infos in data) {
      if (data.hasOwnProperty(infos)) {
        if (basicInfos[infos] && data[infos]) {
          fields.push(this.renderInfo('plus', { [infos]: data[infos] }));
        }
      }
    }
    return fields;
  }

  renderInfo(icon, info) {
    const { basicInfos } = this.props;
    const key = Object.keys(info);

    return (
      <li key={(key, info[key])}>
        <InfoTitle>{basicInfos[key]}:</InfoTitle>
        {this.renderingOptions[key] ? (
          this.renderingOptions[key](info[key])
        ) : (
          <InfoDetail>{info[key] || 'N/A'}</InfoDetail>
        )}
        <Icon
          icon={icon}
          onClick={() => this.handleChange(icon, { [key]: info[key] })}
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

  handleInputChange(e, info) {
    const value = e.target.value;

    this.setState({
      data: {
        ...this.state.data,
        [info]: value
      }
    });
  }

  handleChange(type, obj) {
    const data = { ...this.state.data };
    const key = Object.keys(obj);

    if (type === 'plus') {
      data[key] = obj[key];
    } else {
      delete data[key];
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
            <ul>{this.renderDataFields()}</ul>
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
