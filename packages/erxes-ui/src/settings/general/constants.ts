import { __ } from '@erxes/ui/src/utils';

export const LANGUAGES = [
  { label: 'Albanian', value: 'sq' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Bengali', value: 'bn' },
  { label: 'Bulgarian', value: 'bg' },
  { label: 'Chinese', value: 'zh_CN' },
  { label: 'Czech', value: 'cs' },
  { label: 'Dutch', value: 'nl' },
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Indonesian', value: 'id_ID' },
  { label: 'Italian', value: 'it' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Javanese', value: 'jv' },
  { label: 'Kazakh', value: 'kk' },
  { label: 'Korean', value: 'ko' },
  { label: 'Marathi', value: 'mr' },
  { label: 'Mongolian', value: 'mn' },
  { label: 'Persian', value: 'fa_IR' },
  { label: 'Polish', value: 'pl_PL' },
  { label: 'Portuguese', value: 'pt_BR' },
  { label: 'Punjabi', value: 'pa' },
  { label: 'Romanian', value: 'ro' },
  { label: 'Russian', value: 'ru' },
  { label: 'Serbian', value: 'en_RS' },
  { label: 'Spanish', value: 'es' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Telugu', value: 'te' },
  { label: 'Turkish', value: 'tr_TR' },
  { label: 'Ukrainian', value: 'uk_UA' },
  { label: 'Urdu', value: 'ur_PK' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Yiddish', value: 'yi' }
];

export const FILE_MIME_TYPES = [
  // images
  {
    value: 'image/gif',
    label: 'Graphics Interchange Format',
    extension: '.gif'
  },
  {
    value: 'image/vnd.microsoft.icon',
    label: 'Icon format',
    extension: '.ico'
  },
  {
    value: 'image/tiff',
    label: 'Tagged Image File Format',
    extension: '.tif'
  },
  {
    value: 'image/jpeg',
    label: 'JPEG image',
    extension: '.jpeg'
  },
  {
    value: 'image/bmp',
    label: 'Windows OS/2 Bitmap Graphics',
    extension: '.bmp'
  },
  {
    value: 'image/png',
    label: 'Portable Network Graphics',
    extension: '.png'
  },
  {
    value: 'image/svg+xml',
    label: 'Scalable Vector Graphics',
    extension: '.svg'
  },
  {
    value: 'image/webp',
    label: 'WEBP image',
    extension: '.webp'
  },
  {
    value: 'image/heic',
    label: 'High Efficiency Image Coding',
    extension: '.heic'
  },
  {
    value: 'image/heif',
    label: 'High Efficiency Image Format',
    extension: '.heif'
  },
  // documents
  {
    value: 'text/csv',
    label: 'Comma-separated values',
    extension: '.csv'
  },
  {
    value: 'application/msword',
    label: 'Microsoft Word',
    extension: '.doc'
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'Microsoft Word (OpenXML)',
    extension: '.docx'
  },
  {
    value: 'application/vnd.ms-excel',
    label: 'Microsoft Excel',
    extension: '.xls'
  },
  {
    value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    label: 'Microsoft Excel OpenXML',
    extension: '.xlsx'
  },
  {
    value: 'application/vnd.ms-powerpoint',
    label: 'Microsoft PowerPoint',
    extension: '.ppt'
  },
  {
    value:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    label: 'Microsoft PowerPoint (OpenXML)',
    extension: '.pptx'
  },
  {
    value: 'application/vnd.oasis.opendocument.presentation',
    label: 'OpenDocument presentation document',
    extension: '.odp'
  },
  {
    value: 'application/vnd.oasis.opendocument.spreadsheet',
    label: 'OpenDocument spreadsheet document',
    extension: '.ods'
  },
  {
    value: 'application/vnd.oasis.opendocument.text',
    label: 'OpenDocument text document',
    extension: '.odt'
  },
  {
    value: 'application/pdf',
    label: 'Adobe Portable Document Format',
    extension: '.pdf'
  },
  {
    value: 'application/rtf',
    label: 'Rich Text Format',
    extension: '.rtf'
  },
  {
    value: 'text/plain',
    label: 'Plain text',
    extension: '.txt'
  },
  // media
  {
    value: 'audio/aac',
    label: 'AAC audio',
    extension: '.aac'
  },
  {
    value: 'audio/mpeg',
    label: 'MP3 audio',
    extension: '.mp3'
  },
  {
    value: 'audio/ogg',
    label: 'OGG audio',
    extension: '.oga'
  },
  {
    value: 'audio/3gpp',
    label: '3GPP audio/video container',
    extension: '.3gpp'
  },
  {
    value: 'audio/3gpp2',
    label: '3GPP audio/video container',
    extension: '.3gpp2'
  },
  {
    value: 'video/mpeg',
    label: 'MPEG video',
    extension: '.mpeg'
  },
  {
    value: 'video/ogg',
    label: 'OGG video',
    extension: '.ogv'
  },
  {
    value: 'video/mp4',
    label: 'MP4 video',
    extension: '.mp4'
  },
  // archives
  {
    value: 'application/vnd.rar',
    label: 'RAR archive',
    extension: '.rar'
  },
  {
    value: 'application/x-tar',
    label: 'Tape archive',
    extension: '.tar'
  },
  {
    value: 'application/x-7z-compressed',
    label: '7-zip archive',
    extension: '.7z'
  },
  {
    value: 'application/gzip',
    label: 'GZip Compressed Archive',
    extension: '.gz'
  }
];
