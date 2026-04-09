export type PdfTemplateStatus = 'draft' | 'published' | 'archived';
export type PdfTemplateVersionStatus = 'active' | 'snapshot';
export type PdfPageOrientation = 'portrait' | 'landscape';
export type PdfUnit = 'px';
export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlign = 'top' | 'middle' | 'bottom';
export type ElementKind =
  | 'text'
  | 'image'
  | 'shape'
  | 'dynamic-text'
  | 'dynamic-stack'
  | 'table';
export type ShapeKind = 'rectangle' | 'circle' | 'line';
export type DynamicSourceScope =
  | 'tour'
  | 'itinerary'
  | 'pricing'
  | 'included'
  | 'excluded'
  | 'hotels'
  | 'transport'
  | 'contact'
  | 'custom';

export interface EditorPoint {
  x: number;
  y: number;
}

export interface EditorSize {
  width: number;
  height: number;
}

export interface EditorFrame extends EditorPoint, EditorSize {
  rotation: number;
}

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageGridSettings {
  enabled: boolean;
  size: number;
  snap: boolean;
}

export interface PdfPageDefinition {
  id: string;
  name: string;
  order: number;
  size: EditorSize;
  orientation: PdfPageOrientation;
  margins: PageMargins;
  background: {
    fill: string;
    imageAssetId?: string;
  };
  grid: PageGridSettings;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 400 | 500 | 600 | 700;
  fontStyle: 'normal' | 'italic';
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textAlign: HorizontalAlign;
  verticalAlign?: VerticalAlign;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface StrokeStyle {
  color: string;
  width: number;
  dash?: number[];
}

export interface BoxStyle {
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  border?: StrokeStyle;
  padding?: Partial<PageMargins>;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
}

export interface AssetReference {
  id: string;
  name: string;
  kind: 'image';
  url: string;
  width?: number;
  height?: number;
  mimeType: string;
  fileSize: number;
  thumbnailUrl?: string;
}

export interface DynamicBinding {
  key: string;
  source: DynamicSourceScope;
  path: string;
  fallback?: string;
  formatter?: 'currency' | 'date' | 'uppercase' | 'lowercase' | 'join';
  formatOptions?: Record<string, string | number | boolean>;
}

interface BaseElement<TKind extends ElementKind, TProps> {
  id: string;
  type: TKind;
  name: string;
  pageId: string;
  frame: EditorFrame;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  box: BoxStyle;
  opacity: number;
  props: TProps;
}

export interface TextElementProps {
  content: string;
  typography: TypographyStyle;
}

export interface DynamicTextElementProps {
  label: string;
  placeholder: string;
  binding: DynamicBinding;
  typography: TypographyStyle;
}

export interface ImageElementProps {
  assetId?: string;
  binding?: DynamicBinding;
  fit: 'cover' | 'contain' | 'fill';
  alt?: string;
}

export interface ShapeElementProps {
  shape: ShapeKind;
  fill: string;
  stroke?: StrokeStyle;
}

export interface DynamicStackElementProps {
  itemBinding: DynamicBinding;
  gap: number;
  direction: 'vertical' | 'horizontal';
  childElementIds: string[];
  maxItems?: number;
}

export interface TableElementProps {
  columns: Array<{
    id: string;
    title: string;
    width: number;
    binding?: DynamicBinding;
  }>;
  rowBinding: DynamicBinding;
  rowHeight: number;
  headerTypography: TypographyStyle;
  cellTypography: TypographyStyle;
}

export type TextElement = BaseElement<'text', TextElementProps>;
export type DynamicTextElement = BaseElement<
  'dynamic-text',
  DynamicTextElementProps
>;
export type ImageElement = BaseElement<'image', ImageElementProps>;
export type ShapeElement = BaseElement<'shape', ShapeElementProps>;
export type DynamicStackElement = BaseElement<
  'dynamic-stack',
  DynamicStackElementProps
>;
export type TableElement = BaseElement<'table', TableElementProps>;

export type PdfTemplateElement =
  | TextElement
  | DynamicTextElement
  | ImageElement
  | ShapeElement
  | DynamicStackElement
  | TableElement;

export interface ReusableBlockDefinition {
  id: string;
  name: string;
  description?: string;
  rootElementIds: string[];
  category:
    | 'hero'
    | 'day-section'
    | 'pricing'
    | 'services'
    | 'hotel'
    | 'transport'
    | 'legal'
    | 'contact';
}

export interface PdfTemplateDocument {
  id: string;
  branchId: string;
  name: string;
  slug: string;
  description?: string;
  status: PdfTemplateStatus;
  version: number;
  versionStatus: PdfTemplateVersionStatus;
  unit: PdfUnit;
  locale: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    surfaceColor: string;
    textColor: string;
    headingFontFamily: string;
    bodyFontFamily: string;
  };
  pages: PdfPageDefinition[];
  elements: PdfTemplateElement[];
  reusableBlocks: ReusableBlockDefinition[];
  assets: AssetReference[];
  bindings: DynamicBinding[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    tags: string[];
    thumbnailUrl?: string;
  };
}

export interface TemplateRenderContext {
  template: PdfTemplateDocument;
  data: Record<string, unknown>;
  assetsById: Record<string, AssetReference>;
}

export interface RenderNode {
  id: string;
  type: PdfTemplateElement['type'];
  pageId: string;
  frame: EditorFrame;
  zIndex: number;
  text?: string;
  imageUrl?: string;
  box: BoxStyle;
  props: Record<string, unknown>;
}

export interface PdfGenerationPayload {
  templateId: string;
  templateVersion?: number;
  data: Record<string, unknown>;
  locale: string;
  timezone: string;
  output: {
    fileName: string;
    pageRange?: string;
    includeBleed: boolean;
  };
}

export interface TemplateThumbnailPayload {
  templateId: string;
  version?: number;
  pageId?: string;
}
