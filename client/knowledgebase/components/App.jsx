import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { KnowledgeBase } from '../containers';

const propTypes = {
  data: PropTypes.object,
};

function App(props) {
  const widgetClasses = classNames('erxes-widget-kb');
  const { loadType } = props.data.kbLoader;

  if (loadType === 'shoutbox') {
    return (
      <div className={widgetClasses}>
        <KnowledgeBase />
      </div>
    );
  }

  if (loadType === 'popup') {
    return null;
  }

  return (
    <div className={widgetClasses}>
      <KnowledgeBase />
    </div>
  );
}

App.propTypes = propTypes;

export default App;
