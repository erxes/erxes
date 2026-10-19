import {
  parseAgentReferences,
  type IAgentReference,
} from '../references/parseAgentReferences';

export interface IHtmlReferenceMount {
  element: HTMLSpanElement;
  reference: IAgentReference;
}

/** Only text tokens become links; model-provided attributes never control navigation. */
export const mountHtmlReferences = (
  document: Document,
): IHtmlReferenceMount[] => {
  const walker = document.createTreeWalker(document.body, 4 /* SHOW_TEXT */);
  const textNodes: Text[] = [];
  let node = walker.nextNode();
  while (node) {
    if (!node.parentElement?.closest('a,pre,code,style,script,svg')) {
      textNodes.push(node as Text);
    }
    node = walker.nextNode();
  }
  const mounts: IHtmlReferenceMount[] = [];
  for (const textNode of textNodes) {
    const segments = parseAgentReferences(textNode.data);
    if (!segments.some((segment) => segment.kind === 'reference')) continue;
    const fragment = document.createDocumentFragment();
    for (const segment of segments) {
      if (segment.kind === 'text') {
        fragment.append(document.createTextNode(segment.text));
      } else {
        const element = document.createElement('span');
        element.className = 'agent-reference';
        fragment.append(element);
        mounts.push({ element, reference: segment.reference });
      }
    }
    textNode.replaceWith(fragment);
  }
  return mounts;
};
