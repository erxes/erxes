import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Description } from '@erxes/ui-settings/src/styles';
import { FlexHeight as FlexItemContainer } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import React from 'react';
import Select from 'react-select-plus';
import SelectBrand from '../../../settings/integrations/containers/SelectBrand';
import SelectChannels from '../../../settings/integrations/containers/SelectChannels';

type Name = 'languageCode';

type Props = {
  onChange: (name: string, value: any) => void;
  title: string;
  brandId: string;
  channelIds: string[];
  languageCode: string;
};

function SettingsStep({
  onChange,
  title,
  brandId,
  channelIds,
  languageCode
}: Props) {
  const onChangeSelect = (key: Name, e: any) => {
    let value = e;

    if (e && e.value) {
      value = e.value;
    }
    onChange(key, value);
  };

  return (
    <FlexItemContainer>
      <LeftItem>
        <FormGroup>
          <ControlLabel required={true}>Booking Title</ControlLabel>
          <Description>
            Name this widget to differentiate from the rest internally.
          </Description>
          <FormControl
            type="text"
            onChange={(e: any) => onChange('title', e.target.value)}
            defaultValue={title}
          />
        </FormGroup>

        <FormGroup>
          <SelectBrand
            isRequired={true}
            defaultValue={brandId}
            onChange={(e: any) => onChange('brandId', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <SelectChannels
            defaultValue={channelIds}
            onChange={e => onChange('channelIds', e)}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Language</ControlLabel>
          <Select
            placeholder="Choose language"
            options={LANGUAGES.map(el => ({
              label: el.label,
              value: el.value
            }))}
            value={languageCode}
            onChange={e => onChangeSelect('languageCode', e)}
          />
        </FormGroup>
      </LeftItem>
    </FlexItemContainer>
  );
}

export default SettingsStep;
