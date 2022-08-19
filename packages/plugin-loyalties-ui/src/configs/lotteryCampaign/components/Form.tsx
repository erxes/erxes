import React from 'react';
import Select from 'react-select-plus';
import { extractAttachment, __, Alert } from '@erxes/ui/src/utils';
import {
  Button,
  ControlLabel,
  DateControl,
  Form as CommonForm,
  FormControl,
  FormGroup,
  Uploader
} from '@erxes/ui/src/components';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import {
  MainStyleDateContainer as DateContainer,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import {
  IAttachment,
  IButtonMutateProps,
  IFormProps
} from '@erxes/ui/src/types';
import { ILotteryCampaign, ILotteryCampaignAward } from '../types';
import { IVoucherCampaign } from '../../voucherCampaign/types';

type Props = {
  lotteryCampaign?: ILotteryCampaign;
  voucherCampaigns: IVoucherCampaign[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  lotteryCampaign: ILotteryCampaign;
  perFormatType: string;
  perFormatLen: number;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      lotteryCampaign: this.props.lotteryCampaign || {},
      perFormatType: '',
      perFormatLen: 6
    };
  }

  componentWillUnmount(): void {
    this.props.closeModal();
  }

  generateDoc = (values: {
    _id?: string;
    attachment?: IAttachment;
    description: string;
  }) => {
    const finalValues = values;
    const { lotteryCampaign } = this.state;

    if (lotteryCampaign._id) {
      finalValues._id = lotteryCampaign._id;
    }

    lotteryCampaign.buyScore = Number(lotteryCampaign.buyScore || 0);
    lotteryCampaign.awards =
      (lotteryCampaign.awards &&
        lotteryCampaign.awards.sort((a, b) => a.count - b.count)) ||
      [];

    return {
      ...finalValues,
      ...lotteryCampaign
    };
  };

  onChangeDescription = e => {
    this.setState({
      lotteryCampaign: {
        ...this.state.lotteryCampaign,
        description: e.editor.getData()
      }
    });
  };

  onChangeAttachment = (files: IAttachment[]) => {
    this.setState({
      lotteryCampaign: {
        ...this.state.lotteryCampaign,
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
      lotteryCampaign: { ...this.state.lotteryCampaign, [name]: value }
    });
  };

  onDateInputChange = (type: string, date) => {
    this.setState({
      lotteryCampaign: { ...this.state.lotteryCampaign, [type]: date }
    });
  };

  onInputChange = e => {
    const value = e.target.value;
    const name = e.target.name;

    this.setState({
      lotteryCampaign: { ...this.state.lotteryCampaign, [name]: value }
    });
  };

  onAddAward = () => {
    const { lotteryCampaign } = this.state;
    const { awards = [] } = lotteryCampaign;
    awards.push({
      _id: Math.random().toString(),
      name: '',
      count: 0,
      voucherCampaignId: ''
    });
    lotteryCampaign.awards = awards;
    this.setState({ lotteryCampaign });
  };

  onRemoveAward = awardId => {
    const { lotteryCampaign } = this.state;
    const { awards = [] } = lotteryCampaign;
    lotteryCampaign.awards = awards.filter(a => a._id !== awardId);
    this.setState({ lotteryCampaign });
  };

  renderAward = (award: ILotteryCampaignAward, formProps) => {
    const changeAward = (key, value) => {
      const { lotteryCampaign } = this.state;
      award[key] = value;
      lotteryCampaign.awards = (lotteryCampaign.awards || []).map(
        a => (a._id === award._id && award) || a
      );
      this.setState({ lotteryCampaign });
    };
    const onChangeName = e => {
      e.preventDefault();
      const value = e.target.value;
      changeAward('name', value);
    };
    const onChangeCount = e => {
      e.preventDefault();
      const value = e.target.value;
      changeAward('count', value);
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
        >
          Remove lvl
        </Button>
      </FormWrapper>
    );
  };

  renderAwards = formProps => {
    return (this.state.lotteryCampaign.awards || []).map(award =>
      this.renderAward(award, formProps)
    );
  };

  onSelectPerFormat = value => {
    this.setState({ perFormatType: value ? value.value : '' });
  };

  onChangePerLen = e => {
    this.setState({ perFormatLen: e.target.value });
  };

  onAddFormat = () => {
    const { perFormatType, perFormatLen } = this.state;
    if (!perFormatType || !perFormatLen) {
      return Alert.error('must choose format type and format len');
    }
    let { numberFormat } = this.state.lotteryCampaign;
    numberFormat = `${numberFormat ||
      ''}${`{ [${perFormatType}] * ${perFormatLen} }`}`;
    this.setState({
      lotteryCampaign: { ...this.state.lotteryCampaign, numberFormat }
    });
  };

  numberFormatKey = (e: React.KeyboardEvent) => {
    if (['Backspace', 'Delete'].includes(e.key)) {
      e.preventDefault();
      this.setState({
        lotteryCampaign: { ...this.state.lotteryCampaign, numberFormat: '' }
      });
    }
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { values, isSubmitted } = formProps;

    const trigger = (
      <Button btnStyle="primary" uppercase={false} icon="plus-circle">
        Add category
      </Button>
    );

    const { lotteryCampaign } = this.state;

    const attachments =
      (lotteryCampaign.attachment &&
        extractAttachment([lotteryCampaign.attachment])) ||
      [];

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel required={true}>title</ControlLabel>
            <FormControl
              {...formProps}
              name="title"
              defaultValue={lotteryCampaign.title}
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
                    value={lotteryCampaign.startDate}
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
                    value={lotteryCampaign.endDate}
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
                    value={lotteryCampaign.finishDateOfUse}
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
                  defaultValue={lotteryCampaign.buyScore}
                  onChange={this.onInputChange}
                  required={false}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          <FormGroup>
            <ControlLabel required={true}>Number Format</ControlLabel>
            <FormWrapper>
              <FormColumn>
                <Select
                  options={[
                    { value: '0-9', label: '[0-9]' },
                    { value: 'a-z', label: '[a-z]' },
                    { value: 'A-Z', label: '[A-Z]' },
                    { value: 'a-Z', label: '[a-z][A-Z]' },
                    { value: '0-z', label: '[0-9][a-z]' },
                    { value: '0-Z', label: '[0-9][A-Z]' },
                    { value: '0-zZ', label: '[0-9][a-z][A-Z]' }
                  ]}
                  value={this.state.perFormatType}
                  name="perFormatType"
                  onChange={this.onSelectPerFormat}
                  placeholder={__('Choose allow chars')}
                />
              </FormColumn>
              <FormColumn>
                <FormControl
                  type="number"
                  min={1}
                  max={9}
                  name="perFormatLen"
                  defaultValue={this.state.perFormatLen}
                  onChange={this.onChangePerLen}
                />
              </FormColumn>
              <FormColumn>
                <Button btnStyle="simple" onClick={this.onAddFormat}>
                  {__('Add format')}
                </Button>
              </FormColumn>

              <FormColumn>
                <FormControl
                  {...formProps}
                  name="numberFormat"
                  value={lotteryCampaign.numberFormat}
                  onKeyDown={this.numberFormatKey}
                  onChange={this.onInputChange}
                />
              </FormColumn>
            </FormWrapper>
          </FormGroup>

          <FormWrapper>
            <FormColumn>
              <ControlLabel required={true}>Name</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>voucher Campaign</ControlLabel>
            </FormColumn>
            <FormColumn>
              <ControlLabel required={true}>Count</ControlLabel>
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
              content={lotteryCampaign.description}
              onChange={this.onChangeDescription}
              height={150}
              isSubmitted={formProps.isSaved}
              name={`lotteryCampaign_description_${lotteryCampaign.description}`}
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
            name: 'lottery Campaign',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: lotteryCampaign
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
