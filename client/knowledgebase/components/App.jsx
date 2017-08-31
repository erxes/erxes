import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { KnowledgeBase, Launcher } from '../containers';

const propTypes = {
  data: PropTypes.object,
};

function App(props) {
  const widgetClasses = classNames('erxes-widget-kb');
  const { loadType } = props.data.kbLoader;

  if (loadType === 'embedded') {
    return (
      <div className={widgetClasses}>
        <KnowledgeBase />
      </div>
    );
  }

  if (loadType === 'shoutbox') {
    return (
      <div className={widgetClasses}>
        <KnowledgeBase />
        <Launcher />
      </div>
    );
  }

  if (loadType === 'popup') {
    return null;
  }
}

App.propTypes = propTypes;

export default App;
