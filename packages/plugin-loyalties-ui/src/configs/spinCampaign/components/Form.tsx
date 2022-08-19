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
import { ISpinCampaign, ISpinCampaignAward } from '../types';
import Select from 'react-select-plus';
import { extractAttachment, __ } from '@erxes/ui/src/utils';
import { IVoucherCampaign } from '../../voucherCampaign/types';

type Props = {
  spinCampaign?: ISpinCampaign;
  voucherCampaigns: IVoucherCampaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  spinCampaign: ISpinCampaign;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      spinCampaign: this.props.spinCampaign || {}
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const { spinCampaign } = this.state;

    if (spinCampaign._id) {
      finalValues._id = spinCampaign._id;
    }

    spinCampaign.buyScore = Number(spinCampaign.buyScore || 0);
    spinCampaign.awards =
      (spinCampaign.awards &&
        spinCampaign.awards.sort((a, b) => a.probability - b.probability)) ||
      [];

    return {
      ...finalValues,
      ...spinCampaign
    };
  };

  onChangeDescription = e => {
    this.setState({
      spinCampaign: {
        ...this.state.spinCampaign,
        description: e.editor.getData()
      }
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      spinCampaign: {
        ...this.state.spinCampaign,
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
      spinCampaign: { ...this.state.spinCampaign, [name]: value }
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      spinCampaign: { ...this.state.spinCampaign, [type]: date }
    });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      spinCampaign: { ...this.state.spinCampaign, [name]: value }
    });
  };

  onAddAward = () => {
    const { spinCampaign } = this.state;
    const { awards = [] } = spinCampaign;
    awards.push({
      _id: Math.random().toString(),
      name: '',
      probability: 0,
      voucherCampaignId: ''
    });
    spinCampaign.awards = awards;
    this.setState({ spinCampaign });
  };

  onRemoveAward = awardId => {
    const { spinCampaign } = this.state;
    const { awards = [] } = spinCampaign;
    spinCampaign.awards = awards.filter(a => a._id !== awardId);
    this.setState({ spinCampaign });
  };

  renderAward = (award: ISpinCampaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { spinCampaign } = this.state;
      award[key] = value;
      spinCampaign.awards = (spinCampaign.awards || []).map(
        a => (a._id === award._id && award) || a
      );
      this.setState({ spinCampaign });
    };
    const onChangeName = e => {
      e.preventDefault();
      const value = e.target.value;
      changeAward('name', value);
    };
    const onChangeProbability = e => {
      e.preventDefault();
      const value = e.target.value;
      changeAward('probability', value);
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
            name="name"
            defaultValue={award.name}
            required={true}
            onChange={onChangeName}
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
        <FormColumn>
          <FormControl
            {...formProps}
            name="probability"
            type="number"
            min={0}
            max={100}
            defaultValue={award.probability}
            required={true}
            onChange={onChangeProbability}
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
    return (this.state.spinCampaign.awards || []).map(award =>
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

    const { spinCampaign } = this.state;

    const attachments =
      (spinCampaign.attachment &&
        extractAttachment([spinCampaign.attachment])) ||
      [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={spinCampaign.title}
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
                    value={spinCampaign.startDate}
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
                    value={spinCampaign.endDate}
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
                    placeholder={__('Finish Date of Use')}
                    value={spinCampaign.finishDateOfUse}
                    onChange={this.onDateInputChange.bind(
                      this,
                      'finishDateOfUse'
                    )}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>buy Score</ControlLabel>
                <FormControl
                  {...formProps}
                  name="buyScore"
                  type="number"
                  min={0}
                  required={false}
                  defaultValue={spinCampaign.buyScore}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>Name</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>voucher Campaign</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>Probability</ControlLabel>
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
              content={spinCampaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`spinCampaign_description_${spinCampaign.description}`}
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
            name: 'spin Campaign',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: spinCampaign
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
