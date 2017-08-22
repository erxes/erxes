import React, { PropTypes } from 'react';
import Ionicons from 'react-ionicons';

export default class Category extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick(event) {
    event.preventDefault();
    const { category } = this.props;
    const { onSwitchToCategoryDisplay } = this.props;
    onSwitchToCategoryDisplay({
      category,
    });
  }

  renderAvatarts() {
    const authors = this.props.category.authors;
    return authors.map((author) => {
      return (
        <img
          alt={author.details.fullName}
          key={author.details.fullName}
          src={author.details.avatar || '/static/images/userDefaultIcon.png'}
        />
      );
    });
  }

  renderCategory() {
    const { category } = this.props;
    const authors = category.authors;
    console.log(category);
    let text = '';

    if (authors.length >= 1) {
      text = authors[0].details.fullName;
    }

    if (authors.length >= 2) {
      text += `, ${authors[1].details.fullName}`;
    }

    if (authors.length >= 3) {
      text += `, ${authors[2].details.fullName}`;
    }

    if (authors.length >= 4) {
      text += ` and ${authors.length - 3} people`;
    }

    return (
      <div className="erxes-kb-item">
        <a className="flex-item" href="" onClick={this.handleOnClick}>
          <div className="topic-icon">
            <Ionicons icon={category.icon} fontSize="46px" color="#818a88" />
          </div>
          <div className="topic-content">
            <h3>{category.title}</h3>
            {category.description}
            <div className="topic-meta flex-item">
              <div className="avatars">
                {this.renderAvatarts()}
              </div>
              <div>
                <div>
                  There are {category.numOfArticles} articles in this category
                </div>
                <div>
                  Written by <span>{text}</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    );
  }

  render() {
    return this.renderCategory();
  }
}

Category.propTypes = {
  category: PropTypes.object, // eslint-disable-line
  onSwitchToCategoryDisplay: PropTypes.func,
};
