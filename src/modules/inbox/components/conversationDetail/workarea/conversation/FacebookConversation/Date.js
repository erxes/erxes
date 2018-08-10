import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Tip } from 'modules/common/components';

const propTypes = {
  message: PropTypes.object.isRequired
};

export default class Date extends Component {
  render() {
    const { message } = this.props;

    return (
      <Tip placement="bottom" text={moment(message.createdAt).format('lll')}>
        <span href={`https://facebook.com/statuses/`} target="_blank">
          {moment(message.createdAt).fromNow()}
        </span>
      </Tip>
    );
  }
}

Date.propTypes = propTypes;
