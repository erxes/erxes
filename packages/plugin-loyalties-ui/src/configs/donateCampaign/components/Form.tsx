import React from 'react';
import {
  Button,
  ControlLabel,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  Uploader
} from '@erxes/ui/src/components';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  MainStyleDateContainer as DateContainer
} from '@erxes/ui/src/styles/eindex';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { IDonateCampaign, IDonateCampaignAward } from '../types';
import Select from 'react-select-plus';
import { extractAttachment, __ } from '@erxes/ui/src/utils';
import { IVoucherCampaign } from '../../voucherCampaign/types';

type Props = {
  donateCampaign?: IDonateCampaign;
  voucherCampaigns: IVoucherCampaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  donateCampaign: IDonateCampaign;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      donateCampaign: this.props.donateCampaign || {}
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const { donateCampaign } = this.state;

    if (donateCampaign._id) {
      finalValues._id = donateCampaign._id;
    }

    donateCampaign.maxScore = Number(donateCampaign.maxScore || 0);
    donateCampaign.awards =
      (donateCampaign.awards &&
        donateCampaign.awards.sort((a, b) => a.minScore - b.minScore)) ||
      [];

    return {
      ...finalValues,
      ...donateCampaign
    };
  };

  onChangeDescription = e => {
    this.setState({
      donateCampaign: {
        ...this.state.donateCampaign,
        description: e.editor.getData()
      }
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      donateCampaign: {
        ...this.state.donateCampaign,
        attachment: files.length ? files[0] : undefined
      }
    });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({
      donateCampaign: { ...this.state.donateCampaign, [name]: value }
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      donateCampaign: { ...this.state.donateCampaign, [type]: date }
    });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      donateCampaign: { ...this.state.donateCampaign, [name]: value }
    });
  };

  onAddAward = () => {
    const { donateCampaign } = this.state;
    const { awards = [] } = donateCampaign;
    awards.push({
      _id: Math.random().toString(),
      minScore: 0,
      voucherCampaignId: ''
    });
    donateCampaign.awards = awards;
    this.setState({ donateCampaign });
  };

  onRemoveAward = awardId => {
    const { donateCampaign } = this.state;
    const { awards = [] } = donateCampaign;
    donateCampaign.awards = awards.filter(a => a._id !== awardId);
    this.setState({ donateCampaign });
  };

  renderAward = (award: IDonateCampaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { donateCampaign } = this.state;
      award[key] = value;
      donateCampaign.awards = (donateCampaign.awards || []).map(
        a => (a._id === award._id && award) || a
      );
      this.setState({ donateCampaign });
    };
    const onChangeMinScore = e => {
      e.preventDefault();
      const value = e.target.value;
      changeAward('minScore', value);
    };

    const onChangeVoucherCampaign = selected => {
      const value = (selected || {}).value;
      changeAward('voucherCampaignId', value);
    };

    return (
      <FormWrapper key={award._id}>
        <FormColumn>
          <FormControl
            {...formProps}
            name="minScore"
            type="number"
            min={0}
            defaultValue={award.minScore}
            required={true}
            onChange={onChangeMinScore}
          />
        </FormColumn>

        <FormColumn>
          <Select
            placeholder={__('Choose voucher')}
            value={award.voucherCampaignId}
            options={this.props.voucherCampaigns.map(voucher => ({
              label: `${voucher.title}`,
              value: voucher._id
            }))}
            name="voucherCampaignId"
            onChange={onChangeVoucherCampaign}
            loadingPlaceholder={__('Loading...')}
          />
        </FormColumn>
        <Button
          btnStyle="simple"
          size="small"
          onClick={this.onRemoveAward.bind(this, award._id)}
          icon="times"
        >
          Remove lvl
        </Button>
      </FormWrapper>
    );
  };

  renderAwards = formProps => {
    return (this.state.donateCampaign.awards || []).map(award =>
      this.renderAward(award, formProps)
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const { donateCampaign } = this.state;

    const attachments =
      (donateCampaign.attachment &&
        extractAttachment([donateCampaign.attachment])) ||
      [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={donateCampaign.title}
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
                    value={donateCampaign.startDate}
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
                    value={donateCampaign.endDate}
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
                    value={donateCampaign.finishDateOfUse}
                    onChange={this.onDateInputChange.bind(
                      this,
                      'finishDateOfUse'
                    )}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel required={true}>max Score</ControlLabel>
            <FormControl
              {...formProps}
              name="maxScore"
              type="number"
              min={0}
              defaultValue={donateCampaign.maxScore}
              onChange={this.onInputChange}
            />
          </FormGroup>
          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>Min Score</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>Voucher</ControlLabel>
            </FormColumn>
            <Button btnStyle="simple" icon="add" onClick={this.onAddAward}>
              {__('Add level')}
            </Button>
          </FormWrapper>
          {this.renderAwards(formProps)}

          <br />
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={donateCampaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`donateCampaign_description_${donateCampaign.description}`}
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
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Close
          </Button>

          {renderButton({
            name: 'donate Campaign',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: donateCampaign
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
