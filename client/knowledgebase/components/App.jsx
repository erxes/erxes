import React from 'react';
import classNames from 'classnames';
import { KnowledgeBase } from '../containers';

function App() {
  const widgetClasses = classNames('erxes-widget-kb');

  return (
    <div className={widgetClasses}>
      <KnowledgeBase />
    </div>
  );
}

App.propTypes = {};

export default App;
