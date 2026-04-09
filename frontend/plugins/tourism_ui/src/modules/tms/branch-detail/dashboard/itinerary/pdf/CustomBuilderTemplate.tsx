import React, { useMemo } from 'react';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import type { IBranchPDFData, IItineraryPDFData } from './types';
import { COLORS, styles } from './styles';
import {
  buildCustomTemplateData,
  mapTemplateToRenderNodes,
} from './custom-template';
import type {
  PdfTemplateDocument,
  RenderNode,
} from './custom-template/template.types';

const renderNode = (node: RenderNode) => {
  const nodeProps = node.props as Record<string, unknown>;
  const frameStyle = {
    position: 'absolute' as const,
    left: node.frame.x,
    top: node.frame.y,
    width: node.frame.width,
    height: node.frame.height,
    opacity: node.box.opacity ?? 1,
    transform: `rotate(${node.frame.rotation}deg)`,
    backgroundColor: node.box.backgroundColor,
    borderRadius: node.box.borderRadius,
    paddingTop: node.box.padding?.top ?? 0,
    paddingRight: node.box.padding?.right ?? 0,
    paddingBottom: node.box.padding?.bottom ?? 0,
    paddingLeft: node.box.padding?.left ?? 0,
  };

  if (node.type === 'image') {
    return node.imageUrl ? (
      <Image
        key={node.id}
        src={node.imageUrl}
        style={{
          ...frameStyle,
          objectFit:
            nodeProps.fit === 'contain' || nodeProps.fit === 'fill'
              ? nodeProps.fit
              : 'cover',
        }}
      />
    ) : (
      <View
        key={node.id}
        style={[
          frameStyle,
          {
            borderWidth: 1,
            borderColor: '#ddd6ce',
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f5f1',
          },
        ]}
      >
        <Text style={{ fontSize: 10, color: '#8a8178' }}>Image slot</Text>
      </View>
    );
  }

  if (node.type === 'shape') {
    const fill =
      typeof nodeProps.fill === 'string' ? nodeProps.fill : '#f3f4f6';

    return (
      <View key={node.id} style={[frameStyle, { backgroundColor: fill }]} />
    );
  }

  const typography =
    node.type === 'text' || node.type === 'dynamic-text'
      ? (nodeProps.typography as Record<string, unknown>)
      : undefined;
  const fontStyle = typography?.fontStyle === 'italic' ? 'italic' : 'normal';
  const textAlign =
    typography?.textAlign === 'center' ||
    typography?.textAlign === 'right' ||
    typography?.textAlign === 'justify'
      ? typography.textAlign
      : 'left';
  const textTransform =
    typography?.textTransform === 'uppercase' ||
    typography?.textTransform === 'lowercase' ||
    typography?.textTransform === 'capitalize'
      ? typography.textTransform
      : undefined;

  return (
    <Text
      key={node.id}
      style={[
        frameStyle,
        {
          fontSize:
            typeof typography?.fontSize === 'number' ? typography.fontSize : 12,
          fontWeight:
            typeof typography?.fontWeight === 'number'
              ? String(typography.fontWeight)
              : 'normal',
          fontStyle,
          lineHeight:
            typeof typography?.lineHeight === 'number'
              ? typography.lineHeight
              : 1.5,
          letterSpacing:
            typeof typography?.letterSpacing === 'number'
              ? typography.letterSpacing
              : 0,
          color:
            typeof typography?.color === 'string'
              ? typography.color
              : COLORS.text,
          textAlign,
          textTransform,
        },
      ]}
    >
      {node.text || ''}
    </Text>
  );
};

export const CustomBuilderTemplatePage: React.FC<{
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  templateDocument?: PdfTemplateDocument;
}> = React.memo(function CustomBuilderTemplatePage({
  itinerary,
  branch,
  templateDocument,
}) {
  const primaryColor = itinerary.color || COLORS.primary;
  const title = itinerary.name || 'Custom Itinerary';
  const renderNodesByPage = useMemo(() => {
    if (!templateDocument) {
      return {};
    }

    const data = buildCustomTemplateData(itinerary, branch);
    const nodes = mapTemplateToRenderNodes({
      template: templateDocument,
      data,
      assetsById: Object.fromEntries(
        templateDocument.assets.map((asset) => [asset.id, asset]),
      ),
    });

    return nodes.reduce<Record<string, RenderNode[]>>((acc, node) => {
      acc[node.pageId] = acc[node.pageId] || [];
      acc[node.pageId].push(node);
      return acc;
    }, {});
  }, [branch, itinerary, templateDocument]);

  if (!templateDocument) {
    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          {branch?.mainLogoBase64 ? (
            <Image src={branch.mainLogoBase64} style={styles.pageHeaderLogo} />
          ) : null}
          <Text style={styles.pageHeaderTitle}>CUSTOM BUILDER</Text>
          <View
            style={[
              styles.pageHeaderDivider,
              { backgroundColor: primaryColor },
            ]}
          />
        </View>

        <View
          style={{
            marginTop: 72,
            borderWidth: 1,
            borderColor: '#e6ddd4',
            borderStyle: 'dashed',
            borderRadius: 12,
            padding: 28,
            gap: 14,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: COLORS.text,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Text>
          <Text style={{ fontSize: 11, color: COLORS.text, lineHeight: 1.7 }}>
            Open the Custom Builder editor, save your layout, then refresh this
            preview to see the generated PDF.
          </Text>
        </View>
      </Page>
    );
  }

  return (
    <>
      {templateDocument.pages
        .sort((left, right) => left.order - right.order)
        .map((page) => (
          <Page
            key={page.id}
            size={[page.size.width, page.size.height]}
            style={{
              position: 'relative',
              backgroundColor: page.background.fill,
            }}
          >
            {(renderNodesByPage[page.id] || []).map((node) => renderNode(node))}
          </Page>
        ))}
    </>
  );
});
