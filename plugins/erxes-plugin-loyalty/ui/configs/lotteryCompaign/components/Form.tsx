import React from 'react';
import Select from 'react-select-plus';
import { __ } from 'erxes-ui';
import {
  Button,
  ControlLabel,
  DateControl,
  EditorCK,
  extractAttachment,
  Form as CommonForm,
  FormControl,
  FormGroup,
  MainStyleDateContainer as DateContainer,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  Uploader
  } from 'erxes-ui';
import { IAttachment, IButtonMutateProps, IFormProps } from 'erxes-ui/lib/types';
import { ILotteryCompaign, ILotteryCompaignAward } from '../types';
import { IVoucherCompaign } from '../../voucherCompaign/types';

type Props = {
  lotteryCompaign?: ILotteryCompaign;
  voucherCompaigns: IVoucherCompaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  lotteryCompaign: ILotteryCompaign
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      lotteryCompaign: this.props.lotteryCompaign || {},
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const {
      lotteryCompaign
    } = this.state;

    if (lotteryCompaign._id) {
      finalValues._id = lotteryCompaign._id;
    }

    lotteryCompaign.byScore = Number(lotteryCompaign.byScore || 0);
    lotteryCompaign.awards = lotteryCompaign.awards && lotteryCompaign.awards.sort((a, b) => (a.count - b.count)) || []

    return {
      ...finalValues,
      ...lotteryCompaign
    };
  };

  onChangeDescription = (e) => {
    this.setState({ lotteryCompaign: { ...this.state.lotteryCompaign, description: e.editor.getData() } });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ lotteryCompaign: { ...this.state.lotteryCompaign, attachment: files.length ? files[0] : undefined } });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({ lotteryCompaign: { ...this.state.lotteryCompaign, [name]: value } });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({ lotteryCompaign: { ...this.state.lotteryCompaign, [type]: date } });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value
    const name = e.target.name

    this.setState({ lotteryCompaign: { ...this.state.lotteryCompaign, [name]: value } });
  };

  onAddAward = () => {
    const { lotteryCompaign } = this.state;
    const { awards = [] } = lotteryCompaign;
    awards.push({
      _id: Math.random().toString(),
      count: 0,
      voucherCompaignId: ''
    })
    lotteryCompaign.awards = awards;
    this.setState({ lotteryCompaign })
  }

  onRemoveAward = (awardId) => {
    const { lotteryCompaign } = this.state;
    const { awards = [] } = lotteryCompaign;
    lotteryCompaign.awards = awards.filter(a => (a._id !== awardId))
    this.setState({ lotteryCompaign })
  }

  renderAward = (award: ILotteryCompaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { lotteryCompaign } = this.state;
      award[key] = value;
      lotteryCompaign.awards = (lotteryCompaign.awards || []).map(a => a._id === award._id && award || a)
      this.setState({ lotteryCompaign });
    }
    const onChangeCount = e => {
      e.preventDefault();
      const value = e.target.value
      changeAward('count', value)
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
            name="count"
            type="number"
            min={0}
            defaultValue={award.count}
            required={true}
            onChange={onChangeCount}
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
      (this.state.lotteryCompaign.awards || []).map(award => (
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
      lotteryCompaign
    } = this.state;

    const attachments =
      (lotteryCompaign.attachment && extractAttachment([lotteryCompaign.attachment])) || [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={lotteryCompaign.title}
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
                    value={lotteryCompaign.startDate}
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
                    value={lotteryCompaign.endDate}
                    onChange={this.onDateInputChange.bind(this, 'endDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={lotteryCompaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`lotteryCompaign_description_${lotteryCompaign.description}`}
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
                  defaultValue={lotteryCompaign.byScore}
                  onChange={this.onInputChange}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>Lottery Date</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={true}
                    name="lotteryDate"
                    placeholder={__('Lottery date')}
                    value={lotteryCompaign.lotteryDate}
                    onChange={this.onDateInputChange.bind(this, 'lotteryDate')}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel required={true}>Number Format</ControlLabel>
            <FormControl
              {...formProps}
              name="numberFormat"
              defaultValue={lotteryCompaign.numberFormat}
              onChange={this.onInputChange}
            />
          </FormGroup>

          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>voucher Compaign</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>Count</ControlLabel>
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
            name: "lottery Compaign",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: lotteryCompaign,
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
