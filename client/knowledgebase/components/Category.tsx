import * as React from "react";
import { ItemMeta } from "../components";
import { IKbCategory } from "../types";

type Props = {
  category: IKbCategory;
  onClick: (category: IKbCategory) => void;
};

export default class Category extends React.Component<Props> {
  handleOnClick = (event: React.FormEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const { category, onClick } = this.props;

    onClick(category);
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
            <ItemMeta category={category} />
          </div>
        </a>
      </div>
    );
  }
}
