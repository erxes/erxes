import * as React from "react";
import { __ } from "../../../utils";
import { IFaqCategory } from "../../types";

type Props = {
  category: IFaqCategory;
  onClick: (category?: IFaqCategory) => void;
};

export default class Category extends React.Component<Props> {
  handleOnClick = (event: React.FormEvent<HTMLDivElement>) => {
    event.preventDefault();

    const { category, onClick } = this.props;
    onClick(category);
  };

  render() {
    const { category } = this.props;

    return (
      <div className="erxes-list-item faq-item" onClick={this.handleOnClick}>
        <div className="erxes-left-side">
          <i className={`erxes-icon-${category.icon}`} />
        </div>
        <div className="erxes-right-side">
          <div className="erxes-name">
            {__(category.title)} <span>({category.numOfArticles})</span>
          </div>
          <div className="description">{__(category.description)}</div>
        </div>
      </div>
    );
  }
}
