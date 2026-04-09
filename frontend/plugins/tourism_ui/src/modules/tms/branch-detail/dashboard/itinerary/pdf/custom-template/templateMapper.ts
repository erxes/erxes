import { resolveBindingPath, resolveDynamicBinding } from './dataResolver';
import type {
  DynamicStackElement,
  PdfTemplateDocument,
  PdfTemplateElement,
  RenderNode,
  TemplateRenderContext,
} from './template.types';

const mapElementToNode = (
  element: PdfTemplateElement,
  context: TemplateRenderContext,
): RenderNode => {
  if (element.type === 'dynamic-text') {
    return {
      id: element.id,
      type: element.type,
      pageId: element.pageId,
      frame: element.frame,
      zIndex: element.zIndex,
      text: resolveDynamicBinding({
        binding: element.props.binding,
        data: context.data,
        locale: context.template.locale,
      }),
      box: element.box,
      props: element.props as unknown as Record<string, unknown>,
    };
  }

  if (element.type === 'image') {
    const boundImageUrl = element.props.binding
      ? resolveBindingPath(context.data, element.props.binding.path)
      : undefined;

    return {
      id: element.id,
      type: element.type,
      pageId: element.pageId,
      frame: element.frame,
      zIndex: element.zIndex,
      imageUrl:
        (typeof boundImageUrl === 'string' ? boundImageUrl : undefined) ||
        (element.props.assetId
          ? context.assetsById[element.props.assetId]?.url
          : undefined),
      box: element.box,
      props: element.props as unknown as Record<string, unknown>,
    };
  }

  if (element.type === 'text') {
    return {
      id: element.id,
      type: element.type,
      pageId: element.pageId,
      frame: element.frame,
      zIndex: element.zIndex,
      text: element.props.content,
      box: element.box,
      props: element.props as unknown as Record<string, unknown>,
    };
  }

  return {
    id: element.id,
    type: element.type,
    pageId: element.pageId,
    frame: element.frame,
    zIndex: element.zIndex,
    box: element.box,
    props: element.props as unknown as Record<string, unknown>,
  };
};

const expandDynamicStack = (
  element: DynamicStackElement,
  template: PdfTemplateDocument,
  data: Record<string, unknown>,
): RenderNode[] => {
  const value = resolveBindingPath(data, element.props.itemBinding.path);
  const items = Array.isArray(value) ? value : [];
  const limitedItems = element.props.maxItems
    ? items.slice(0, element.props.maxItems)
    : items;

  return limitedItems.flatMap((_, itemIndex) =>
    element.props.childElementIds
      .map((childId) =>
        template.elements.find((candidate) => candidate.id === childId),
      )
      .filter((child): child is PdfTemplateElement => Boolean(child))
      .map((child) => ({
        id: `${child.id}-${itemIndex}`,
        type: child.type,
        pageId: child.pageId,
        frame: {
          ...child.frame,
          y:
            child.frame.y +
            itemIndex * (child.frame.height + element.props.gap),
        },
        zIndex: child.zIndex,
        text:
          child.type === 'dynamic-text'
            ? child.props.placeholder
            : child.type === 'text'
            ? child.props.content
            : undefined,
        box: child.box,
        props: {
          ...child.props,
          stackIndex: itemIndex,
        },
      })),
  );
};

export const mapTemplateToRenderNodes = (
  context: TemplateRenderContext,
): RenderNode[] => {
  const assetsById = Object.fromEntries(
    context.template.assets.map((asset) => [asset.id, asset]),
  );

  const nextContext = {
    ...context,
    assetsById,
  };

  return context.template.elements
    .flatMap((element) =>
      element.type === 'dynamic-stack'
        ? expandDynamicStack(element, context.template, context.data)
        : mapElementToNode(element, nextContext),
    )
    .sort((left, right) => left.zIndex - right.zIndex);
};
