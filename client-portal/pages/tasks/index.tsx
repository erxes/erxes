import CardList from "../../modules/card/containers/List";
import Layout from "../../modules/main/containers/Layout";

export default function Tasks() {
  return (
    <Layout>
      {(props) => {
        return <CardList {...props} type="task" />;
      }}
    </Layout>
  );
}
