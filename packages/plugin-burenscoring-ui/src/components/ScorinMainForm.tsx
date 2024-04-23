import {
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  __
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  mainTypeId: string;
  closeModal: () => void;
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
        reportPurpose:  '',
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
 
  generateDoc = (values: { _id: string } & JSON) => {
    
    const finalValues = values;
    let addDetail:any = {};
    return finalValues
    };

  onFieldClick = e => {
    e.target.select();
  };
  
  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton} = this.props;
    const { values, isSubmitted } = formProps;

    const onSelect = (value, name) => {
      this.setState({ [name]: value } as any);
    };

    const onchangeType= (value, name) => {
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
      <>
          <FormWrapper>
            <FormColumn>
            <FormGroup>
              <ControlLabel>{__('Register number')}</ControlLabel>
              <FormControl
                {...formProps}
                type={'text'}
                name="keyword"
                onChange={onChangeField}
                onClick={this.onFieldClick}
              />
            </FormGroup>
            <FormGroup>
                <ControlLabel>{__('Scoring type')}</ControlLabel>
                <Select
                  {...formProps}
                  placeholder={__('Choose scoring type')}
                  name="reportPurpose"
                  options={this.state.reportPurposeList.map((f) => ({ value: f.value, label: f.label }))}
                  value={this.state.reportPurpose}
                  onChange={onchangeType}
                  multi={false}
                  required ={true}
                />
            </FormGroup>

            {renderButton({
            name: 'burenScoring',
            values: this.generateDoc(values),
            isSubmitted,
            object: {}
          })}
            </FormColumn>
          </FormWrapper>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ScoringMainForm;