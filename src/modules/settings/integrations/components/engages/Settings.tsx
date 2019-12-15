import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { IEngageConfig } from '../../types';

type Props = {
  engagesConfigDetail: IEngageConfig;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  secretAccessKey?: string;
  accessKeyId?: string;
  region?: string;
};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { engagesConfigDetail } = props;

    this.state = {
      secretAccessKey: engagesConfigDetail.secretAccessKey || '',
      accessKeyId: engagesConfigDetail.accessKeyId || '',
      region: engagesConfigDetail.region || ''
    };
  }

  generateDoc = values => {
    return values;
  };

  renderDescription() {
    return (
      <>
        <Info>
          <p>
            <strong>To find your Access Key and Secret Access Key:</strong>
          </p>
          <ol>
            <li>
              <a
                href="https://console.aws.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Log in to your AWS Management Console.
              </a>
            </li>
            <li>Click on your user name at the top right of the page.</li>
            <li>
              Click on the My Security Credentials link from the drop-down menu.
            </li>
            <li>
              Find the Access Credentials section, and copy the latest Access
              Key ID. If you don't have then Click access keys from the toggle
              and click Create New Access key and copy the keys.
            </li>
            <li>
              Click on the Show link in the same row, and copy the Secret Access
              Key.
            </li>
          </ol>
        </Info>
        <Info>
          <p>
            <strong>To find your Region:</strong>
          </p>
          <ol>
            <li>
              <a
                href="https://console.aws.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Log in to your AWS Management Console.
              </a>
            </li>
            <li>Click on services menu at the top left of the page.</li>
            <li>Find Simple Email Service and Copy region code from url.</li>
          </ol>
          <p>If you choose not available region</p>
          <ol>
            <li>Click on your region at the top right of the menu.</li>
            <li>Select any active region from list.</li>
            <li>
              Copy the selected Region code. <br />
              <i>
                (example: us-east-1, us-west-2, ap-south-1, ap-southeast-2,
                eu-central-1, eu-west-1)
              </i>
            </li>
          </ol>
        </Info>
        <Info>
          <p>
            <strong>
              If you want Access Key using only Amazon SES and Amazon SNS:
            </strong>
          </p>
          <ol>
            <li>
              <a
                href="https://console.aws.amazon.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Log in to your AWS Management Console.
              </a>
            </li>
            <li>Click on your user name at the top right of the page.</li>
            <li>
              Click on the My Security Credentials link from the drop-down menu.
            </li>
            <li>Click on the Users menu from left Sidebar.</li>
            <li>Click on the Add user.</li>
            <li>
              Then create your username and check Programmatic access type and
              click next.
            </li>
            <li>
              Click on the Create group then write group name and check
              amazonSesFullAccess and amazonSNSFullAccess.
            </li>
            <li>Then check your created group and click on the Next button.</li>
            <li>
              Finally click on the create user and copy the Access Key Id and
              Secret Access Key.
            </li>
          </ol>
        </Info>
      </>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { engagesConfigDetail, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderDescription()}
        <FormGroup>
          <ControlLabel>AWS-SES Access key ID</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="accessKeyId"
            defaultValue={engagesConfigDetail.accessKeyId}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS-SES Secret access key</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="secretAccessKey"
            defaultValue={engagesConfigDetail.secretAccessKey}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS-SES Region</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="region"
            defaultValue={engagesConfigDetail.region}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'engagesConfigDetail',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.engagesConfigDetail
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default List;
