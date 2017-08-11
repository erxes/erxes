import React, { PropTypes } from 'react';
import { Categories, ArticleDetail } from '../containers';
import { CONTENT_TYPE_TOPIC, CONTENT_TYPE_ARTICLE } from '../constants';


export default class KnowledgeBase extends React.Component {
  constructor(props) {
    super(props);
    console.log('props: ', props);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  onClickHandler(event) {

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
          <div className="erxes-form">
            <div className="erxes-topbar thiner">
              <div className="erxes-middle">
                <input onChange={this.onChangeHandler} />
              </div>
            </div>
            <Categories searchStr={displayType.topicData.searchStr} />
          </div>
        </div>
      );
    } else if (displayType.displayType === CONTENT_TYPE_ARTICLE) {
      console.log('cccc');
      return (
        <div>
          <div> <a href="" onClick={this.onClickHandler}>Categories</a> </div>
          <div className="erxes-form">
            <ArticleDetail articleData={displayType.articleData} />
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
