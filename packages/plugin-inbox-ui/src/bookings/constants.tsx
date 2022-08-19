import { __ } from '@erxes/ui/src/utils/core';

export const BOOKING_ITEM_SHAPE = {
  RECTANGLE: 'rectangle',
  ROUND: 'round',
  CIRCLE: 'circle',
  ALL_LIST: [
    { label: 'Rectangle', value: 'rectangle' },
    { label: 'Round', value: 'round' },
    { label: 'Circle', value: 'circle' }
  ]
};

export const BOOKING_DISPLAY_BLOCK = {
  HORIZONTALLY: 'horizontally',
  VERTICALLY: 'vertically',
  ALL_LIST: [
    { label: 'Horizontally', value: 'horizontally' },
    { label: 'Vertically', value: 'vertically' }
  ]
};

export const EMPTY_CONTENT_BOOKINGS = {
  title: __('Getting Started with erxes Booking'),
  description: __(
    'erxes Booking widget helps you create listings of your Products and Services and receive bookings with your erxes Form.'
  ),
  steps: [
    {
      title: __('Prepare Product Properties'),
      description: __(
        'This widget is based on your erxes Products and Services. Depending on your products, you may need to create custom Properties first. For example, you can display additional information such as Amenities, Services, etc. in the product detail page or as user filters.'
      ),
      url: '/settings/properties?type=products:product',
      urlText: 'Create Custom Properties'
    },
    {
      title: __('Organize Your Products'),
      description: __(
        'The number of pages in this widget depends on how many sub-categories you’ll create for your products and services. If you haven’t created or organized them yet, please go to Products & Services first.'
      ),
      url: '/settings/product-service',
      urlText: 'Manage Products & Services'
    }
  ]
};
