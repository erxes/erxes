import React, { useEffect, useState } from 'react';
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
  const { searchText, templates } = suggestionsState;

  const [hoverIndex, setHoverIndex] = useState(0);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      setHoverIndex((hoverIndex + templates.length - 1) % templates.length);
    }
    if (event.key === 'ArrowDown') {
      setHoverIndex((hoverIndex + 1) % templates.length);
    }
    if (event.key === 'Enter') {
      onSelect(hoverIndex);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hoverIndex]);

  if (!templates) {
    return null;
  }

  return (
    <ResponseSuggestions>
      {templates.map((template, index) => {
        const style: any = {};

        if (hoverIndex === index) {
          style.backgroundColor = '#ededfb';
          style.color = 'black';
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
