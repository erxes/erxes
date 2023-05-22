import Layout from "../../modules/main/containers/Layout";
import TicketList from "../../modules/ticket/containers/Ticket";

function Ticket() {
  return (
    <Layout>
      {(props) => {
        return <TicketList {...props} />;
      }}
    </Layout>
  );
}

export default Ticket;
