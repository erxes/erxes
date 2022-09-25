import * as React from 'react';

import FormGroup from '@erxes/ui/src/components/form/Group';
import { IIntegration } from '../../types';
import Select from 'react-select-plus';
import { __ } from '@erxes/ui/src/utils';
import styled from 'styled-components';

const Wrapper = styled.div`
  flex: 1;

  > div {
    margin-bottom: 5px;

    .Select-control {
      border: 0;
    }
  }
`;

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
      <Wrapper>
        <FormGroup>
          <Select
            placeholder={__('Choose email to send from')}
            value={selectedItem}
            onChange={onSelectChange}
            options={verifiedEmails.map(e => ({ value: e, label: e }))}
          />
        </FormGroup>
      </Wrapper>
    );
  }
}

export default MailChooser;
