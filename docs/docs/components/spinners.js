import React from "react";
import Spinner from "erxes-ui/lib/components/Spinner";
import styles from "../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';
import "erxes-icon/css/erxes.min.css";
import Table from 'erxes-ui/lib/components/table/index';


function Objective() {
  return (<>
    <div className={styles.styled}>
      <Spinner left="5%" objective/>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner left="5%" objective/>
</>`}</CodeBlock>
    </>
  );
}

function Size() {
  return (<>
    <div className={styles.styled}>
      <div className={styles.spinner}>
        <Spinner size="15" left="10%" objective />
      </div>
      <div className={styles.spinner}>
        <Spinner size="40" left="7%" objective />
      </div>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner size="15" objective />
      <Spinner size="40" objective />
</>`}</CodeBlock>
    </>
  );
}

function Position() {
  return (<>
    <div className={styles.styled}>
      <div className={styles.spinnerPos}>
        <Spinner left="5%" objective />
      </div>
      <div className={styles.spinnerPos}>
        <Spinner objective />
      </div>
      <div className={styles.spinnerPos}>
        <Spinner right="5%" left="auto" objective />
      </div>
    </div>
    <CodeBlock className="language-jsx">{`<>
      <Spinner left="5%" objective />
      <Spinner objective />
      <Spinner right="5%" left="auto" objective />
</>`}</CodeBlock>
    </>
  );
}

function Apispinners() {
    return (<>
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
              <td>objective</td>
              <td>boolean</td>
              <td>false</td>
              <td>Make your spinner objective.</td>
            </tr>
            <tr>
              <td>size</td>
              <td>number</td>
              <td>26</td>
              <td>Change the spinning size.</td>
            </tr>
            <tr>
              <td>left</td>
              <td>string</td>
              <td>50%</td>
              <td>Determine space from left side.</td>
            </tr>
            <tr>
              <td>right</td>
              <td>string</td>
              <td>auto</td>
              <td>Determine space from right side.</td>
            </tr>
            <tr>
              <td>top</td>
              <td>string</td>
              <td>50%</td>
              <td>Determine space from top side.</td>
            </tr>
            <tr>
              <td>bottom</td>
              <td>string</td>
              <td>auto</td>
              <td>Determine space from bottom side.</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

export { Objective, Size, Position, Apispinners }