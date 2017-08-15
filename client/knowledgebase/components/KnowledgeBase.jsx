import React, { PropTypes } from 'react';
import { Categories, ArticleDetail } from '../containers';
import { CONTENT_TYPE_TOPIC, CONTENT_TYPE_ARTICLE } from '../constants';


export default class KnowledgeBase extends React.Component {
  constructor(props) {
    super(props);
    console.log('props: ', props);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  onChangeHandler(event) {
    event.preventDefault();
    console.log('KnowledgeBase.jsx.props: ', this.props);
    const { onUpdateSearchString } = this.props;
    onUpdateSearchString(event.target.value);
  }

  render() {
    const { displayType } = this.props;

    if (displayType.displayType === CONTENT_TYPE_TOPIC) {
      console.log('bbbb: ', displayType);
      return (
        <div>
          <div className="erxes-searchbar">
            <div className="erxes-knowledge-container">
              <input onChange={this.onChangeHandler} />
            </div>
          </div>
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <Categories searchStr={displayType.topicData.searchStr} />
            </div>
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      console.log('cccc');
      return (
        <div>
          <div className="erxes-searchbar">
            <div className="erxes-knowledge-container">
              <a href="" className="back" onClick={this.onClickHandler} />
            </div>
          </div>
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <ArticleDetail articleData={displayType.articleData} />
            </div>
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
  onUpdateSearchString: PropTypes.func,
};
