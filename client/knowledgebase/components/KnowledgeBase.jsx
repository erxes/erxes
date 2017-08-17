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
    console.log('category click handler: ', event);
    console.log('this.props.displayType: ', this.props.displayType);
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

    console.log('KnowledgeBase.render: ', displayType);
    if (displayType.displayType === CONTENT_TYPE_TOPIC) {
      console.log('bbbb: ', displayType);
      return (
        <div>
          <div>
            <div>
              <div>
                <input onChange={this.onChangeHandler} />
              </div>
            </div>
            <Categories searchStr={displayType.topicData.searchStr} />
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_CATEGORY) {
      console.log('cccc: ', displayType);
      return (
        <div>
          <div> <a href="" onClick={this.onTopicClickHandler}>Topic</a> </div>
          <div>
            <CategoryDetail category={displayType.category} />
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      console.log('dddd: ', displayType);
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
