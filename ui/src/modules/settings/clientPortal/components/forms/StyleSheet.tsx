import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import { TextArea } from 'erxes-ui/lib/components/form/styles';
import Toggle from 'erxes-ui/lib/components/Toggle';
import { FlexContent } from 'modules/layout/styles';
import { Wrap } from '../../styles';
import React from 'react';

type Props = {
  mobileResponsive?: boolean;
  css?: string;
  handleFormChange: (name: string, value: string) => void;
};

function StyleSheet({ css, mobileResponsive, handleFormChange }: Props) {
  const handleToggle = e => {
    handleFormChange('mobileResponsive', e.target.checked);
  };

  const handleChange = e => {
    handleFormChange('css', (e.currentTarget as HTMLInputElement).value);
  };

  return (
    <>
      <FormGroup>
        <FlexContent>
          <Wrap>
            <ControlLabel>Include mobile friendly stylesheet</ControlLabel>
            <Toggle
              name="mobileResponsive"
              checked={mobileResponsive}
              onChange={handleToggle}
              icons={{
                checked: null,
                unchecked: null
              }}
            />
          </Wrap>
        </FlexContent>
        <p>
          This will make your default theme mobile friendly and will optimize it
          for phones and tablets. You can choose to turn this setting off in
          case you wish to have a consistent non-responsive theme across all
          devices.
        </p>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Custom stylesheet</ControlLabel>
        <p>Add or overwrite default theme styles with your own custom css.</p>
        <TextArea value={css} onChange={handleChange} />
      </FormGroup>
    </>
  );
}

export default StyleSheet;
