import * as React from "react";
import { ChildProps } from "react-apollo";
import { Faq as DumbFaq } from "../../components/faq";
import { FaqConsumer, FaqProvider } from "./FaqContext";

const Faq = (props: ChildProps<{}>) => {
  return (
    <FaqProvider>
      <FaqConsumer>
        {({ activeRoute }) => {
          return <DumbFaq {...props} activeRoute={activeRoute} />;
        }}
      </FaqConsumer>
    </FaqProvider>
  );
};

export default Faq;
