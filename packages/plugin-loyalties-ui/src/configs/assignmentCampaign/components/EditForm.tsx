import React from 'react';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  Uploader,
  Table,
  DataWithLoader
} from '@erxes/ui/src/components';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleDateContainer as DateContainer
} from '@erxes/ui/src/styles/eindex';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { IAssignmentCampaign } from '../types';
import { extractAttachment, __ } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TemporarySegment from '@erxes/ui-segments/src/components/filter/TemporarySegment';
import { ISegment } from '@erxes/ui-segments/src/types';
import * as routerUtils from '@erxes/ui/src/utils/router';
import Row from './SegmentRow';
import Select from 'react-select-plus';
import { IVoucherCampaign } from '../../voucherCampaign/types';
import { Wrapper } from '@erxes/ui/src/layout';
import { Title } from '@erxes/ui-settings/src/styles';
import Sidebar from '../../general/components/Sidebar';
import { FormFooter, SettingsContent } from '../../../styles';
import { Link } from 'react-router-dom';

type Props = {
  assignmentCampaign: IAssignmentCampaign;
  voucherCampaigns: IVoucherCampaign[];
  segments: ISegment[];
  queryParams: any;
  history: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  assignmentCampaign: IAssignmentCampaign;
};

class EditForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      assignmentCampaign: this.props.assignmentCampaign || {}
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const { assignmentCampaign } = this.state;

    if (assignmentCampaign._id) {
      finalValues._id = assignmentCampaign._id;
    }

    return {
      ...finalValues,
      ...assignmentCampaign
    };
  };

  onChangeDescription = e => {
    this.setState({
      assignmentCampaign: {
        ...this.state.assignmentCampaign,
        description: e.editor.getData()
      }
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      assignmentCampaign: {
        ...this.state.assignmentCampaign,
        attachment: files.length ? files[0] : undefined
      }
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      assignmentCampaign: { ...this.state.assignmentCampaign, [type]: date }
    });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      assignmentCampaign: { ...this.state.assignmentCampaign, [name]: value }
    });
  };

  afterSave = response => {
    const { history } = this.props;

    const prevSegmentIds = routerUtils.getParam(history, 'segmentIds');

    let arr: string[] = [];
    if (prevSegmentIds) arr = JSON.parse(prevSegmentIds);
    arr.push(response.data.segmentsAdd._id);
    routerUtils.setParams(history, {
      segmentIds: JSON.stringify(arr)
    });
  };

  renderRow = () => {
    const { segments, history } = this.props;
    return segments.map(segment => (
      <Row key={segment._id} history={history} segment={segment} />
    ));
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeVoucherCampaign = selected => {
      const value = (selected || {}).value;

      this.setState({
        assignmentCampaign: {
          ...this.state.assignmentCampaign,
          voucherCampaignId: value
        }
      });
    };

    const { assignmentCampaign } = this.state;

    const attachments =
      (assignmentCampaign.attachment &&
        extractAttachment([assignmentCampaign.attachment])) ||
      [];

    const onSave = () => {
      const { history } = this.props;
      history.push(`/erxes-plugin-loyalty/settings/assignment`);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={assignmentCampaign.title}
            autoFocus={true}
            required={true}
            onChange={this.onInputChange}
          />
        </FormGroup>

        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Start Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="startDate"
                  placeholder={__('Start date')}
                  value={assignmentCampaign.startDate}
                  onChange={this.onDateInputChange.bind(this, 'startDate')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>End Date</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="endDate"
                  placeholder={__('End date')}
                  value={assignmentCampaign.endDate}
                  onChange={this.onDateInputChange.bind(this, 'endDate')}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Finish Date of Use</ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  required={true}
                  name="finishDateOfUse"
                  placeholder={__('Finish date of use')}
                  value={assignmentCampaign.finishDateOfUse}
                  onChange={this.onDateInputChange.bind(
                    this,
                    'finishDateOfUse'
                  )}
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        {isEnabled('segments') && isEnabled('contacts') && (
          <>
            <FormGroup>
              <ControlLabel>Customer Segment</ControlLabel>
              <br />
              <TemporarySegment
                contentType={`contacts:customer`}
                afterSave={this.afterSave}
              />
            </FormGroup>
            {this.props.segments.length > 0 && (
              <Table hover={true} bordered={true}>
                <thead>
                  <tr>
                    <th>{__('Color')}</th>
                    <th>{__('Name')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>{this.renderRow()}</tbody>
              </Table>
            )}
            <br />
          </>
        )}
        <FormGroup>
          <ControlLabel>Voucher Campaign</ControlLabel>
          <Select
            placeholder={__('Choose voucher campaign')}
            value={this.state.assignmentCampaign.voucherCampaignId}
            options={this.props.voucherCampaigns.map(voucher => ({
              label: `${voucher.title}`,
              value: voucher._id
            }))}
            name="voucherCampaignId"
            onChange={onChangeVoucherCampaign}
            loadingPlaceholder={__('Loading...')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <EditorCK
            content={assignmentCampaign.description || ''}
            onChange={this.onChangeDescription}
            height={150}
            isSubmitted={formProps.isSaved}
            name={`assignmentCampaign_description_${assignmentCampaign.description}`}
            toolbar={[
              {
                name: 'basicstyles',
                items: [
                  'Bold',
                  'Italic',
                  'NumberedList',
                  'BulletedList',
                  'Link',
                  'Unlink',
                  '-',
                  'Image',
                  'EmojiPanel'
                ]
              }
            ]}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Featured image</ControlLabel>

          <Uploader
            defaultFileList={attachments}
            onChange={this.onChangeAttachment}
            multiple={false}
            single={true}
          />
        </FormGroup>
        <FormFooter>
          <Link to={`/erxes-plugin-loyalty/settings/assignment`}>
            <Button
              btnStyle="simple"
              onClick={() => {}}
              icon="times-circle"
              uppercase={false}
            >
              Close
            </Button>
          </Link>

          {renderButton({
            name: 'Assignment Campaign',
            values: this.generateDoc(values),
            isSubmitted,
            object: assignmentCampaign,
            callback: onSave
          })}
        </FormFooter>
      </>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Assignment Campaign') }
    ];

    const content = (
      <SettingsContent>
        <CommonForm renderContent={this.renderContent} />
      </SettingsContent>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Edit Assignment Campaign')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Edit Assignment Campaign')}</Title>}
          />
        }
        content={
          <DataWithLoader
            data={content}
            loading={false}
            emptyText="There is no data"
            emptyImage="/images/actions/5.svg"
          />
        }
        leftSidebar={<Sidebar />}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default EditForm;
