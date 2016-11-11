import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AlertItem from './AlertItem.jsx';


const propTypes = {
  alerts: React.PropTypes.array.isRequired,
};

function AlertsWrapper({ alerts }) {
  return (
    <div className="alerts-container">
      <ReactCSSTransitionGroup
        transitionName="alerts-item"
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
        transitionAppearTimeout={500}
      >
        {
          alerts.map(alert =>
            <AlertItem alert={alert} key={alert._id} />
          )
        }
      </ReactCSSTransitionGroup>
    </div>
  );
}

AlertsWrapper.propTypes = propTypes;

export default AlertsWrapper;
