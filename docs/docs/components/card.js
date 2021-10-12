import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from '@theme/CodeBlock';
import styles from "../../src/components/styles.module.css";

function Cards() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}, Avatar:"https://erxes.io/static/images/swag.gif"}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      
</>`}</CodeBlock>
    </>
  );
}

export { Cards };