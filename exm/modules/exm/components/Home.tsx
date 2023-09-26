import AddForm from "../containers/AddForm";
import EditForm from "../containers/EditForm";
import { IExm } from "../../types";
import React from "react";
import Wrapper from "../../layout/components/Wrapper";

type Props = {
  exm?: IExm;
};

function Home(props: Props) {
  const { exm } = props;

  const leftActionBar = <div>{exm ? exm.name : ""}</div>;

  const content = () => {
    if (exm) {
      return <EditForm exm={exm} />;
    }

    return <AddForm />;
  };

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={"Exm core"}
          breadcrumb={[{ title: "Exm core" }]}
        />
      }
      actionBar={<Wrapper.ActionBar left={leftActionBar} />}
      content={content()}
    />
  );
}

export default Home;
