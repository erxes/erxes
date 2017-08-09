import React, { PropTypes } from 'react';
import { Categories } from '../containers';
import { CONTENT_TYPE_TOPIC, CONTENT_TYPE_ARTICLE } from '../constants';


export default class KnowledgeBase extends React.Component {
  constructor(props) {
    super(props);
    console.log('props: ', props);
  }

  render() {
    const { displayType } = this.props;

    if (displayType.displayType === CONTENT_TYPE_TOPIC) {
      console.log('bbbb');
      return (
        <div>
          <div className="erxes-form">
            <div className="erxes-topbar thiner">
              <div className="erxes-middle">
                <input />
              </div>
            </div>
            <Categories />
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      console.log('cccc');
      return (
        <div>
          <div className="erxes-form">
            <div className="erxes-topbar thiner">
              <div className="erxes-middle">
                <input />
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
}

KnowledgeBase.propTypes = {
  displayType: PropTypes.object,
  onSwitchToTopicDisplay: PropTypes.func,
  onSwitchToArticleDisplay: PropTypes.func,
};
