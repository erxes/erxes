import type {
  PdfGenerationPayload,
  PdfTemplateDocument,
  TemplateThumbnailPayload,
} from '../template.types';

export interface CreateTemplateRequest {
  branchId: string;
  name: string;
  description?: string;
}

export interface UpdateTemplateRequest {
  template: PdfTemplateDocument;
}

export interface DuplicateTemplateRequest {
  name?: string;
}

export interface AssetUploadRequest {
  branchId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface TemplateResponse {
  template: PdfTemplateDocument;
}

export interface TemplateListResponse {
  templates: PdfTemplateDocument[];
}

export interface AssetUploadResponse {
  assetId: string;
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
}

export interface ThumbnailResponse {
  templateId: string;
  thumbnailUrl: string;
}

export interface PdfResponse {
  templateId: string;
  jobId: string;
  status: 'queued' | 'completed';
  downloadUrl?: string;
}

export type GeneratePdfRequest = PdfGenerationPayload;
export type GenerateThumbnailRequest = TemplateThumbnailPayload;
