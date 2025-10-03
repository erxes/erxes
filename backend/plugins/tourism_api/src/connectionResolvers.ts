import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import { IBranchDocument } from '@/bms/@types/branch';
import { IElementCategoryDocument } from '@/bms/@types/element';
import { IItineraryDocument } from '@/bms/@types/itinerary';
import { IOrderDocument } from '@/bms/@types/order';
import { ITourDocument } from '@/bms/@types/tour';
import { IBranchModel, loadBranchClass } from '@/bms/db/models/Branch';
import {
  IElementCategoryModel,
  IElementModel,
  loadElementCategoryClass,
  loadElementClass,
} from '@/bms/db/models/Element';
import { IItineraryModel, loadItineraryClass } from '@/bms/db/models/Itinerary';
import { IOrderModel, loadOrderClass } from '@/bms/db/models/Order';
import { ITourModel, loadTourClass } from '@/bms/db/models/Tour';
import { IAvailabilityDocument } from '@/ota/@types/availabilities';
import { IOTABookingDocument } from '@/ota/@types/bookings';
import { IOTAHotelDocument } from '@/ota/@types/hotels';
import { IReviewDocument } from '@/ota/@types/reviews';
import { IOTARoomTypeDocument } from '@/ota/@types/roomTypes';
import { IOTATourAvailabilityDocument } from '@/ota/@types/tourAvailabilities';
import { IOTATourBookingDocument } from '@/ota/@types/tourBookings';
import { IOTATourCategoryDocument } from '@/ota/@types/tourCategories';
import { IOTATourDocument } from '@/ota/@types/tours';
import {
  IAvailabilityModel,
  loadAvailabilityClass,
} from '@/ota/db/models/Availabilities';
import { IBookingModel, loadBookingClass } from '@/ota/db/models/Bookings';
import { IHotelModel, loadHotelClass } from '@/ota/db/models/Hotels';
import { IReviewModel, loadReviewClass } from '@/ota/db/models/Reviews';
import { IRoomTypeModel, loadRoomTypeClass } from '@/ota/db/models/RoomTypes';
import {
  ITourAvailabilityModel,
  loadTourAvailabilityClass,
} from '@/ota/db/models/TourAvailabilities';
import {
  ITourBookingModel,
  loadTourBookingClass,
} from '@/ota/db/models/TourBookings';
import {
  ITourCategoryModel,
  loadTourCategoryClass,
} from '@/ota/db/models/TourCategories';
import { IOTATourModel, loadOTATourClass } from '@/ota/db/models/Tours';
import mongoose from 'mongoose';

export interface IModels {
  Elements: IElementModel;
  ElementCategories: IElementCategoryModel;
  Itineraries: IItineraryModel;
  Tours: ITourModel;
  Orders: IOrderModel;
  Branches: IBranchModel;

  Hotels: IHotelModel;
  RoomTypes: IRoomTypeModel;
  Availabilities: IAvailabilityModel;
  Bookings: IBookingModel;
  OTATours: IOTATourModel;
  TourAvailabilities: ITourAvailabilityModel;
  TourCategories: ITourCategoryModel;
  TourBookings: ITourBookingModel;
  Reviews: IReviewModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Elements = db.model<IElementModel, IElementModel>(
    'bm_elements',
    loadElementClass(models),
  );

  models.ElementCategories = db.model<
    IElementCategoryDocument,
    IElementCategoryModel
  >('bm_element_categories', loadElementCategoryClass(models));

  models.Itineraries = db.model<IItineraryDocument, IItineraryModel>(
    'bm_itinerary',
    loadItineraryClass(models),
  );

  models.Tours = db.model<ITourDocument, ITourModel>(
    'bm_tours',
    loadTourClass(models),
  );

  models.Orders = db.model<IOrderDocument, IOrderModel>(
    'bm_orders',
    loadOrderClass(models),
  );

  models.Branches = db.model<IBranchDocument, IBranchModel>(
    'bm_branch',
    loadBranchClass(models),
  );

  models.Hotels = db.model<IOTAHotelDocument, IHotelModel>(
    'ota_hotels',
    loadHotelClass(models),
  );

  models.RoomTypes = db.model<IOTARoomTypeDocument, IRoomTypeModel>(
    'ota_room_types',
    loadRoomTypeClass(models),
  );

  models.Availabilities = db.model<IAvailabilityDocument, IAvailabilityModel>(
    'ota_availabilities',
    loadAvailabilityClass(models),
  );

  models.Bookings = db.model<IOTABookingDocument, IBookingModel>(
    'ota_bookings',
    loadBookingClass(models),
  );

  models.OTATours = db.model<IOTATourDocument, IOTATourModel>(
    'ota_tours',
    loadOTATourClass(models),
  );

  models.TourAvailabilities = db.model<
    IOTATourAvailabilityDocument,
    ITourAvailabilityModel
  >('ota_tour_availabilities', loadTourAvailabilityClass(models));

  models.TourCategories = db.model<
    IOTATourCategoryDocument,
    ITourCategoryModel
  >('ota_tour_categories', loadTourCategoryClass(models));

  models.TourBookings = db.model<IOTATourBookingDocument, ITourBookingModel>(
    'ota_tour_bookings',
    loadTourBookingClass(models),
  );

  models.Reviews = db.model<IReviewDocument, IReviewModel>(
    'ota_reviews',
    loadReviewClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
