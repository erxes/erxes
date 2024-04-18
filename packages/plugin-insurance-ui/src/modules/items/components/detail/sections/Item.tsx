import {
  __,
  FieldStyle,
  Sidebar,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src';
import React from 'react';
import { InsuranceItem } from '../../../../../gql/types';
import { filterFieldGroups } from '../../../../../utils';
import Tip from '@erxes/ui/src/components/Tip';

type Props = {
  item: InsuranceItem;
  children?: React.ReactNode;
  fieldsGroups?: any[];
};

const ItemSection = (props: Props) => {
  const { Section } = Sidebar;
  const { item } = props;
  const product = item.product;
  const fieldsGroups = filterFieldGroups(
    props.fieldsGroups,
    item.product?.category?.code
  );

  const fields = fieldsGroups?.reduce((acc, group) => {
    return [...acc, ...group.fields];
  }, []);

  const renderRow = (label, value) => {
    
    return (
      <Tip text={`${label} - ${value}`} placement="auto" key={label}>
        <li>
          <FieldStyle>{__(`${label}`)}</FieldStyle>
          <SidebarCounter>{value || '-'}</SidebarCounter>
        </li>
      </Tip>
    );
  };

  const renderTags = () => {
    const tags = (product as any)?.tags || [];
    if (tags.length === 0) {
      return null;
    }

    return (
      <li>
        <FieldStyle>Аялах бүс</FieldStyle>
        <SidebarCounter>
          {tags.map((tag, index) => (
            <span key={index}>{tag.name}</span>
          ))}
        </SidebarCounter>
      </li>
    );
  }

  const getCustomFieldValue = (fieldId) => {
    const fieldsData = product?.customFieldsData || [];
    const foundFieldId = fieldsData.find((f) => f.field === fieldId);

    return foundFieldId?.value || '-';
  };

  return (
    <Sidebar.Section>
      <Section>
        <SidebarList className="no-link">
          {renderRow('Category', product?.category?.name)}
          {renderRow('Product', product?.name)}
          {renderTags()}
          {renderRow('Хураамжийн хувь', item.feePercent)}
          {renderRow('Хураамж', item.totalFee)}
          {fields.map((field) => {
            return renderRow(field.text, getCustomFieldValue(field._id));
          })}
        </SidebarList>
      </Section>
    </Sidebar.Section>
  );
};

export default ItemSection;
