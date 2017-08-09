import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Categories } from '../containers';
import { CONTENT_TYPE_TOPIC, CONTENT_TYPE_ARTICLE } from '../constants';

function KnowledgeBase({ displayType,
                onSwitchToArticleDisplay, onSwitchToTopicDisplay }) {
  const widgetClasses = classNames('erxes-widget');

  console.log('onSwitchToTopicDisplay: ', onSwitchToTopicDisplay);
  console.log('onSwitchToArticleDisplay: ', onSwitchToArticleDisplay);
  console.log('displayType.displayType: ', displayType.displayType);
  console.log('DISPLAY_TYPE_TOPIC: ', CONTENT_TYPE_TOPIC);
  console.log('displayType.displatType === "TOPIC": ', displayType.displayType === CONTENT_TYPE_TOPIC);

  const onChangeHandler = function (event) {
    console.log('onChangeHandler.value:', event.target.value);
    //   connection.data.searchString = e.target.value
    //   let { data } = this.props;
    //   console.log('connection.data: ', connection.data);
    //   data.refetch({
    //     topicId: connection.data.topicId,
    //     searchString: connection.data.searchString,
    //   });
  };

  if (displayType.displayType === CONTENT_TYPE_TOPIC) {
    console.log('bbbb');
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
  } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
    console.log('cccc');
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
  console.log('aaaa');
  return null;
}

KnowledgeBase.propTypes = {
  displayType: PropTypes.object,
  onSwitchToTopicDisplay: PropTypes.func,
  onSwitchToArticleDisplay: PropTypes.func,
};

export default KnowledgeBase;
