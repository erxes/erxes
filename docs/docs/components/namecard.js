import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from '@theme/CodeBlock';
import styles from "../../src/components/styles.module.css";
import Table from "../../../ui/src/modules/common/components/table";

function Username() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka"}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <NameCard user={{username: "Ariuka"}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}

function Cards() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{details:{fullName: "Ariunzaya Enkhbayar"}}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <NameCard user={{details:{fullName: "Ariunzaya Enkhbayar"}}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}
function Avatarsize() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{details:{fullName: "Ariunzaya Enkhbayar"}}} avatarSize="50"></NameCard>
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
      <NameCard user={{details:{fullName: "Ariunzaya Enkhbayar"}, email:"ariunzaya@gmail.com"}}></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
       <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}, email:"ariunzaya@gmail.com"}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}
function Secondline() {
  return (<>
    <div className={styles.styled}>
      <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}}} secondLine="Intern"></NameCard>
    </div>
    <CodeBlock className="language-jsx">{`<>
       <NameCard user={{username: "Ariuka", details:{fullName: "Ariunzaya Enkhbayar"}, email:"ariunzaya@gmail.com"}}></NameCard>
</>`}</CodeBlock>
    </>
  );
}

function Apinamecard() {
  return(
    <>
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
            <tr>
              <td>details</td>
              <td>string</td>
              <td>Fullname object of user. If you have details and username, it will only show detail</td>
            </tr>
            <tr>
              <td>email</td>
              <td>string</td>
              <td>Email object of user</td>
            </tr>
            <tr>
              <td>secondLine</td>
              <td></td>
              <td>string</td>
              <td>Line below the username or full name.You can write anything in the second line</td>
            </tr>
            <tr>
              <td>avatarSize</td>
              <td></td>
              <td>number</td>
              <td>Avatar size of your name card</td>
            </tr>
          </tbody>
        </Table>
    </>
  );
}

export { Cards, Avatarsize, Username, Useremail, Secondline, Apinamecard };