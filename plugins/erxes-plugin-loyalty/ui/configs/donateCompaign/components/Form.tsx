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
import { IDonateCompaign, IDonateCompaignAward } from '../types';
import Select from 'react-select-plus';
import { __ } from 'erxes-ui';
import { IVoucherCompaign } from '../../voucherCompaign/types';

type Props = {
  donateCompaign?: IDonateCompaign;
  voucherCompaigns: IVoucherCompaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  donateCompaign: IDonateCompaign
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      donateCompaign: this.props.donateCompaign || {},
    };
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const {
      donateCompaign
    } = this.state;

    if (donateCompaign._id) {
      finalValues._id = donateCompaign._id;
    }

    donateCompaign.maxScore = Number(donateCompaign.maxScore || 0);
    donateCompaign.awards = donateCompaign.awards && donateCompaign.awards.sort((a, b) => (a.minScore - b.minScore)) || []

    return {
      ...finalValues,
      ...donateCompaign
    };
  };

  onChangeDescription = (e) => {
    this.setState({ donateCompaign: { ...this.state.donateCompaign, description: e.editor.getData() } });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({ donateCompaign: { ...this.state.donateCompaign, attachment: files.length ? files[0] : undefined } });
  };

  onChangeMultiCombo = (name: string, values) => {
    let value = values;

    if (Array.isArray(values)) {
      value = values.map(el => el.value);
    }

    this.setState({ donateCompaign: { ...this.state.donateCompaign, [name]: value } });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({ donateCompaign: { ...this.state.donateCompaign, [type]: date } });
  };

  onInputChange = e => {
    e.preventDefault();
    const value = e.target.value
    const name = e.target.name

    this.setState({ donateCompaign: { ...this.state.donateCompaign, [name]: value } });
  };

  onAddAward = () => {
    const { donateCompaign } = this.state;
    const { awards = [] } = donateCompaign;
    awards.push({
      _id: Math.random().toString(),
      minScore: 0,
      voucherCompaignId: ''
    })
    donateCompaign.awards = awards;
    this.setState({ donateCompaign })
  }

  onRemoveAward = (awardId) => {
    const { donateCompaign } = this.state;
    const { awards = [] } = donateCompaign;
    donateCompaign.awards = awards.filter(a => (a._id !== awardId))
    this.setState({ donateCompaign })
  }

  renderAward = (award: IDonateCompaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { donateCompaign } = this.state;
      award[key] = value;
      donateCompaign.awards = (donateCompaign.awards || []).map(a => a._id === award._id && award || a)
      this.setState({ donateCompaign });
    }
    const onChangeMinScore = e => {
      e.preventDefault();
      const value = e.target.value
      changeAward('minScore', value)
    };

    const onChangeVoucherCompaign = selected => {
      const value = (selected || {}).value;
      changeAward('voucherCompaignId', value);
    }

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
      (this.state.donateCompaign.awards || []).map(award => (
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
      donateCompaign
    } = this.state;

    const attachments =
      (donateCompaign.attachment && extractAttachment([donateCompaign.attachment])) || [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={donateCompaign.title}
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
                    value={donateCompaign.startDate}
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
                    value={donateCompaign.endDate}
                    onChange={this.onDateInputChange.bind(this, 'endDate')}
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
              defaultValue={donateCompaign.maxScore}
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
            <Button
              btnStyle='simple'
              icon="add"
              onClick={this.onAddAward}
            >
              {__('Add level')}
            </Button>
          </FormWrapper>
          {this.renderAwards(formProps)}

          <br />
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <EditorCK
              content={donateCompaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`donateCompaign_description_${donateCompaign.description}`}
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
            name: "donate Compaign",
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: donateCompaign,
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
