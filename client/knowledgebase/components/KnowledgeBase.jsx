import React from 'react';
import PropTypes from 'prop-types';
import { Categories, Articles, CategoryDetail, ArticleDetail, SearchBar } from '../containers';
import { BackButton } from '../components';
import {
  CONTENT_TYPE_TOPIC,
  CONTENT_TYPE_CATEGORY,
  CONTENT_TYPE_ARTICLE,
  CONTENT_TYPE_SEARCH,
} from '../constants';

const propTypes = {
  displayType: PropTypes.object, // eslint-disable-line
  onSwitchToTopicDisplay: PropTypes.func,
  onSwitchToCategoryDisplay: PropTypes.func,
  onUpdateSearchString: PropTypes.func,
};

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
              <BackButton onClickHandler={this.onTopicClickHandler} text="Back to categories" />
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
              <BackButton
                onClickHandler={displayType.data.category != null ?
                  this.onCategoryClickHandler : this.onTopicClickHandler}
                text={displayType.data.category != null ?
                  'Back to categories' : 'Back to top'}
              />
              <ArticleDetail data={displayType.data} />
            </div>
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_SEARCH) {
      return (
        <div>
          <SearchBar searchStr={displayType.topicData.searchStr || ''} />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              <Articles searchString={displayType.topicData.searchStr} />
            </div>
          </div>
        </div>
      );
    }
    return null;
  }
}

KnowledgeBase.propTypes = propTypes;
