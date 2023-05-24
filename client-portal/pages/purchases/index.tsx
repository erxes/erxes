import PurchaseList from "../../modules/purchase/containers/Purchase";
import Layout from "../../modules/main/containers/Layout";

function Purchase() {
  return (
    <Layout>
      {(props) => {
        return <PurchaseList {...props} />;
      }}
    </Layout>
  );
}

export default Purchase;
