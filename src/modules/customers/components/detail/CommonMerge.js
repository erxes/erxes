import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import moment from 'moment';
import { Button, Icon } from 'modules/common/components';
import { renderFullName } from 'modules/common/utils';
import { Footer, Title, Columns, Column } from '../../styles';

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

    this.state = {
      data: {}
    };

    this.renderingOptions = {
      messengerData: data => this.renderMessengerData(data),
      twitterData: data => this.renderTwitterData(data),
      facebookData: data => this.renderFacebookData(data)
    };
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  renderDataFields() {
    const { data } = this.state;
    const fields = [];

    for (let infos in data) {
      if (data.hasOwnProperty(infos)) {
        fields.push(this.renderInfo({ [infos]: data[infos] }, 'close'));
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
          fields.push(this.renderInfo({ [infos]: data[infos] }, 'plus'));
        }
      }
    }
    return fields;
  }

  renderInfo(info, icon) {
    const { basicInfos } = this.props;
    const key = Object.keys(info);
    const value = Object.values(info);

    return (
      <li
        key={(key, value)}
        onClick={() => this.handleChange(icon, { [key]: [value] })}
      >
        {this.renderingOptions[key]
          ? this.renderingOptions[key](value)
          : basicInfos[key].text + ': ' + value || 'N/A'}
        <Icon icon={icon} />
      </li>
    );
  }

  save() {
    const { datas } = this.props;
    const { data } = this.state;
    const ids = [];

    datas.forEach(data => {
      ids.push(data._id);
    });

    this.props.save({
      ids,
      data,
      callback: () => {
        this.context.closeModal();
      }
    });
  }

  handleChange(type, obj) {
    const data = { ...this.state.data };
    const value = Object.values(obj);
    const key = Object.keys(obj);

    if (type === 'plus') {
      data[key] = value;
    } else {
      delete data[key];
    }

    this.setState({
      data
    });
  }

  renderFacebookData(data) {
    return (
      <ul>
        <li>Facebook Profile: </li>
        <li>
          <a
            target="_blank"
            href={`http://facebook.com/${data.id}`}
            rel="noopener noreferrer"
          >
            [view]
          </a>
        </li>
      </ul>
    );
  }

  renderMessengerData(data) {
    return (
      <ul>
        <li>Messenger Data</li>
        <li>
          <div>Last seen at:</div>{' '}
          <div>{moment(data.lastSeenAt).format('lll')}</div>
        </li>
        <li>
          <div>Session count:</div> <div>{data.sessionCount}</div>
        </li>
      </ul>
    );
  }

  renderTwitterData(data) {
    return (
      <ul>
        <li>Twitter Data: </li>
        <li>
          <div>Name: </div>
          <div>{data.name}</div>
        </li>
        <li>
          <div>Screen name: </div>
          <div>{data.screenName}</div>
        </li>
      </ul>
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
          <Footer>
            <div>
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
            </div>
          </Footer>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
