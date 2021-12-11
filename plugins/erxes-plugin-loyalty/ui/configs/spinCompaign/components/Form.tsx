import React from 'react';
import {
  Button,
  ControlLabel,
  EditorCK,
  extractAttachment,
  Form as CommonForm,
  FormControl,
  FormGroup,
  DateControl,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  Uploader,
  MainStyleScrollWrapper as ScrollWrapper,
  MainStyleDateContainer as DateContainer
} from 'erxes-ui';
import { IAttachment, IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import { ISpinCompaign, ISpinCompaignAward } from '../types';
import Select from 'react-select-plus';
import { __ } from 'erxes-ui';
import { IVoucherCompaign } from '../../voucherCompaign/types';

type Props = {
  spinCompaign?: ISpinCompaign;
  voucherCompaigns: IVoucherCompaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  spinCompaign: ISpinCompaign
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      spinCompaign: this.props.spinCompaign || {},
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const {
      spinCompaign
    } = this.state;

    if (spinCompaign._id) {
      finalValues._id = spinCompaign._id;
    }

    spinCompaign.byScore = Number(spinCompaign.byScore || 0);
    spinCompaign.awards = spinCompaign.awards && spinCompaign.awards.sort((a, b) => (a.count - b.count)) || []

    return {
      ...finalValues,
      ...spinCompaign
    };
  };

  onChangeDescription = (e) => {
    this.setState({ spinCompaign: { ...this.state.spinCompaign, description: e.editor.getData() } });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ spinCompaign: { ...this.state.spinCompaign, attachment: files.length ? files[0] : undefined } });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({ spinCompaign: { ...this.state.spinCompaign, [name]: value } });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({ spinCompaign: { ...this.state.spinCompaign, [type]: date } });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value
    const name = e.target.name

    this.setState({ spinCompaign: { ...this.state.spinCompaign, [name]: value } });
  };

  onAddAward = () => {
    const { spinCompaign } = this.state;
    const { awards = [] } = spinCompaign;
    awards.push({
      _id: Math.random().toString(),
      probability: 0,
      voucherCompaignId: ''
    })
    spinCompaign.awards = awards;
    this.setState({ spinCompaign })
  }

  onRemoveAward = (awardId) => {
    const { spinCompaign } = this.state;
    const { awards = [] } = spinCompaign;
    spinCompaign.awards = awards.filter(a => (a._id !== awardId))
    this.setState({ spinCompaign })
  }

  renderAward = (award: ISpinCompaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { spinCompaign } = this.state;
      award[key] = value;
      spinCompaign.awards = (spinCompaign.awards || []).map(a => a._id === award._id && award || a)
      this.setState({ spinCompaign });
    }
    const onChangeProbability = e => {
      e.preventDefault();
      const value = e.target.value
      changeAward('probability', value)
    };

    const onChangeVoucherCompaign = selected => {
      const value = (selected || {}).value;
      changeAward('voucherCompaignId', value);
    }

    return (
      <FormWrapper key={award._id}>
        <FormColumn>
          <Select
            placeholder={__('Choose voucher')}
            value={award.voucherCompaignId}
            options={this.props.voucherCompaigns.map(voucher => ({
              label: `${voucher.title}`,
              value: voucher._id
            }))}
            name="voucherCompaignId"
            onChange={onChangeVoucherCompaign}
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
        >Remove lvl</Button>
      </FormWrapper>
    )
  }

  renderAwards = formProps => {
    return (
      (this.state.spinCompaign.awards || []).map(award => (
        this.renderAward(award, formProps)
      ))
    )
  }

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const {
      spinCompaign
    } = this.state;

    const attachments =
      (spinCompaign.attachment && extractAttachment([spinCompaign.attachment])) || [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={spinCompaign.title}
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
                    value={spinCompaign.startDate}
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
                    value={spinCompaign.endDate}
                    onChange={this.onDateInputChange.bind(this, 'endDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={spinCompaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`spinCompaign_description_${spinCompaign.description}`}
              toolbar={[
                {
                  name: "basicstyles",
                  items: [
                    "Bold",
                    "Italic",
                    "NumberedList",
                    "BulletedList",
                    "Link",
                    "Unlink",
                    "-",
                    "Image",
                    "EmojiPanel",
                  ],
                },
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


          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>buy Score</ControlLabel>
                <FormControl
                  {...formProps}
                  name="byScore"
                  type="number"
                  min={0}
                  defaultValue={spinCompaign.byScore}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>voucher Compaign</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>Probability</ControlLabel>
            </FormColumn>
            <Button
              btnStyle='simple'
              icon="add"
              onClick={this.onAddAward}
            >
              {__('Add level')}
            </Button>
          </FormWrapper>
          {this.renderAwards(formProps)}
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
            name: "spin Compaign",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: spinCompaign,
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
