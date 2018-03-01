import React from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarContent } from 'modules/layout/styles';
import { GenerateField } from 'modules/settings/properties/components';

const propTypes = {
  data: PropTypes.object.isRequired,
  fieldsGroups: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

function CustomProperties({ data, fieldsGroups, onChange }) {
  const { Section } = Sidebar;

  return fieldsGroups.map(fieldGroup => {
    if (!fieldGroup.isVisible) return null;

    return (
      <Section key={fieldGroup._id}>
        <Section.Title>{fieldGroup.name}</Section.Title>

        <SidebarContent>
          {fieldGroup.fields.map((field, index) => {
            if (!field.isVisible) return null;

            return (
              <GenerateField
                field={field}
                name={field._id}
                key={index}
                onValueChange={({ _id, value }) => onChange({ _id, value })}
                defaultValue={
                  data.customFieldsData ? data.customFieldsData[field._id] : ''
                }
              />
            );
          })}
        </SidebarContent>
      </Section>
    );
  });
}

CustomProperties.propTypes = propTypes;

export default CustomProperties;
