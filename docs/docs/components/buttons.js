import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from '@theme/CodeBlock';

const Buttons = (props) => {
  // type = this.props.type;
  return (<>
  {/* <div type="types"> */}
     <div className={styles.styled}>
            <Button>Default</Button>{' '}
            <Button btnStyle="primary">Primary</Button>{' '}
            <Button btnStyle="success">Success</Button>{' '}
            <Button btnStyle="danger">Danger</Button>{' '}
            <Button btnStyle="warning">Warning</Button>{' '}
            <Button btnStyle="simple">Simple</Button>{' '}
            <Button btnStyle="link">Link</Button>{' '}
          </div>
          <CodeBlock className="language-jsx">{`<>
            <Button>Default</Button>
            <Button btnStyle="primary">Primary</Button>
            <Button btnStyle="success">Success</Button>
            <Button btnStyle="danger">Danger</Button>
            <Button btnStyle="warning">Warning</Button> 
            <Button btnStyle="simple">Simple</Button>
            <Button btnStyle="link">Link</Button>
</>`}</CodeBlock>
{/* </div> */}
{/* <div type="sizes"> */}
  <div className={styles.styled}>
              <Button btnStyle="primary" size="large">
                Large Primary
              </Button>{" "}
              <Button btnStyle="primary" size="medium">
                Medium Primary
              </Button>{" "}
              <Button btnStyle="primary" size="small">
                Small Primary
              </Button>{" "}
            </div>
            <CodeBlock className="language-jsx">{`<>
            <Button btnStyle="primary" size="large">Large Primary</Button>
            <Button btnStyle="primary" size="medium">Medium Primary</Button>
            <Button btnStyle="primary" size="small">Small Primary</Button>
</>`}</CodeBlock>
{/* </div> */}
{/* <div types="activity"> */}
  <div className={styles.styled}>
            <Button btnStyle="primary">Normal button</Button>
            <Button btnStyle="primary" disabled>Disabled button</Button>
          </div>
          <CodeBlock className="language-jsx">{`<>
            <Button btnStyle="primary">Normal button</Button>
            <Button btnStyle="primary" disabled>Disabled button</Button>
</>`}</CodeBlock>
{/* </div>             */}
            
            </>
  );
};

export default Buttons;
