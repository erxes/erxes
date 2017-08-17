import React, { PropTypes } from 'react';
import { Categories, CategoryDetail, ArticleDetail } from '../containers';
import {
  CONTENT_TYPE_TOPIC,
  CONTENT_TYPE_CATEGORY,
  CONTENT_TYPE_ARTICLE,
} from '../constants';


export default class KnowledgeBase extends React.Component {
  constructor(props) {
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
    this.onCategoryClickHandler = this.onCategoryClickHandler.bind(this);
    // this.onTopicClickHandler = this.onTopicClickHandler.bind(this);
  }

  onClickHandler(event) {

  }

  onCategoryClickHandler(event) {
    event.preventDefault();
    const { onSwitchToCategoryDisplay } = this.props;
    onSwitchToCategoryDisplay({
      category: this.props.displayType.data.category
    });
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
    } else if (displayType.displayType === CONTENT_TYPE_CATEGORY) {
      return (
        <div>
          <div> <a href="" onClick={this.onTopicClickHandler}>Topic</a> </div>
          <div>
            <CategoryDetail category={displayType.category} />
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      return (
        <div>
          <div> <a href="" onClick={this.onCategoryClickHandler}>Categories</a> </div>
          <div>
            <ArticleDetail data={displayType.data} />
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
  onSwitchToCategoryDisplay: PropTypes.func,
  onUpdateSearchString: PropTypes.func,
};
