import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { __ } from "../../../utils";
import { Articles } from "../../components/faq";
import { TopBar } from "../../containers";
import { IFaqCategory } from "../../types";

type Props = {
  category: IFaqCategory | null;
  goToCategories: () => void;
};

function CategoryDetail({ category, goToCategories }: Props) {
  if (!category) {
    return null;
  }

  return (
    <React.Fragment>
      <TopBar
        middle={null}
        buttonIcon={iconLeft}
        onLeftButtonClick={goToCategories}
      />
      <div className="erxes-content">
        <div className="category-container">
          <div className="flex-item spaced">
            <div className="topic-icon">
              <i className={`icon-${category.icon}`} />
            </div>
            <div className="topic-content">
              <h1>{category.title}</h1>
              {category.description}
            </div>
          </div>

          <Articles articles={category.articles} />
        </div>
      </div>
    </React.Fragment>
  );
}

export default CategoryDetail;
