import highlighter from 'fuzzysearch-highlight';
import strip from 'strip';
import xss from 'xss';

import { ResponseSuggestionItem, ResponseSuggestions } from '@erxes/ui-inbox/src/inbox/styles';
import React from 'react';

import { IResponseTemplate } from '../../../../settings/responseTemplates/types';

type TemplateListProps = {
  suggestionsState: {
    selectedIndex: number;
    searchText: string;
    templates: IResponseTemplate[];
  };
  onSelect: (index: number) => void;
};

// response templates
export default class TemplateList extends React.Component<
  TemplateListProps,
  {}
> {
  normalizeIndex(selectedIndex: number, max: number) {
    let index = selectedIndex % max;

    if (index < 0) {
      index += max;
    }

    return index;
  }

  render() {
    const { suggestionsState, onSelect } = this.props;

    const { selectedIndex, searchText, templates } = suggestionsState;

    if (!templates) {
      return null;
    }

    const normalizedIndex = this.normalizeIndex(
      selectedIndex,
      templates.length
    );

    return (
      <ResponseSuggestions>
        {templates.map((template, index) => {
          const style: any = {};

          if (normalizedIndex === index) {
            style.backgroundColor = '#5629B6';
            style.color = '#ffffff';
          }

          const onClick = () => onSelect(index);

          return (
            <ResponseSuggestionItem
              key={template._id}
              onClick={onClick}
              style={style}
            >
              <span
                style={{ fontWeight: 'bold' }}
                dangerouslySetInnerHTML={{
                  __html: xss(highlighter(searchText, template.name))
                }}
              />{' '}
              <span
                dangerouslySetInnerHTML={{
                  __html: xss(highlighter(searchText, strip(template.content)))
                }}
              />
            </ResponseSuggestionItem>
          );
        }, this)}
      </ResponseSuggestions>
    );
  }
}
