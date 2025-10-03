import {
  IconBrandAws,
  IconBrandAzure,
  IconBrandCloudflare,
  IconBrandGoogle,
  IconDeviceLaptop,
} from '@tabler/icons-react';

import { fileMimeTypes } from '@/settings/file-upload/types';

export const UPLOAD_SERVICE_DATA = [
  {
    label: 'Local',
    value: 'local',
    icon: IconDeviceLaptop,
  },
  {
    label: 'Amazon Web Service',
    value: 'AWS',
    icon: IconBrandAws,
  },
  {
    label: 'Google Cloud Service',
    value: 'GCS',
    icon: IconBrandGoogle,
  },
  {
    label: 'Cloudflare',
    value: 'CLOUDFLARE',
    icon: IconBrandCloudflare,
  },
  {
    label: 'Azure Storage',
    value: 'AZURE',
    icon: IconBrandAzure,
  },
];

export const FILE_MIME_TYPES: fileMimeTypes[] = [
  {
    value: 'image/gif',
    label: 'Graphics Interchange Format',
    extension: '.gif',
  },
  {
    value: 'image/vnd.microsoft.icon',
    label: 'Icon format',
    extension: '.ico',
  },
  {
    value: 'image/tiff',
    label: 'Tagged Image File Format',
    extension: '.tif',
  },
  {
    value: 'image/jpeg',
    label: 'JPEG image',
    extension: '.jpeg',
  },
  {
    value: 'image/bmp',
    label: 'Windows OS/2 Bitmap Graphics',
    extension: '.bmp',
  },
  {
    value: 'image/png',
    label: 'Portable Network Graphics',
    extension: '.png',
  },
  {
    value: 'image/svg+xml',
    label: 'Scalable Vector Graphics',
    extension: '.svg',
  },
  {
    value: 'image/webp',
    label: 'WEBP image',
    extension: '.webp',
  },
  {
    value: 'image/heic',
    label: 'High Efficiency Image Coding',
    extension: '.heic',
  },
  {
    value: 'image/heif',
    label: 'High Efficiency Image Format',
    extension: '.heif',
  },
  // documents
  {
    value: 'text/csv',
    label: 'Comma-separated values',
    extension: '.csv',
  },
  {
    value: 'application/msword',
    label: 'Microsoft Word',
    extension: '.doc',
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Microsoft Word (OpenXML)',
    extension: '.docx',
  },
  {
    value: 'application/vnd.ms-excel',
    label: 'Microsoft Excel',
    extension: '.xls',
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Microsoft Excel OpenXML',
    extension: '.xlsx',
  },
  {
    value: 'application/vnd.ms-powerpoint',
    label: 'Microsoft PowerPoint',
    extension: '.ppt',
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    label: 'Microsoft PowerPoint (OpenXML)',
    extension: '.pptx',
  },
  {
    value: 'application/vnd.oasis.opendocument.presentation',
    label: 'OpenDocument presentation document',
    extension: '.odp',
  },
  {
    value: 'application/vnd.oasis.opendocument.spreadsheet',
    label: 'OpenDocument spreadsheet document',
    extension: '.ods',
  },
  {
    value: 'application/vnd.oasis.opendocument.text',
    label: 'OpenDocument text document',
    extension: '.odt',
  },
  {
    value: 'application/pdf',
    label: 'Adobe Portable Document Format',
    extension: '.pdf',
  },
  {
    value: 'application/rtf',
    label: 'Rich Text Format',
    extension: '.rtf',
  },
  {
    value: 'text/plain',
    label: 'Plain text',
    extension: '.txt',
  },
  {
    value: 'application/haansoft-hwp',
    label: 'Hanword Document (HWP)',
    extension: '.hwp',
  },
  {
    value: 'application/haansoft-hwpml',
    label: 'Hanword Document (HWPX)',
    extension: '.hwpx',
  },
  // media
  {
    value: 'audio/aac',
    label: 'AAC audio',
    extension: '.aac',
  },
  {
    value: 'audio/mpeg',
    label: 'MP3 audio',
    extension: '.mp3',
  },
  {
    value: 'audio/ogg',
    label: 'OGG audio',
    extension: '.oga',
  },
  {
    value: 'audio/3gpp',
    label: '3GPP audio/video container',
    extension: '.3gpp',
  },
  {
    value: 'audio/3gpp2',
    label: '3GPP audio/video container',
    extension: '.3gpp2',
  },
  {
    value: 'video/mpeg',
    label: 'MPEG video',
    extension: '.mpeg',
  },
  {
    value: 'video/ogg',
    label: 'OGG video',
    extension: '.ogv',
  },
  {
    value: 'video/mp4',
    label: 'MP4 video',
    extension: '.mp4',
  },
  {
    value: 'video/webm',
    label: 'WebM video',
    extension: '.webm',
  },
  {
    value: 'audio/wav',
    label: 'WAV audio',
    extension: '.wav',
  },
  {
    value: 'audio/vnd.wave',
    label: 'WAV vnd audio',
    extension: '.wav',
  },
  {
    value: 'audio/m4a',
    label: 'MPEG-4 Audio',
    extension: '.m4a',
  },
  // archives
  {
    value: 'application/vnd.rar',
    label: 'RAR archive',
    extension: '.rar',
  },
  {
    value: 'application/x-tar',
    label: 'Tape archive',
    extension: '.tar',
  },
  {
    value: 'application/x-7z-compressed',
    label: '7-zip archive',
    extension: '.7z',
  },
  {
    value: 'application/gzip',
    label: 'GZip Compressed Archive',
    extension: '.gz',
  },
];

export const FILE_SYSTEM_TYPES = [
  { label: 'Public', value: 'true' },
  { label: 'Private', value: 'false' },
];
