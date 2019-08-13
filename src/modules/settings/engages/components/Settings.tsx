import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBox } from '../../styles';
import { IEngageConfig } from '../types';

type Props = {
  engagesConfigDetail: IEngageConfig;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General') }
    ];

    const { engagesConfigDetail } = this.props;

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="medium" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            {renderButton({
              name: 'engagesConfigDetail',
              values: this.generateDoc(values),
              isSubmitted,
              object: this.props.engagesConfigDetail
            })}
          </Button.Group>
        }
      />
    );

    const content = (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Engages Config')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/25.svg"
                title="Engages Config"
                description="Set up your custome amazon simple email service account here."
              />
            }
          />
        }
        content={
          <ContentBox>
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
          </ContentBox>
        }
        footer={actionFooter}
        center={true}
      />
    );

    return content;
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default List;
