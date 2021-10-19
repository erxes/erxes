import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import { renderApiTable } from "../common.js";

export function CardComponent(props) {
  const { type, username, info, table = [] } = props;
  const name = "Ariunzaya Enkhbayar";

  if (type === "username") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard
            key={Math.random()}
            user={{ username: username }}
          ></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard user={{ username: "${name}" }}></NameCard>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "fullName") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard
            key={Math.random()}
            user={{ details: { fullName: name } }}
          ></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard user={{details:{fullName: "${name}"}}}></NameCard>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "avatarSize") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard
            key={Math.random()}
            user={{ details: { fullName: name } }}
            avatarSize={info}
          ></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard user={{details:{fullName: "${name}"}}} avatarSize=${info}></NameCard>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "usermail") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard
            key={Math.random()}
            user={{ details: { fullName: name }, email: info }}
          ></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard user={{details:{fullName: "${name}"}, email: "${info}"}}></NameCard>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "secondLine") {
    return (
      <>
        <div className={styles.styled}>
          <NameCard
            key={Math.random()}
            user={{ details: { fullName: name } }}
            secondLine={info}
          ></NameCard>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard user={{details:{fullName: "${name}"}, secondLine="${info}"}}></NameCard>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIcard") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import NameCard from "erxes-ui/lib/components/nameCard/NameCard";`}</CodeBlock>
        {/* {ApiTable(table)} */}
      </>
    );
  }

  return null;
}
