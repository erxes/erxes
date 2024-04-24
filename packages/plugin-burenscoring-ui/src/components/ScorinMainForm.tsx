import {
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  Table,
  __
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
import { IBurenScoring } from '../types';
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  customerScore: IBurenScoring;
};

type State = {
  keyword: string;
  reportPurpose: string;
  reportPurposeList: any;
};
class ScoringMainForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      reportPurpose: '',
      reportPurposeList: [
        {
          value: 'NEW_LOAN',
          label: 'NEW_LOAN'
        },
        {
          value: 'LOAN_CHECK',
          label: 'LOAN_CHECK'
        }
        ,
        {
          value: 'CITIZEN_REQUEST',
          label: 'CITIZEN_REQUEST'
        }
        ,
        {
          value: 'LOAN',
          label: 'LOAN'
        }
    ] 
    };
      
  }
 
  generateDoc = (values) => {
    const finalValues = values;
    finalValues.keyword = this.state.keyword;
    finalValues.reportPurpose = this.state.reportPurpose;
    return finalValues
    };

  onFieldClick = e => {
    e.target.select();
  };
  
  renderContent = (formProps: IFormProps) => {
    const { renderButton,customerScore} = this.props;
    const { values, isSubmitted } = formProps;
    const onchangeType= (value) => {
      this.setState({ ['reportPurpose']: value.value } as any);
    };
   ;
    
    const onChangeField = e => {
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
          
      const {name} = e.target as HTMLInputElement;
      this.setState({
        [name]: value
      } as any);
    };

    return (
      <FormWrapper>
            <FormColumn>
            <FormGroup>
              <ControlLabel required={true} >{__('Register number')}</ControlLabel>
              <FormControl
                {...formProps}
                type={'text'}
                name="keyword"
                value={this.state.keyword}
                onChange={onChangeField}
                onClick={this.onFieldClick}
                required={true}
              />
            </FormGroup>
            <FormGroup>
                <ControlLabel required={true} >{__('Scoring type')}</ControlLabel>
                <Select
                  {...formProps}
                  placeholder={__('Choose scoring type')}
                  name="reportPurpose"
                  options={this.state.reportPurposeList.map((f) => ({ value: f.value, label: f.label }))}
                  value={this.state.reportPurpose}
                  onChange={onchangeType}
                  multi={false}
                  required = {true}
                />
            </FormGroup>
            <FormGroup> 
              <Table whiteSpace="nowrap" bordered={true} hover={true} striped>
                    <thead>
                      <tr>
                        <th>{__('Score')}</th>
                        <th>{__('Type')}</th>
                        <th>{__('get Date')}</th>
                      </tr>
                    </thead>
                    <tbody id="detail">
                      <tr key={customerScore?._id}>
                        <td >{customerScore?.score}</td>
                        <td >{customerScore?.reportPurpose}</td>
                        <td >{customerScore?.createdAt}</td>
                      </tr>
                    </tbody>
                </Table>
                {renderButton({
                  name: 'Buren Scoring',
                  values: this.generateDoc(values),
                  isSubmitted,
                  object: customerScore
                })}
            </FormGroup>
          </FormColumn>
      </FormWrapper>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ScoringMainForm;