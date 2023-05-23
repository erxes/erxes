import Layout from "../../modules/main/containers/Layout";
import TaskList from "../../modules/tasks/containers/Task";

export default function Category() {
  return (
    <Layout>
      {(props) => {
        return <TaskList {...props} />;
      }}
    </Layout>
  );
}
