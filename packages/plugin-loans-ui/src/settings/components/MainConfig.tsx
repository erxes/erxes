import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  MainStyleModalFooter as ModalFooter
} from '@erxes/ui/src';
import React, { useState } from 'react';

import { IConfigsMap } from '../types';
import { __ } from 'coreui/utils';

type Props = {
  configsMap: IConfigsMap;
  config: any;
  currentConfigKey: string;
  save: (configsMap: IConfigsMap) => void;
};

const MainConfig = (props: Props) => {
  const [config, setConfig] = useState(props.config || {});
  const { configsMap } = props;

  const onSave = (e) => {
    e.preventDefault();
    configsMap.loansConfig = config;
    props.save(configsMap);
  };

  const onChangeConfig = (code: string, value) => {
    config[code] = value;
    setConfig(config);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeInputNumber = (code: string, e) => {
    onChangeConfig(code, Number(e.target.value));
  };

  const onChangeCheck = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  return (
    <>
      <CollapseContent title={__(config.title)} open={false}>
        <FormGroup>
          <ControlLabel required={true}>{__('Organization type')}</ControlLabel>
          <FormControl
            name="organizationType"
            componentclass="select"
            defaultValue={config['organizationType']}
            onChange={onChangeInput.bind(this, 'organizationType')}
          >
            {['bbsb', 'entity'].map((typeName, index) => (
              <option key={index} value={typeName}>
                {__(typeName)}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Days in the year')}</ControlLabel>
          <FormControl
            defaultValue={config['daysInYear']}
            type="number"
            min={12}
            max={1000}
            onChange={onChangeInputNumber.bind(this, 'daysInYear')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Calculation number fixed')}</ControlLabel>
          <FormControl
            defaultValue={config['calculationFixed']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'calculationFixed')}
            required={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={onSave}
            uppercase={false}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </CollapseContent>

      <CollapseContent title={__('period lock config')} open={false}>
        <FormGroup>
          <ControlLabel required={true}>{__('Period lock type')}</ControlLabel>
          <FormControl
            name="periodLockType"
            componentclass="select"
            defaultValue={config['periodLockType']}
            onChange={onChangeInput.bind(this, 'periodLockType')}
          >
            {['daily', 'endOfMonth', 'manual'].map((typeName, index) => (
              <option key={typeName} value={typeName}>
                {__(typeName)}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Is Store Interest')}</ControlLabel>
          <FormControl
            className="flex-item"
            type="checkbox"
            componentclass="checkbox"
            name="isStoreInterest"
            checked={config['isStoreInterest']}
            onChange={onChangeCheck.bind(this, 'isStoreInterest')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Is Create Invoice')}</ControlLabel>
          <FormControl
            className="flex-item"
            type="checkbox"
            componentclass="checkbox"
            name="isCreateInvoice"
            checked={config['isCreateInvoice']}
            onChange={onChangeCheck.bind(this, 'isCreateInvoice')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Is Change Classification')}</ControlLabel>
          <FormControl
            className="flex-item"
            type="checkbox"
            componentclass="checkbox"
            name="isChangeClassification"
            checked={config['isChangeClassification']}
            onChange={onChangeCheck.bind(this, 'isChangeClassification')}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={onSave}
            uppercase={false}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </CollapseContent>

      <CollapseContent title={__('classification config')} open={false}>
        <FormGroup>
          <ControlLabel>{__('Normal /Day/ ')}</ControlLabel>
          <FormControl
            defaultValue={config['classificationNormal']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'classificationNormal')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Expired /Day/ ')}</ControlLabel>
          <FormControl
            defaultValue={config['classificationExpired']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'classificationExpired')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Doubt /Day/ ')}</ControlLabel>
          <FormControl
            defaultValue={config['classificationDoubt']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'classificationDoubt')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Negative /Day/ ')}</ControlLabel>
          <FormControl
            defaultValue={config['classificationNegative']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'classificationNegative')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Bad /Day/ ')}</ControlLabel>
          <FormControl
            defaultValue={config['classificationBad']}
            type="number"
            min={0}
            max={100}
            onChange={onChangeInputNumber.bind(this, 'classificationBad')}
            required={true}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={onSave}
            uppercase={false}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </CollapseContent>
      <CollapseContent title={__('internet bank config')} open={false}>
        <FormGroup>
          <ControlLabel>{__('Loan give limit')}</ControlLabel>
          <FormControl
            defaultValue={config['loanGiveLimit']}
            type="number"
            onChange={onChangeInputNumber.bind(this, 'loanGiveLimit')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Loan give account type')}</ControlLabel>
          <FormControl
            name="loanGiveAccountType"
            componentclass="select"
            defaultValue={config['loanGiveAccountType']}
            onChange={onChangeInput.bind(this, 'loanGiveAccountType')}
          >
            {['khanbank', 'golomt'].map((typeName, index) => (
              <option key={typeName} value={typeName}>
                {__(typeName)}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Loan give account number')}</ControlLabel>
          <FormControl
            defaultValue={config['loanGiveAccountNumber']}
            type="number"
            onChange={onChangeInputNumber.bind(this, 'loanGiveAccountNumber')}
            required={true}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="primary"
            icon="check-circle"
            onClick={onSave}
            uppercase={false}
          >
            {__('Save')}
          </Button>
        </ModalFooter>
      </CollapseContent>
    </>
  );
};
export default MainConfig;
