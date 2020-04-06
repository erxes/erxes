import * as React from "react";
import { Category } from "../../containers/faq";
import { IFaqTopic } from "../../types";

type Props = {
  faqTopics?: IFaqTopic;
  loading: boolean;
};

export default function Categories({ faqTopics, loading }: Props) {
  if (!faqTopics || loading) {
    return <div className="loader bigger" />;
  }

  return (
    <>
      {faqTopics.categories.map(category => (
        <Category key={category._id} category={category} />
      ))}
    </>
  );
}
