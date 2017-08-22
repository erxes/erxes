import React, { PropTypes } from 'react';
import { Categories, CategoryDetail, ArticleDetail, SearchBar } from '../containers';
import { BackButton } from '../components';
import {
  CONTENT_TYPE_TOPIC,
  CONTENT_TYPE_CATEGORY,
  CONTENT_TYPE_ARTICLE,
  CONTENT_TYPE_SEARCH,
} from '../constants';


export default class KnowledgeBase extends React.Component {
  constructor(props) {
    super(props);

    this.onSearchChangeHandler = this.onSearchChangeHandler.bind(this);
    this.onCategoryClickHandler = this.onCategoryClickHandler.bind(this);
    this.onTopicClickHandler = this.onTopicClickHandler.bind(this);
  }

  onTopicClickHandler() {
    this.props.onSwitchToTopicDisplay();
  }

  onCategoryClickHandler(event) {
    event.preventDefault();
    const { onSwitchToCategoryDisplay } = this.props;
    onSwitchToCategoryDisplay({
      category: this.props.displayType.data.category,
    });
  }

  onSearchChangeHandler(event) {
    event.preventDefault();
    console.log('onSearchChangeHandler: ', event.target.value);
    const { onUpdateSearchString } = this.props;
    onUpdateSearchString(event.target.value);
  }

  render() {
    const { displayType } = this.props;
    if (displayType.displayType === CONTENT_TYPE_TOPIC) {
      return (
        <div>
          <SearchBar />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <Categories />
            </div>
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_CATEGORY) {
      return (
        <div>
          <SearchBar />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <BackButton onClickHandler={this.onTopicClickHandler} text="Back to topics" />
              <CategoryDetail category={displayType.category} />
            </div>
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      return (
        <div>
          <SearchBar />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <BackButton onClickHandler={this.onCategoryClickHandler} text="Back to categories" />
              <ArticleDetail data={displayType.data} />
            </div>
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_SEARCH) {
      return (
        <div>
          <SearchBar searchStr={displayType.topicData.searchStr} />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

KnowledgeBase.propTypes = {
  displayType: PropTypes.object, // eslint-disable-line
  onSwitchToTopicDisplay: PropTypes.func,
  onSwitchToCategoryDisplay: PropTypes.func,
  onUpdateSearchString: PropTypes.func,
};
