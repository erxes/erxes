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
import { IBurenScoring } from '../types';
import Select from 'react-select';
import React, { useState } from "react";
type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  customerScore: IBurenScoring;
};
import { reportPurposeList} from '../utils';
type State = {
  keyword: string;
  reportPurpose: string;
};

export default function ScoringMainForm (props:Props) {

  const [keyword, setKeyWord]= useState('')
  const [reportPurpose, setReportPurpose] =  useState('')
  
  const generateDoc = (values) => {
    return {keyword,reportPurpose}
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, customerScore } = props;
    const { values, isSubmitted } = formProps;
    return (
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel required={true} >{__('Register number')}</ControlLabel>
            <FormControl
              {...formProps}
              type={'text'}
              name="keyword"
              value={keyword}
              onChange={(e:any)=>setKeyWord(e.target.value)}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true} >{__('Scoring type')}</ControlLabel>
            <FormControl
              placeholder={__('Choose scoring type')}
              name="reportPurpose"
              options={reportPurposeList.map((f) => ({ value: f.value, label: f.label }))}
              value={reportPurpose}
              componentclass='select'
              onChange={(e:any)=>setReportPurpose(e.target.value)}
              required={true}
            />
          </FormGroup>
          <FormGroup>
            <Table >
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

                </tr>
              </tbody>
            </Table>
            {renderButton({
              name: 'Buren Scoring',
              values: generateDoc(values),
              isSubmitted,
              object: customerScore
            })}
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    );
  };


    return <Form renderContent={renderContent} />;
  
}

