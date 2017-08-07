import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { KnowledgeBase } from '../containers';

function App({ uiOptions }) {
  const widgetClasses = classNames('erxes-widget');

  console.log('uiOptions: ', uiOptions);
  return (
    <div className={widgetClasses}>
      <KnowledgeBase />
    </div>
  );
}

App.propTypes = {
  uiOptions: PropTypes.object,
};

export default App;
