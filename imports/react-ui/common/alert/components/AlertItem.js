import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from 'meteor/erxes-notifier';

const propTypes = {
  alert: PropTypes.shape({
    _id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
  }),
};

class AlertItem extends Component {
  componentDidMount() {
    setInterval(() => {
      Alert.Collections.Alerts.remove(this.props.alert._id);
    }, 5000);
  }

  render() {
    const { type } = this.props.alert;
    const classes = `alerts-item ${type}`;
    const iconClasses = {
      success: 'ion-checkmark-circled',
      error: 'ion-close-circled',
      info: 'ion-information-circled',
      warning: 'ion-alert-circled',
    };

    return (
      <div className={classes}>
        <i className={`icon ${iconClasses[type]}`} />
        {this.props.alert.message}
      </div>
    );
  }
}

AlertItem.propTypes = propTypes;

export default AlertItem;
