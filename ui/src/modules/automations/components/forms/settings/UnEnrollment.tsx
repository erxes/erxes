import React from 'react';
import Select from 'react-select-plus';
import { __ } from 'modules/common/utils';
import FormGroup from 'modules/common/components/form/Group';
import FormControl from 'modules/common/components/form/Control';
import { UnEnroll } from 'modules/automations/styles';

type Props = {};

class UnEnrollment extends React.Component<Props> {
  render() {
    return (
      <UnEnroll>
        <h3>{__('Unenrollment and suppression')}</h3>
        <div>
          <p>{'When contacts enroll in this workflow'}</p>
          <FormGroup>
            <FormControl componentClass="radio" value="any" inline={true}>
              {__('Do not remove them from other workflows')}
            </FormControl>

            <FormControl componentClass="radio" value="specific" inline={true}>
              {__('Remove them from all other workflows')}
            </FormControl>
            <FormControl componentClass="radio" value="specific" inline={true}>
              {__('Remove them from aspecific workflows')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>
            {
              'When a contact no longer meets the enrollment conditions, remove them from this workflow'
            }
          </p>
          <FormGroup>
            <FormControl componentClass="radio" value="any" inline={true}>
              {__('Yes, remove them from this workflow')}
            </FormControl>

            <FormControl componentClass="radio" value="specific" inline={true}>
              {__('No, keep them in this workflow')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>
            {
              'When two contacts are merged, shoud the newly created contact enroll in this workflow if they meet the trigger criteria'
            }
            ?
          </p>
          <FormGroup>
            <FormControl componentClass="radio" value="any" inline={true}>
              {__('Yes')}
            </FormControl>

            <FormControl componentClass="radio" value="specific" inline={true}>
              {__('No')}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <b>Suppression lists for this workflow</b>
          <p>
            {
              'Contacts on these lists will be removed from the workflow. You can add up to 20 suppression lists'
            }
          </p>
          <Select
            isRequired={true}
            value={''}
            options={[]}
            placeholder={__('Select')}
          />
        </div>
      </UnEnroll>
    );
  }
}

export default UnEnrollment;
