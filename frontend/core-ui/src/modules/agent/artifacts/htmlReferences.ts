import {
  bindAgentReferenceHandles,
  referenceIdentity,
  EMPTY_REFERENCE_REGISTRY,
  type IAgentReferenceRegistry,
} from '../references/referenceRegistry';
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
  registry: IAgentReferenceRegistry = EMPTY_REFERENCE_REGISTRY,
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
    const segments = parseAgentReferences(
      bindAgentReferenceHandles(textNode.data, registry),
    );
    if (!segments.some((segment) => segment.kind === 'reference')) {
      textNode.data = segments
        .map((segment) => (segment.kind === 'text' ? segment.text : ''))
        .join('');
      continue;
    }
    const fragment = document.createDocumentFragment();
    for (const segment of segments) {
      if (segment.kind === 'text') {
        fragment.append(document.createTextNode(segment.text));
      } else {
        const canonical = registry.byIdentity.get(
          referenceIdentity(segment.reference),
        );
        if (!canonical) {
          fragment.append(document.createTextNode(segment.reference.label));
          continue;
        }
        const element = document.createElement('span');
        element.className = 'agent-reference';
        fragment.append(element);
        mounts.push({ element, reference: canonical });
      }
    }
    textNode.replaceWith(fragment);
  }
  return mounts;
};
