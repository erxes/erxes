import React from 'react';
import strip from 'strip';
import xss from 'xss';

import {
  ResponseSuggestionItem,
  ResponseSuggestions,
} from '@erxes/ui-inbox/src/inbox/styles';

import getHighlightedText from './getHighlightedText';
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
const TemplateList = (props: TemplateListProps) => {
  const { suggestionsState, onSelect } = props;

  function normalizeIndex(selectedIndex: number, max: number) {
    let index = selectedIndex % max;

    if (index < 0) {
      index += max;
    }

    return index;
  }

  const { selectedIndex, searchText, templates } = suggestionsState;

  if (!templates) {
    return null;
  }

  const normalizedIndex = normalizeIndex(selectedIndex, templates.length);

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
            <span style={{ fontWeight: 'bold' }}>
              {getHighlightedText(xss(template.name), searchText)}
            </span>{' '}
            <span>
              {getHighlightedText(xss(strip(template.content)), searchText)}
            </span>
          </ResponseSuggestionItem>
        );
      }, this)}
    </ResponseSuggestions>
  );
};

export default TemplateList;
