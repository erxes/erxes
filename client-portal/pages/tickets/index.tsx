import Layout from "../../modules/main/containers/Layout";
import TicketList from "../../modules/ticket/containers/Ticket";
import TicketHeader from "./TicketHeader";

function Ticket() {
  return (
    <Layout headerBottomComponent={<TicketHeader />}>
      {(props) => {
        return <TicketList {...props} />;
      }}
    </Layout>
  );
}

export default Ticket;
