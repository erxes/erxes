import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Categories } from '../containers';

function KnowledgeBase({ uiOptions }) {
  const widgetClasses = classNames('erxes-widget');

  console.log('uiOptions: ', uiOptions);

  const onChangeHandler = function (event) {
    console.log('onChangeHandler.value:', event.target.value);
    //   connection.data.searchString = e.target.value
    //   let { data } = this.props;
    //   console.log('connection.data: ', connection.data);
    //   data.refetch({
    //     topicId: connection.data.topicId,
    //     searchString: connection.data.searchString,
    //   });
  }
  return (
    <div className={widgetClasses}>
      <div className="erxes-form">
        <div className="erxes-topbar thiner">
          <div className="erxes-middle">
            <input onChange={onChangeHandler} />
          </div>
        </div>
        <Categories />
      </div>
    </div>
  );
}

KnowledgeBase.propTypes = {
  uiOptions: PropTypes.object,
};

export default KnowledgeBase;
