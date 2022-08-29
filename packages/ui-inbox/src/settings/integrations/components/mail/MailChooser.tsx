import Select from 'react-select-plus';

import FormGroup from '@erxes/ui/src/components/form/Group';
import { __ } from '@erxes/ui/src/utils';
import * as React from 'react';
import { IIntegration } from '../../types';

type Props = {
  onChange: (value: string) => void;
  selectedItem?: string;
  integrations: IIntegration[];
  verifiedEmails: string[];
};

class MailChooser extends React.Component<Props> {
  render() {
    const { verifiedEmails = [], selectedItem = '', onChange } = this.props;
    const onSelectChange = val => onChange(val.value);

    return (
      <FormGroup>
        <Select
          placeholder={__('Choose email to send from')}
          value={selectedItem}
          onChange={onSelectChange}
          options={verifiedEmails.map(e => ({ value: e, label: e }))}
        />
      </FormGroup>
    );
  }
}

export default MailChooser;
