import CardList from "../../modules/card/containers/List";
import Layout from "../../modules/main/containers/Layout";

function Purchase() {
  return (
    <Layout>
      {(props) => {
        return <CardList {...props} type="purchase" />;
      }}
    </Layout>
  );
}

export default Purchase;
