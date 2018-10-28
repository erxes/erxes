import * as React from "react";
import { iconLeft } from "../../../icons/Icons";
import { Articles } from "../../components/faq";
import { TopBar } from "../../containers";
import { IFaqCategory } from "../../types";

type Props = {
  category: IFaqCategory;
  goToCategories: () => void;
  loading: boolean;
};

function CategoryDetail({ category, goToCategories }: Props) {
  const renderHead = () => {
    return (
      <div className="erxes-topbar-title limited">
        <div>
          {category.title} <span>({category.numOfArticles})</span>
        </div>
        <span>{category.description}</span>
      </div>
    );
  };

  return (
    <>
      <TopBar
        middle={renderHead()}
        buttonIcon={iconLeft}
        onLeftButtonClick={goToCategories}
      />
      <div className="erxes-content slide-in">
        <Articles articles={category.articles} />
      </div>
    </>
  );
}

export default CategoryDetail;
