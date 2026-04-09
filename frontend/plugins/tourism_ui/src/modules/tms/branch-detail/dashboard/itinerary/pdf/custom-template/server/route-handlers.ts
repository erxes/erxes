import { createBlankTemplate } from '../template.defaults';
import type { PdfTemplateDocument } from '../template.types';
import type {
  AssetUploadRequest,
  AssetUploadResponse,
  CreateTemplateRequest,
  DuplicateTemplateRequest,
  GeneratePdfRequest,
  GenerateThumbnailRequest,
  PdfResponse,
  TemplateResponse,
  ThumbnailResponse,
  UpdateTemplateRequest,
} from './api.contracts';
import { TravelPdfRenderService, type PdfRepository } from './pdf.service';

export interface TemplatePersistenceAdapter extends PdfRepository {
  createTemplate: (
    template: PdfTemplateDocument,
  ) => Promise<PdfTemplateDocument>;
  updateTemplate: (
    template: PdfTemplateDocument,
  ) => Promise<PdfTemplateDocument>;
}

export const createTemplateRoute =
  (adapter: TemplatePersistenceAdapter, userId: string) =>
  async (request: CreateTemplateRequest): Promise<TemplateResponse> => {
    const template = createBlankTemplate({
      branchId: request.branchId,
      userId,
      name: request.name,
    });

    template.description = request.description;

    return {
      template: await adapter.createTemplate(template),
    };
  };

export const updateTemplateRoute =
  (adapter: TemplatePersistenceAdapter) =>
  async (request: UpdateTemplateRequest): Promise<TemplateResponse> => ({
    template: await adapter.updateTemplate(request.template),
  });

export const getTemplateRoute =
  (adapter: TemplatePersistenceAdapter) =>
  async (templateId: string): Promise<TemplateResponse> => ({
    template: await adapter.getTemplateById(templateId),
  });

export const duplicateTemplateRoute =
  (adapter: TemplatePersistenceAdapter, userId: string) =>
  async (
    templateId: string,
    request: DuplicateTemplateRequest,
  ): Promise<TemplateResponse> => {
    const source = await adapter.getTemplateById(templateId);
    const duplicated: PdfTemplateDocument = {
      ...source,
      id: `${source.id}-copy`,
      name: request.name || `${source.name} Copy`,
      slug: `${source.slug}-copy`,
      version: 1,
      metadata: {
        ...source.metadata,
        createdBy: userId,
        updatedBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    return {
      template: await adapter.createTemplate(duplicated),
    };
  };

export const uploadAssetRoute = async (
  request: AssetUploadRequest,
): Promise<AssetUploadResponse> => ({
  assetId: `asset-${Date.now()}`,
  uploadUrl: `/uploads/presigned/${request.branchId}/${request.fileName}`,
  publicUrl: `/media/${request.branchId}/${request.fileName}`,
  expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
});

export const generateThumbnailRoute =
  (service: TravelPdfRenderService) =>
  async (request: GenerateThumbnailRequest): Promise<ThumbnailResponse> => {
    const result = await service.generateThumbnail(request);

    return {
      templateId: result.templateId,
      thumbnailUrl: `/thumbnails/${result.templateId}/${result.pageId}.webp`,
    };
  };

export const generatePdfRoute =
  (service: TravelPdfRenderService) =>
  async (request: GeneratePdfRequest): Promise<PdfResponse> => {
    const result = await service.generatePdf(request);

    return {
      templateId: result.templateId,
      jobId: `pdf-job-${Date.now()}`,
      status:
        result.recommendedQueue === 'background-worker'
          ? 'queued'
          : 'completed',
      downloadUrl:
        result.recommendedQueue === 'background-worker'
          ? undefined
          : `/pdf/${result.templateId}/latest.pdf`,
    };
  };
