// Generated from templates.manifest.json in the web-builder repo — the single
// source of truth for which templates exist, their status and their catalog
// entry. Only templates with status "active" appear here; "wip" and "archived"
// ones are deliberately not offered. Re-sync this file when the manifest
// changes rather than editing entries by hand.

import ecommerceBoilerplate from '~/assets/template-screenshots/ecommerce-boilerplate.png';
import ecommerceTemplateModern from '~/assets/template-screenshots/ecommerce-template-modern.png';
import ecommerceTemplateZah from '~/assets/template-screenshots/ecommerce-template-zah.png';
import tourTemplateMeridian from '~/assets/template-screenshots/tour-template-meridian.png';
import tourTemplateTerrace from '~/assets/template-screenshots/tour-template-terrace.png';
import hotelTemplateNocturne from '~/assets/template-screenshots/hotel-template-nocturne.png';
import hotelTemplateLarch from '~/assets/template-screenshots/hotel-template-larch.png';
import ticketTemplateCivic from '~/assets/template-screenshots/ticket-template-civic.png';

export const THUMBNAIL_GRADIENTS = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
];

export const TEMPLATE_TYPES = [
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'tour', label: 'Tour' },
  { value: 'ticket', label: 'Ticket' },
];

export interface WebTemplate {
  id: string;
  type: string;
  name: string;
  thumbnail: string;
  description: string;
  screenshots: string[];
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  accentColor?: string;
  textColor?: string;
  author: string;
  authorUrl: string;
  version: string;
  review: string;
}

export const TEMPLATES: WebTemplate[] = [
  {
    id: 'template-boilerplate',
    type: 'ecommerce',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, ' +
      'modern UI. Supports build-time live updates and production SSR rendering.',
    screenshots: [ecommerceBoilerplate],
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'template-boilerplate',
    type: 'hotel',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, ' +
      'modern UI. Supports build-time live updates and production SSR rendering.',
    screenshots: [ecommerceBoilerplate],
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'template-boilerplate',
    type: 'tour',
    name: 'Template Boilerplate',
    thumbnail: ecommerceBoilerplate,
    description:
      'A unified boilerplate that blends ecommerce and tour flows with a clean, ' +
      'modern UI. Supports build-time live updates and production SSR rendering.',
    screenshots: [ecommerceBoilerplate],
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'A flexible starter for multi-vertical sites with SSR support.',
  },
  {
    id: 'ecommerce-template-modern',
    type: 'ecommerce',
    name: 'Modern',
    thumbnail: ecommerceTemplateModern,
    description:
      'A clean, modern ecommerce template focused on user experience and ' +
      'performance. Responsive layout, smooth animations, and an intuitive ' +
      'navigation structure.',
    screenshots: [ecommerceTemplateModern],
    primaryColor: '#34495e',
    secondaryColor: '#2c3e50',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'A modern approach to ecommerce design with a focus on user experience.',
  },
  {
    id: 'ecommerce-template-zah',
    type: 'ecommerce',
    name: 'Zah',
    thumbnail: ecommerceTemplateZah,
    description:
      'A Mongolian-first shop in felt, lacquer and enamel — an undyed wool ' +
      'ground, deep ger-door teal for structure, and a lacquer red rationed to ' +
      'price and action. Golos Text over Inter, both carrying the cyrillic-ext ' +
      'subset Mongolian actually needs, and a 0.25rem radius that reads as a ' +
      'shelf ticket rather than an app tile. Density is the point: delivery, ' +
      'payment and stock sit on the landing page and on every product, and the ' +
      'stock line is always a colour and a word, never a bare coloured dot.',
    screenshots: [ecommerceTemplateZah],
    primaryColor: '#1d5f57',
    secondaryColor: '#edeae3',
    backgroundColor: '#f5f2ec',
    accentColor: '#b8402c',
    textColor: '#1c2222',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Pick it over Modern when the catalogue is large and the customer is ' +
      'scanning rather than browsing, and whenever the shop sells in Mongolian — ' +
      'it is the only template whose seed copy and type are built for it.',
  },
  {
    id: 'tour-template-meridian',
    type: 'tour',
    name: 'Meridian',
    thumbnail: tourTemplateMeridian,
    description:
      'An expedition field-journal template for tour operators. Bone paper, ' +
      'pressed-ink type, and pine-and-ochre accents pulled from survey maps. ' +
      'Square corners, Instrument Serif headings over Archivo body text, and ' +
      'wipe-in reveals.',
    screenshots: [tourTemplateMeridian],
    primaryColor: '#1d3b31',
    secondaryColor: '#e4dfd3',
    backgroundColor: '#efebe2',
    accentColor: '#bc5620',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Editorial and unhurried — suits expedition and small-group operators more ' +
      'than mass-market tours.',
  },
  {
    id: 'tour-template-terrace',
    type: 'tour',
    name: 'Terrace',
    thumbnail: tourTemplateTerrace,
    description:
      'A warm, generous tour template in sand, terracotta and sage. Depth comes ' +
      'from tone rather than shadow, corners are softly rounded, and Fraunces ' +
      'headings sit over DM Sans body copy.',
    screenshots: [tourTemplateTerrace],
    primaryColor: '#3f4a3c',
    secondaryColor: '#efe6d9',
    backgroundColor: '#f7f2ea',
    accentColor: '#c2694b',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Warm and welcoming — a good fit for retreats, lodges and slow-travel ' +
      'operators.',
  },
  {
    id: 'hotel-template-nocturne',
    type: 'hotel',
    name: 'Nocturne',
    thumbnail: hotelTemplateNocturne,
    description:
      'A dark-by-default hotel template — brass on near-black, with panels that ' +
      'lift by lightening rather than casting shadow. Barely-there 2px radius, ' +
      'Manrope throughout, and slow photographic reveals.',
    screenshots: [hotelTemplateNocturne],
    primaryColor: '#c9a227',
    secondaryColor: '#131316',
    backgroundColor: '#0b0b0c',
    textColor: '#f2efe9',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Built for boutique hotels and resorts that photograph well in low light.',
  },
  {
    id: 'hotel-template-larch',
    type: 'hotel',
    name: 'Larch',
    thumbnail: hotelTemplateLarch,
    description:
      'An alpine-lodge template in bleached paper, undyed wool and pine-dark ink, ' +
      'with larch-bark rust as the only warm accent. Photographs carry the page ' +
      'and type stays out of their way: Fraunces headings at restrained weights ' +
      'over Inter, a 0.75rem radius, and depth built from a three-step surface ' +
      'stack rather than shadow. The room list is the centrepiece — each room is ' +
      'a full-width photographic band with its rate on a wool bar clipped ' +
      'underneath — and the page closes on a single inverted pine band.',
    screenshots: [hotelTemplateLarch],
    primaryColor: '#2f3a2c',
    secondaryColor: '#eee9e2',
    backgroundColor: '#f4efe7',
    accentColor: '#a8622f',
    textColor: '#2f3a2c',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'Pick it over Nocturne when the property is light, rural and photographs in ' +
      'daylight rather than low light, and over Terrace when the guest is booking ' +
      'a room rather than an itinerary.',
  },
  {
    id: 'ticket-template-civic',
    type: 'ticket',
    name: 'Civic',
    thumbnail: ticketTemplateCivic,
    description:
      'A public-service request portal in the civic-design tradition. Square ' +
      'corners, Public Sans, a solid yellow focus block, and status colours that ' +
      'are always paired with a text label. Carries request categories, a ' +
      'submission form, and reference-based request tracking.',
    screenshots: [ticketTemplateCivic],
    primaryColor: '#12437e',
    secondaryColor: '#f5f4f2',
    backgroundColor: '#ffffff',
    accentColor: '#d4351c',
    author: 'erxes',
    authorUrl: 'https://erxes.io',
    version: '1.0.0',
    review:
      'For government and utility bodies taking requests from the public. ' +
      'Accessibility is the design constraint, not an afterthought.',
  },
];
