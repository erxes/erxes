import CardList from "../../modules/card/containers/List";
import Layout from "../../modules/main/containers/Layout";

function Ticket() {
  return (
    <Layout>
      {(props) => {
        return <CardList {...props} type="ticket" />;
      }}
    </Layout>
  );
}

export default Ticket;
