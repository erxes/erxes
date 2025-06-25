import React, { useState, useCallback } from 'react';
import { EnvironmentVariable } from '../../types';
import { Button, FormControl, Icon } from '@erxes/ui/src/components';
import { FlexItem, FlexPad } from '@erxes/ui/src/components/step/styles';
import styled from 'styled-components';
import { removeTypename } from '@erxes/ui/src/utils/core';

type Props = {
  environmentVariables?: EnvironmentVariable[];
  handleFormChange: (name: string, value: any) => void;
};

const EnvRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const ValueWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const EyeButtonWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #888;

  &:hover {
    background: #f5f5f5;
  }
`;

const EnvConfigs = (props: Props) => {
  const { environmentVariables = [], handleFormChange } = props;
  const [envs, setEnvs] = useState<EnvironmentVariable[]>(environmentVariables);
  const [visibleValues, setVisibleValues] = useState<{
    [key: number]: boolean;
  }>({});

  React.useEffect(() => {
    setEnvs(environmentVariables ?? []);
  }, [environmentVariables]);

  const handleAdd = useCallback(() => {
    const newEnv: EnvironmentVariable = {
      key: `KEY_${envs.length + 1}`,
      value: '',
    };
    const newEnvs = [...envs, newEnv];
    setEnvs(newEnvs);
    handleFormChange('environmentVariables', removeTypename(newEnvs));
  }, [envs, handleFormChange]);

  const handleDelete = useCallback(
    (index: number) => {
      const newEnvs = envs.filter((_, i) => i !== index);
      setEnvs(newEnvs);
      handleFormChange('environmentVariables', removeTypename(newEnvs));
    },
    [envs, handleFormChange]
  );

  const handleChange = useCallback(
    (index: number, value: string) => {
      const newEnvs = [...envs];
      newEnvs[index] = { ...newEnvs[index], value };
      setEnvs(newEnvs);
      handleFormChange('environmentVariables', removeTypename(newEnvs));
    },
    [envs, handleFormChange]
  );

  const handleKeyChange = useCallback(
    (index: number, newKey: string) => {
      if (envs[index].key === newKey) return;

      const newEnvs = [...envs];
      newEnvs[index] = { ...newEnvs[index], key: newKey };
      setEnvs(newEnvs);
      handleFormChange('environmentVariables', removeTypename(newEnvs));
    },
    [envs, handleFormChange]
  );

  const toggleValueVisibility = useCallback((index: number) => {
    setVisibleValues((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  return (
    <div>
      {envs.map((env, index) => (
        <EnvRow key={index}>
          <FlexItem>
            <FormControl
              name='key'
              value={env.key}
              onChange={(e: React.FormEvent<HTMLElement>) => {
                const target = e.target as HTMLInputElement;
                handleKeyChange(index, target.value);
              }}
              placeholder='Key'
            />
          </FlexItem>
          <FlexItem>
            <ValueWrapper>
              <FormControl
                name='value'
                value={env.value}
                type={visibleValues[index] ? 'text' : 'password'}
                onChange={(e: React.FormEvent<HTMLElement>) => {
                  const target = e.target as HTMLInputElement;
                  handleChange(index, target.value);
                }}
                placeholder='Value'
              />
              <EyeButtonWrapper>
                <Button
                  btnStyle='link'
                  icon={visibleValues[index] ? 'eye-slash' : 'eye'}
                  onClick={() => toggleValueVisibility(index)}
                />
              </EyeButtonWrapper>
            </ValueWrapper>
          </FlexItem>
          <Button
            btnStyle='danger'
            icon='trash'
            onClick={() => handleDelete(index)}
          />
        </EnvRow>
      ))}
      <FlexPad>
        <Button btnStyle='success' icon='plus' onClick={handleAdd}>
          Add new
        </Button>
      </FlexPad>
    </div>
  );
};

export default EnvConfigs;
