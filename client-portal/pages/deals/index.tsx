import CardList from "../../modules/card/containers/List";
import Layout from "../../modules/main/containers/Layout";

function Deal() {
  return (
    <Layout>
      {(props) => {
        return <CardList {...props} type="deal" />;
      }}
    </Layout>
  );
}

export default Deal;
