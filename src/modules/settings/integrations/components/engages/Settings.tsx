import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
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

  renderContent = (formProps: IFormProps) => {
    const { engagesConfigDetail, renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
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
