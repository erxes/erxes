import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../src/components/styles.module.css";
import Table from "../../../ui/src/modules/common/components/table";

export function CardComponent(props) {
  const { type, name, info, table = [] } = props;

  if (type === "username") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard key={Math.random()} user={{ username: name }}></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<NameCard user={{ username: "${ name }" }}></NameCard>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "fullName") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard key={Math.random()} user={{details:{fullName: name}}}></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<NameCard user={{details:{fullName: "${ name }"}}}></NameCard>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "avatarSize") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard key={Math.random()} user={{details:{fullName: name}}} avatarSize={info}></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<NameCard user={{details:{fullName: "${ name }"}}} avatarSize=${info}></NameCard>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "usermail") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard key={Math.random()} user={{details:{fullName: name}, email: info}}></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<NameCard user={{details:{fullName: "${ name }"}, email: "${info}"}}></NameCard>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "secondLine") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard key={Math.random()} user={{details:{fullName: name}}} secondLine={info}></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<NameCard user={{details:{fullName: "${ name }"}, secondLine="${info}"}}></NameCard>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIcard") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import NameCard from "erxes-ui/lib/components/nameCard/NameCard";`}</CodeBlock>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Object</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="3">user</td>
              <td>username</td>
              <td>string</td>
              <td>Username object of user</td>
            </tr>
            {table.map((row, i) => (
              <tr>
                {row.map((cell) => (
                  <td>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }

  return null;
}
