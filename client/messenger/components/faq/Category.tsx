import * as React from "react";
import { IFaqCategory } from "../../types";

type Props = {
  category: IFaqCategory;
  onClick: (categoryId: string) => void;
};

export default class Category extends React.Component<Props> {
  handleOnClick = (event: React.FormEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const { category, onClick } = this.props;
    console.log(category);
    onClick(category._id);
  };

  render() {
    const { category } = this.props;

    return (
      <div className="erxes-kb-item">
        <a className="flex-item" href="" onClick={this.handleOnClick}>
          <div className="topic-icon">
            <i className={`icon-${category.icon}`} />
          </div>
          <div className="topic-content">
            <h3>{category.title}</h3>
            {category.description}
          </div>
        </a>
      </div>
    );
  }
}
