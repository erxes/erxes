import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { KnowledgeBase, Launcher, Notifier } from '../containers';

function App({ isMessengerVisible, uiOptions }) {
  const widgetClasses = classNames('erxes-widget', { opened: isMessengerVisible });

  return (
    <div className={widgetClasses}>
      { isMessengerVisible ? null : <Notifier /> }

      <KnowledgeBase />
      <Launcher uiOptions={uiOptions} />
    </div>
  );
}

App.propTypes = {
  isMessengerVisible: PropTypes.bool.isRequired,
  uiOptions: PropTypes.object,
};

App.defaultProps = {
  uiOptions: null,
};

export default App;
