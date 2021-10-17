import {
  __,
  Info,
  Icon,
  FormGroup,
  FormControl,
  Button,
  CollapseContent
} from 'erxes-ui';
import React, { useEffect, useState } from 'react';
import { IProductGroup } from '../../types';

type Props = {
  onFieldChange: (
    name: string,
    value: string | boolean | string[] | IProductGroup[]
  ) => void;
  groups: IProductGroup[];
  currentGroup: IProductGroup;
};

function ProductGroups(props: Props) {
  const { groups } = props;

  // const [categories, setCategories] = useState(currentGroup.categories || []);

  // useEffect(() => {
  //   onFieldChange('categories', categories);
  // }, [categories, onFieldChange]);

  // const onChangeLogicAction = e =>
  // onFieldChange('logicAction', e.currentTarget.value);

  // const onChangeLogic = (name, value, index) => {
  //   // find current editing one
  //   const currentLogic = logics.find((l, i) => i === index);

  //   // set new value
  //   if (currentLogic) {
  //     currentLogic[name] = value;
  //   }

  //   setLogics(logics);
  //   onFieldChange('logics', logics);
  // };

  const renderContent = (group: IProductGroup) => {
    return (
      <CollapseContent title={group.name} description={group.description}>
        <FormGroup>
          <FormControl
            value={group.name}
            // onChange={this.handleInputChange}
          />

          <FormControl
            name="description"
            componentClass="textarea"
            rows={5}
            defaultValue={group.description}
          />
        </FormGroup>
      </CollapseContent>
    );
  };

  return (
    <>
      <Info>
        {__(
          'Create rules to show or hide this element depending on the values of other fields'
        )}
      </Info>
      {groups.map(group => renderContent(group))}
    </>
  );
}

export default ProductGroups;
