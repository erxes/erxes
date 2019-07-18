import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import HeaderDescription from 'modules/common/components/HeaderDescription';
import { __ } from 'modules/common/utils';
import ActionBar from 'modules/layout/components/ActionBar';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { ContentBox } from '../../styles';

type Props = {
  ses: any;
  save: (secretAccessKey: string, accessKeyId: string, region: string) => void;
};

type State = {};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  save = () => {
    const secretAccessKey = (document.getElementById(
      'secretAccessKey'
    ) as HTMLInputElement).value;
    const accessKeyId = (document.getElementById(
      'accessKeyId'
    ) as HTMLInputElement).value;
    const region = (document.getElementById('region') as HTMLInputElement)
      .value;

    this.props.save(secretAccessKey, accessKeyId, region);
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('General') }
    ];

    const actionFooter = (
      <ActionBar
        right={
          <Button.Group>
            <Link to="/settings/">
              <Button size="small" btnStyle="simple" icon="cancel-1">
                Cancel
              </Button>
            </Link>

            <Button
              size="small"
              btnStyle="success"
              icon="checked-1"
              onClick={this.save}
            >
              Save
            </Button>
          </Button.Group>
        }
      />
    );

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel>AWS-SES Access key ID</ControlLabel>
          <FormControl id="accessKeyId" />
        </FormGroup>
        <FormGroup>
          <ControlLabel>AWS-SES Secret access key</ControlLabel>
          <FormControl id="secretAccessKey" type="password" />
        </FormGroup>
        <FormGroup>
          <ControlLabel>AWS-SES Region</ControlLabel>
          <FormControl id="region" />
        </FormGroup>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('General')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={
              <HeaderDescription
                icon="/images/actions/25.svg"
                title="General"
                description="Set up your initial account settings so that things run smoothly in unison."
              />
            }
          />
        }
        content={content}
        footer={actionFooter}
        center={true}
      />
    );
  }
}

export default List;
