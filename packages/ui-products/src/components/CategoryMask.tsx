import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Flex, FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IProductCategory } from '../types';
import { __ } from '@erxes/ui/src/utils/core';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { TableOver } from '../styles';
import { ActionButton } from '@erxes/ui/src/components/ActionButtons';
import Icon from '@erxes/ui/src/components/Icon';
import { SpaceFormsWrapper } from '@erxes/ui-settings/src/styles';

type Props = {
  parentCategory?: IProductCategory;
  categoryId?: string;
  code: string;
  maskType: string;
  mask: any;
  fieldGroups: IFieldGroup[];
  changeCode: (code: string) => void;
  changeMask: (mask: any) => void;
};

type State = {
  activePerVal: any;
  currentLen: number;
  type: string;
};

class CategoryMask extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activePerVal: {},
      currentLen: 1,
      type: ''
    };
  }

  renderPerHead = (values: any[]) => {
    const { activePerVal } = this.state;
    let start = 1;
    const tds: any = [];

    for (const perVal of values) {
      const len = Number(perVal.len || 0);
      const lim = start + len;
      const isActive = perVal.id === activePerVal.id;

      for (let i = start; i < lim; i++) {
        tds.push(<td className={isActive ? 'active' : ''}>{i}</td>);
      }
      start = lim;
    }

    return tds;
  };

  renderPerBody(perVal, idEdit) {
    const onDelete = () => {
      const { mask, changeMask } = this.props;
      const values = (mask?.values || []).filter(v => v.id !== perVal.id);
      changeMask({ ...mask, values });
    };

    const onEdit = () => {
      this.setState({ activePerVal: perVal });
    };
    return (
      <td colSpan={perVal.len || 1} key={Math.random()}>
        {perVal.static || (
          <>
            {(idEdit && (
              <ActionButton onClick={onDelete}>
                <Icon icon="trash" />
              </ActionButton>
            )) ||
              ''}
            <ActionButton onClick={onEdit}>
              <Icon icon="pencil" />
            </ActionButton>
          </>
        )}
      </td>
    );
  }

  onChangeLen = e => {
    this.setState({ currentLen: e.target.value });
  };

  addMask = () => {
    const { mask, changeMask } = this.props;

    const { currentLen } = this.state;
    const values = mask?.values || [];
    values.push({
      id: Math.random().toString(),
      title: 'None',
      type: 'char',
      len: currentLen
    });
    changeMask({ ...mask, values });
  };

  renderMatch(isEdit) {
    const { fieldGroups } = this.props;
    const { activePerVal } = this.state;
    const { matches = {} } = activePerVal;
    if (!activePerVal?.fieldId) {
      return null;
    }

    const onChange = e => {
      const name = e.target.name;
      const value = e.target.value;
      this.setState({
        activePerVal: {
          ...activePerVal,
          matches: { ...(activePerVal.matches || {}), [name]: value }
        }
      });
    };

    const field = (
      (
        (fieldGroups.find(fg => fg._id === activePerVal.fieldGroup) || {})
          .fields || []
      ).filter(f => ['select', 'checkbox'].includes(f.type)) || []
    ).find(f => f._id === activePerVal.fieldId);

    if (!field?.options) {
      return null;
    }

    return field.options.map(o => (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{o}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <FormControl
            name={o}
            disabled={!isEdit}
            maxLength={activePerVal.len}
            value={matches[o] || ''}
            onChange={onChange}
          />
        </FormColumn>
      </FormWrapper>
    ));
  }

  renderSubForm(isEdit) {
    const { activePerVal } = this.state;
    if (!activePerVal.type) {
      return null;
    }

    const onChange = e => {
      const name = e.target.name;
      const value = e.target.value;
      this.setState({ activePerVal: { ...activePerVal, [name]: value } });
    };

    if (activePerVal.type === 'char') {
      return (
        <FormGroup>
          <ControlLabel>Characters</ControlLabel>

          <FormControl
            name="char"
            disabled={!isEdit}
            maxLength={activePerVal.len}
            value={activePerVal.char}
            onChange={onChange}
          />
        </FormGroup>
      );
    }

    if (activePerVal.type === 'string') {
      return (
        <FormGroup>
          <ControlLabel>Name of String</ControlLabel>

          <FormControl
            name="string"
            disabled={!isEdit}
            value={activePerVal.string}
            onChange={onChange}
          />
        </FormGroup>
      );
    }

    if (activePerVal.type === 'customField') {
      const { fieldGroups } = this.props;
      return (
        <>
          <FormGroup>
            <ControlLabel>Field Group</ControlLabel>
            <FormControl
              name="fieldGroup"
              disabled={!isEdit}
              componentClass="select"
              options={[
                { value: '', label: 'Empty' },
                ...fieldGroups.map(fg => ({
                  value: fg._id,
                  label: `${fg.code} - ${fg.name}`
                }))
              ]}
              value={activePerVal.fieldGroup}
              onChange={onChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Field</ControlLabel>
            <FormControl
              name="fieldId"
              disabled={!isEdit}
              componentClass="select"
              options={[
                { value: '', label: 'Empty' },
                ...(
                  (
                    (
                      fieldGroups.find(
                        fg => fg._id === activePerVal.fieldGroup
                      ) || {}
                    ).fields || []
                  ).filter(f => ['select', 'checkbox'].includes(f.type)) || []
                ).map(f => ({
                  value: f._id,
                  label: `${f.code} - ${f.text}`
                }))
              ]}
              value={activePerVal.fieldId}
              onChange={onChange}
            />
          </FormGroup>
          {this.renderMatch(isEdit)}
        </>
      );
    }

    return <></>;
  }

  saveSubForm = () => {
    const { activePerVal } = this.state;
    const { mask, changeMask } = this.props;

    const values = (mask?.values || []).map(v =>
      v.id === activePerVal.id ? activePerVal : v
    );

    changeMask({ ...mask, values });
    this.setState({ activePerVal: {} });
  };

  renderCurrentConfig(isEdit) {
    const { activePerVal } = this.state;
    if (!activePerVal?.id) {
      return null;
    }

    const changeType = e => {
      const value = e.target.value;
      this.setState({ activePerVal: { ...activePerVal, type: value } });
    };

    return (
      <>
        _________________________________________________
        <SpaceFormsWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Type</ControlLabel>

                <FormControl
                  name="type"
                  componentClass="select"
                  value={this.state.activePerVal?.type}
                  disabled={!isEdit}
                  options={[
                    { value: 'char', label: 'Characters' },
                    { value: 'customField', label: 'Custom properties' }
                    // { value: 'string', label: 'Name of section' }
                  ]}
                  onChange={changeType}
                />
              </FormGroup>
              {this.renderSubForm(isEdit)}
            </FormColumn>
          </FormWrapper>

          {(isEdit && (
            <Button
              btnStyle="success"
              uppercase={false}
              onClick={this.saveSubForm}
              icon="add"
            >
              Save
            </Button>
          )) ||
            ''}
        </SpaceFormsWrapper>
        _________________________________________________
      </>
    );
  }

  renderConfigMask(mask, isEdit = true) {
    const { values = [] } = mask || {};

    return (
      <>
        <FormGroup>
          <ControlLabel>Code mask</ControlLabel>

          <TableOver>
            <tr>
              {this.renderPerHead(values)}
              {(isEdit && (
                <td rowSpan={2}>
                  <Flex>
                    <FormControl
                      name="newMask"
                      type="number"
                      defaultValue={this.state.currentLen}
                      min={0}
                      max={9}
                      required={true}
                      onChange={this.onChangeLen}
                    />

                    <Button
                      btnStyle="success"
                      uppercase={false}
                      onClick={this.addMask}
                      icon="add"
                    />
                  </Flex>
                </td>
              )) ||
                ''}
            </tr>

            <tr>{(values || []).map(v => this.renderPerBody(v, isEdit))}</tr>
          </TableOver>

          {this.renderCurrentConfig(isEdit)}
        </FormGroup>
      </>
    );
  }

  render() {
    const { parentCategory, mask } = this.props;

    if (parentCategory && parentCategory.maskType === 'hard') {
      return this.renderConfigMask(parentCategory.mask, false);
    }

    if (parentCategory && parentCategory.maskType === 'soft') {
      return (
        (mask.isSimilar && this.renderConfigMask(parentCategory.mask, false)) ||
        this.renderConfigMask(mask)
      );
    }

    return this.renderConfigMask(mask);
  }
}

export default CategoryMask;
