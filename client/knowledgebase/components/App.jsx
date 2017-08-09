import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { KnowledgeBase } from '../containers';

function App({ displayType,
                onSwitchToArticleDisplay, onSwitchToTopicDisplay }) {
  const widgetClasses = classNames('erxes-widget');

  console.log('onSwitchToTopicDisplay: ', onSwitchToTopicDisplay);
  console.log('onSwitchToArticleDisplay: ', onSwitchToArticleDisplay);
  console.log('displayType: ', displayType);

  return (
    <div className={widgetClasses}>
      <KnowledgeBase />
    </div>
  );
}

App.propTypes = {
  displayType: PropTypes.object,
  onSwitchToTopicDisplay: PropTypes.func,
  onSwitchToArticleDisplay: PropTypes.func,
};

export default App;
