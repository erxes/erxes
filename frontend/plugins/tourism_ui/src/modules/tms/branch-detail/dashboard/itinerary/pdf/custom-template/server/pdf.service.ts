import { mapTemplateToRenderNodes } from '../templateMapper';
import type {
  PdfGenerationPayload,
  PdfTemplateDocument,
  TemplateRenderContext,
  TemplateThumbnailPayload,
} from '../template.types';

export type PdfEngine = 'puppeteer-html' | 'react-pdf';

export interface PdfRepository {
  getTemplateById: (
    templateId: string,
    version?: number,
  ) => Promise<PdfTemplateDocument>;
}

export class TravelPdfRenderService {
  constructor(
    private readonly repository: PdfRepository,
    private readonly engine: PdfEngine = 'puppeteer-html',
  ) {}

  async generatePdf(payload: PdfGenerationPayload) {
    const template = await this.repository.getTemplateById(
      payload.templateId,
      payload.templateVersion,
    );

    const context: TemplateRenderContext = {
      template,
      data: payload.data,
      assetsById: Object.fromEntries(
        template.assets.map((asset) => [asset.id, asset]),
      ),
    };

    const renderNodes = mapTemplateToRenderNodes(context);

    return {
      templateId: template.id,
      engine: this.engine,
      nodeCount: renderNodes.length,
      recommendedQueue:
        renderNodes.length > 100 ? 'background-worker' : 'inline',
    };
  }

  async generateThumbnail(payload: TemplateThumbnailPayload) {
    const template = await this.repository.getTemplateById(
      payload.templateId,
      payload.version,
    );

    return {
      templateId: template.id,
      pageId: payload.pageId || template.pages[0]?.id,
      engine: this.engine,
      recommendedFormat: 'webp',
    };
  }
}
