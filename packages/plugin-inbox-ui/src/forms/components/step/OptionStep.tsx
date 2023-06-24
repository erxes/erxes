import { IFormData } from '@erxes/ui-forms/src/forms/types';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import { LANGUAGES } from '@erxes/ui-settings/src/general/constants';
import { Description } from '@erxes/ui-settings/src/styles';
import { IBrand } from '@erxes/ui/src/brands/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FlexItem } from '@erxes/ui/src/components/step/style';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import Toggle from '@erxes/ui/src/components/Toggle';
import { IField } from '@erxes/ui/src/types';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';
import { __ } from 'coreui/utils';
import React, { useCallback } from 'react';
import Select from 'react-select-plus';

type Props = {
  onChange: (
    name:
      | 'brand'
      | 'language'
      | 'isRequireOnce'
      | 'channelIds'
      | 'theme'
      | 'saveAsCustomer'
      | 'visibility'
      | 'departmentIds',
    value: any
  ) => void;
  type: string;
  formData: IFormData;
  color: string;
  theme: string;
  title?: string;
  language?: string;
  isRequireOnce?: boolean;
  saveAsCustomer?: boolean;
  fields?: IField[];
  brand?: IBrand;
  channelIds?: string[];
  visibility?: string;
  departmentIds?: string[];
  integrationId?: string;
  isSubmitted?: boolean;
  onFieldEdit?: () => void;
  waitUntilFinish?: (obj: any) => void;
  onChildProcessFinished?: (component: string) => void;
};

const OptionStep = (props: Props) => {
  const [renderPayments, setRenderPayments] = React.useState(false);
  const onChangeFunction = useCallback((key, val) => {
    props.onChange(key, val);
  }, []);

  const onSelectChange = useCallback((e, key) => {
    let value = '';

    if (e) {
      value = e.value;
    }

    props.onChange(key, value);
  }, []);

  const onChangeTitle = useCallback(e => {
    onChangeFunction('title', (e.currentTarget as HTMLInputElement).value);
  }, []);

  const renderDepartments = () => {
    const { visibility, departmentIds } = props;

    if (visibility === 'public') {
      return;
    }

    const departmentOnChange = (values: string[]) => {
      onChangeFunction('departmentIds', values);
    };

    return (
      <FormGroup>
        <SelectDepartments
          defaultValue={departmentIds}
          isRequired={false}
          onChange={departmentOnChange}
        />
      </FormGroup>
    );
  };

  const { language, brand, isRequireOnce, saveAsCustomer } = props;

  const onChange = e => {
    onChangeFunction('brand', (e.currentTarget as HTMLInputElement).value);
  };

  const channelOnChange = (values: string[]) => {
    onChangeFunction('channelIds', values);
  };

  const onChangeLanguage = e => onSelectChange(e, 'language');

  const onSwitchHandler = e => {
    onChangeFunction(e.target.id, e.target.checked);
  };

  const onChangeVisibility = (e: React.FormEvent<HTMLElement>) => {
    const visibility = (e.currentTarget as HTMLInputElement).value;
    onChangeFunction('visibility', visibility);
  };

  React.useEffect(() => {
    const { fields } = props.formData;
    if (fields && fields.length > 0) {
      if (
        fields.findIndex(f => f.type === 'productCategory' && f.isRequired) !==
        -1
      ) {
        setRenderPayments(true);
        if (props.waitUntilFinish) {
          props.waitUntilFinish({ optionsStep: true });
        }
      } else {
        setRenderPayments(false);

        if (props.waitUntilFinish) {
          props.waitUntilFinish({ optionsStep: false });
        }
      }
    }

    if (!isEnabled('payment')) {
      setRenderPayments(false);

      if (props.waitUntilFinish) {
        props.waitUntilFinish({ optionsStep: false });
      }
    }
  }, [props.formData.fields]);

  const renderPaymentsComponent = () => {
    if (!isEnabled('payment')) {
      return null;
    }

    if (!renderPayments) {
      return null;
    }

    return (
      <>
        {loadDynamicComponent('extendFormOptions', {
          contentType: 'inbox:integrations',
          contentTypeId: props.integrationId,
          isSubmitted: props.isSubmitted,
          description: __(
            "Choose payment methods you'd like to enable on this form"
          ),
          afterSave: () => {
            if (props.onChildProcessFinished) {
              props.onChildProcessFinished('optionsStep');
            }
          }
        })}
      </>
    );
  };

  return (
    <FlexItem>
      <LeftItem>
        <FormGroup>
          <ControlLabel required={true}>Form Name</ControlLabel>
          <p>
            {__('Name this form to differentiate from the rest internally')}
          </p>

          <FormControl
            id={'popupName'}
            required={true}
            onChange={onChangeTitle}
            value={props.title}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <SelectBrand
            isRequired={true}
            onChange={onChange}
            defaultValue={brand ? brand._id : ' '}
          />
        </FormGroup>

        <SelectChannels
          defaultValue={props.channelIds}
          isRequired={false}
          description="Choose a channel, if you wish to see every new form in your Team Inbox."
          onChange={channelOnChange}
        />

        <FormGroup>
          <ControlLabel required={true}>Visibility</ControlLabel>
          <FormControl
            name="visibility"
            componentClass="select"
            value={props.visibility}
            onChange={onChangeVisibility}
          >
            <option value="public">{__('Public')}</option>
            <option value="private">{__('Private')}</option>
          </FormControl>
        </FormGroup>

        {renderDepartments()}

        <FormGroup>
          <ControlLabel>Language</ControlLabel>
          <Select
            id="language"
            value={language}
            options={LANGUAGES}
            onChange={onChangeLanguage}
            clearable={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Limit to 1 response</ControlLabel>
          <Description>
            Turn on to receive a submission from the visitor only once. Once a
            submission is received, the form will not display again.
          </Description>
          <div>
            <Toggle
              id="isRequireOnce"
              checked={isRequireOnce || false}
              onChange={onSwitchHandler}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </div>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Save as customer</ControlLabel>
          <Description>Forcibly turn lead to customer.</Description>
          <div>
            <Toggle
              id="saveAsCustomer"
              checked={saveAsCustomer || false}
              onChange={onSwitchHandler}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </div>
        </FormGroup>

        {renderPaymentsComponent()}
      </LeftItem>
    </FlexItem>
  );
};

export default OptionStep;
