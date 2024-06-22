import React, { Fragment } from 'react';
import Select, {
  type DropdownIndicatorProps,
  components,
  MenuProps,
} from 'react-select';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import Icon from '../../Icon';
import { getReactSelectStyle } from './styles';

const transformToGroupedOptions = (data: any) => {
  const groups = {};

  data?.forEach((item: { value?: string; name: string }) => {
    const groupKey = item?.value?.includes('.')
      ? item.value.split('.')[0]
      : 'General';
    if (!groups[groupKey]) {
      groups[groupKey] = {
        label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
        options: [],
      };
    }
    groups[groupKey].options.push({ label: item.name, value: item.value });
  });

  return Object.values(groups);
};

const MoreIcon = () => <Icon icon="angle-down" />;

const DropdownIndicator: React.FC<DropdownIndicatorProps> = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <MoreIcon />
    </components.DropdownIndicator>
  );
};

const Menu = (props: MenuProps<any>) => {
  return (
    <Fragment>
      <components.Menu {...props}>{props.children}</components.Menu>
    </Fragment>
  );
};
export const RichTextEditorPlaceholderControl = ({ placeholderProp }) => {
  const { editor, isSourceEnabled } = useRichTextEditorContext();

  const handlePlaceholder = (placeholderValue: string) => {
    editor?.chain().focus().insertContent(`{{ ${placeholderValue} }}`).run();
  };

  const groupedOptions = transformToGroupedOptions(placeholderProp?.items);

  return (
    <Select
      value={placeholderProp?.title}
      placeholder="Attributes"
      isMulti={false}
      isSearchable={false}
      menuPlacement="auto"
      maxMenuHeight={200}
      onChange={(val: any) => handlePlaceholder(val.value)}
      options={groupedOptions}
      isDisabled={isSourceEnabled}
      components={{
        DropdownIndicator,
        Menu,
      }}
      menuPortalTarget={document.body}
      styles={getReactSelectStyle(isSourceEnabled)}
    />
  );
};
