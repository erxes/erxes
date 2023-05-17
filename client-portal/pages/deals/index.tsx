import DealList from "../../modules/deal/containers/Deal";
import Layout from "../../modules/main/containers/Layout";

function Deal() {
  return (
    <Layout>
      {(props) => {
        return <DealList {...props} />;
      }}
    </Layout>
  );
}

export default Deal;
