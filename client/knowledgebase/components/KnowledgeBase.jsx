import React from 'react';
import PropTypes from 'prop-types';
import { Categories, Articles, SearchBar, CategoryDetail } from '../containers';
import { ArticleDetail } from '../components';
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
  color: PropTypes.string,
};

const contextTypes = {
  __: PropTypes.func
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

  renderContent() {
    const { __ } = this.context;
    const { displayType } = this.props;
    if (displayType.displayType === CONTENT_TYPE_TOPIC) {
      return (
        <Categories />
      )
    }

    if (displayType.displayType === CONTENT_TYPE_CATEGORY) {
      return (
        <div>
          <BackButton onClickHandler={this.onTopicClickHandler} text={__('Back to categories')} />
          <CategoryDetail category={displayType.category} />
        </div>
      );
    }

    if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      return (
        <div>
          <BackButton
            onClickHandler={displayType.data.category != null ?
              this.onCategoryClickHandler : this.onTopicClickHandler}
            text={displayType.data.category != null ?
              __('Back to articles') : __('Back to top')}
          />
          <ArticleDetail data={displayType.data} />
        </div>
      );
    }

    if (displayType.displayType === CONTENT_TYPE_SEARCH) {
      return (
        <div>
          <Articles searchString={displayType.topicData.searchStr} />
        </div>
      );
    }

    return null;
  }

  render() {
    const { displayType, color } = this.props;
    const { topicData } = displayType;
    const searchStr = topicData && topicData.searchStr || '';

    return (
      <div className="erxes-widget-kb">
        <div>
          <SearchBar searchStr={searchStr} color={color} />
          <div className="erxes-content">
            <div className="erxes-knowledge-container">
              {this.renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

KnowledgeBase.propTypes = propTypes;
KnowledgeBase.contextTypes = contextTypes;
