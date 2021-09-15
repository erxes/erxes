import * as React from "react";
import { Category } from "../../containers/faq";
import { IFaqTopic, IFaqCategory } from "../../types";
import { iconLeft } from "../../../icons/Icons";
import { __ } from "../../../utils";

type Props = {
  faqTopics?: IFaqTopic;
  loading: boolean;
};

type State = {
  currentCategory: IFaqCategory | undefined;
  textColor: string;
};

export default class Categories extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { currentCategory: undefined, textColor: "#888" };
  }

  groupByParent = (array: any[]) => {
    const key = "parentCategoryId";

    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);

      return rv;
    }, {});
  };

  getCurrentItem = (currentCategory: IFaqCategory) => {
    this.setState({ currentCategory });
  };

  render() {
    const { faqTopics, loading } = this.props;
    const { currentCategory, textColor } = this.state;

    if (!faqTopics || loading) {
      return <div className="loader bigger" />;
    }

    const categories = faqTopics.categories || ({} as IFaqCategory[]);

    const subFields = categories.filter((f) => f.parentCategoryId);
    const parents = categories.filter((f) => !f.parentCategoryId);

    const group = this.groupByParent(subFields);

    if (currentCategory) {
      const childrens = group[currentCategory._id] || [];

      return (
        <div className="fade-in">
          <button
            className="back-category-button left"
            onClick={() => this.setState({ currentCategory: undefined })}
          >
            {iconLeft(textColor)} {__("Back to FAQ")}
          </button>
          {childrens.map((child: IFaqCategory) => (
            <Category key={child._id} category={child} />
          ))}
        </div>
      );
    }

    return (
      <>
        {parents.map((category) => {
          const childrens = group[category._id] || [];

          return (
            <Category
              key={category._id}
              childrens={childrens}
              getCurrentItem={this.getCurrentItem}
              category={category}
            />
          );
        })}
      </>
    );
  }
}
