import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from '@theme/CodeBlock';
import styles from "../../src/components/styles.module.css";

function Username() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka"}} singleLine></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <NameCard user={{username: "Ariuka"}} singleLine></NameCard>
</>`}</CodeBlock>
    </>
  );
}
function Cards() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}
function Avatarsize() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}}} avatarSize="100"></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}}} avatarSize="100"></NameCard>

</>`}</CodeBlock>
    </>
  );
}
function Useremail() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}, email:"ariunzaya@gmail.com"}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
       <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}, email:"ariunzaya@gmail.com"}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}

export { Cards, Avatarsize, Username, Useremail };