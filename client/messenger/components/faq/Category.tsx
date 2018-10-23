import * as React from "react";
import { IFaqCategory } from "../../types";

type Props = {
  category: IFaqCategory;
  onClick: (categoryId: string) => void;
};

export default class Category extends React.Component<Props> {
  handleOnClick = (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();

    const { category, onClick } = this.props;
    onClick(category._id);
  };

  render() {
    const { category } = this.props;

    return (
      <div className="erxes-list-item faq-item" onClick={this.handleOnClick}>
        <div className="erxes-left-side">
          <i className={`erxes-icon-${category.icon}`} />
        </div>
        <div className="erxes-right-side">
          <div className="erxes-name">{category.title}</div>
          <div className="description">{category.description}</div>
        </div>
      </div>
    );
  }
}
