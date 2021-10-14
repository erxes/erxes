import React from "react";
import Table from "../../../ui/src/modules/common/components/table";
import CodeBlock from "@theme/CodeBlock";

function Tables() {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan="2">Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
      <CodeBlock className="language-jsx">{`<>
      <Table>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan="2">Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
</>`}</CodeBlock>
    </>
  );
}

function Bordered() {
  return (
    <>
      <Table bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan="2">Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
      <CodeBlock className="language-jsx">{`<>
      <Table bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan="2">Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
</>`}</CodeBlock>
    </>
  );
}
function Striped() {
  return (
    <>
      <Table striped>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan="2">Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
      <CodeBlock className="language-jsx">{`<>
      <Table striped>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan="2">Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
</>`}</CodeBlock>
    </>
  );
}

function TableHover() {
  return (
    <div>
      <Table hover>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan="2">Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
      <CodeBlock className="language-jsx">{`<>
      <Table hover>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan="2">Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
</>`}</CodeBlock>
    </div>
  );
}

function Normal() {
  return (
    <>
      <Table whiteSpace="normal">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan="2">
              Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
              American former professional basketball player, coach and
              executive in the National Basketball Association (NBA). Nicknamed
              "the Hick from French Lick" and "Larry Legend," Bird is widely
              regarded as one of the greatest basketball players of all time.{" "}
            </td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>
      <CodeBlock className="language-jsx">{`<>
      <Table whiteSpace="normal">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan="2">Larry the Bird. Larry Joe Bird (born December 7, 1956) is an American former professional basketball player, coach and executive in the National Basketball Association (NBA). Nicknamed "the Hick from French Lick" and "Larry Legend," Bird is widely regarded as one of the greatest basketball players of all time. </td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
</>`}</CodeBlock>
    </>
  );
}

function ApiTable() {
  return (
    <>
      <CodeBlock className="language-jsx">{`<>
      import Table from 'erxes-ui/lib/components/table/index';
</>`}</CodeBlock>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>type</th>
            <th>default</th>
            <th>description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>bordered</td>
            <td>boolean</td>
            <td>false</td>
            <td>Add border color.</td>
          </tr>
          <tr>
            <td>colsPan</td>
            <td>number</td>
            <td></td>
            <td>Merging row cells.</td>
          </tr>
          <tr>
            <td>striped</td>
            <td>boolean</td>
            <td>false</td>
            <td>Gives table strip color.</td>
          </tr>
          <tr>
            <td>hover</td>
            <td>boolean</td>
            <td>false</td>
            <td>Activate table hover.</td>
          </tr>
          <tr>
            <td>white-space</td>
            <td>
              "normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"
            </td>
            <td></td>
            <td>Activate table hover.</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
export { Tables, TableHover, Normal, Striped, ApiTable, Bordered };
