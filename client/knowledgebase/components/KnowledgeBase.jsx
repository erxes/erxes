import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Categories } from '../containers';

function KnowledgeBase({ uiOptions }) {
  const widgetClasses = classNames('erxes-widget');

  console.log('uiOptions: ', uiOptions);
  return (
    <div className={widgetClasses}>
      <Categories />
    </div>
  );
}

KnowledgeBase.propTypes = {
  uiOptions: PropTypes.object,
};

export default KnowledgeBase;
