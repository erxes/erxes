import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { KnowledgeBase, Launcher } from '../containers';

function App(props, dispatchProps) {
  console.log('props: ', props);
  console.log('dispatchProps: ', dispatchProps);
  console.log('loadType: ', props.data.kbLoader.loadType);

  const loadType = props.data.kbLoader.loadType;
  const widgetClasses = classNames('erxes-widget-kb');

  if (loadType === 'embedded') {
    return (
      <div className={widgetClasses}>
        <KnowledgeBase />
      </div>
    );
  } else if (loadType === 'shoutbox') {
    return (
      <div className={widgetClasses}>
        <KnowledgeBase />
        <Launcher />
      </div>
    );
  } else if (loadType === 'popup') {
    return null;
  }
}

App.propTypes = {
  data: PropTypes.object,
};

export default App;
