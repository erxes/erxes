import React from 'react';
import Select from 'react-select';
import { __ } from '@erxes/ui/src/utils/core';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormControl from '@erxes/ui/src/components/form/Control';
import { UnEnroll } from '../../../styles';

type Props = {};

class UnEnrollment extends React.Component<Props> {
  render() {
    return (
      <UnEnroll>
        <h3>{__("Unenrollment and suppression")}</h3>
        <div>
          <p>{"When contacts enroll in this workflow"}</p>
          <FormGroup>
            <FormControl componentclass="radio" value="any" inline={true}>
              {__("Do not remove them from other workflows")}
            </FormControl>

            <FormControl componentclass="radio" value="specific" inline={true}>
              {__("Remove them from all other workflows")}
            </FormControl>
            <FormControl componentclass="radio" value="specific" inline={true}>
              {__("Remove them from aspecific workflows")}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>
            {
              "When a contact no longer meets the enrollment conditions, remove them from this workflow"
            }
          </p>
          <FormGroup>
            <FormControl componentclass="radio" value="any" inline={true}>
              {__("Yes, remove them from this workflow")}
            </FormControl>

            <FormControl componentclass="radio" value="specific" inline={true}>
              {__("No, keep them in this workflow")}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <p>
            {
              __("When two contacts are merged, shoud the newly created contact enroll in this workflow if they meet the trigger criteria")
            }
            ?
          </p>
          <FormGroup>
            <FormControl componentclass="radio" value="any" inline={true}>
              {__("Yes")}
            </FormControl>

            <FormControl componentclass="radio" value="specific" inline={true}>
              {__("No")}
            </FormControl>
          </FormGroup>
        </div>

        <div>
          <b>Suppression lists for this workflow</b>
          <p>
            {
              __("Contacts on these lists will be removed from the workflow. You can add up to 20 suppression lists")
            }
          </p>
          <Select
            required={true}
            value={''}
            options={[]}
            placeholder={__("Select")}
          />
        </div>
      </UnEnroll>
    );
  }
}

export default UnEnrollment;
