import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import { IBranchDocument } from '@/bms/@types/branch';
import { IElementCategoryDocument } from '@/bms/@types/element';
import { IElementTranslationDocument } from './modules/bms/@types/elementTranslation';
import { IItineraryDocument } from '@/bms/@types/itinerary';
import { IOrderDocument } from '@/bms/@types/order';
import { ITourCategoryDocument, ITourDocument } from '@/bms/@types/tour';
import { IBranchModel, loadBranchClass } from '@/bms/db/models/Branch';
import {
  IElementCategoryModel,
  IElementModel,
  loadElementCategoryClass,
  loadElementClass,
} from '@/bms/db/models/Element';

import {
  IElementTranslationModel,
  loadElementTranslationClass,
} from '@/bms/db/models/ElementTranslation';

import { IItineraryModel, loadItineraryClass } from '@/bms/db/models/Itinerary';
import {
  IItineraryTranslationModel,
  loadItineraryTranslationClass,
} from '@/bms/db/models/ItineraryTranslation';
import { IItineraryTranslationDocument } from './modules/bms/@types/itineraryTranslation';
import { ITourTranslationDocument } from './modules/bms/@types/tourTranslation';
import {
  ITourTranslationModel,
  loadTourTranslationClass,
} from '@/bms/db/models/TourTranslation';

import { IOrderModel, loadOrderClass } from '@/bms/db/models/Order';
import {
  IBmsTourCategoryModel,
  ITourModel,
  loadTourCategoryClass as loadBmsTourCategoryClass,
  loadTourClass,
} from '@/bms/db/models/Tour';
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

import { IPMSBranchModel, loadPmsBranchClass } from '@/pms/db/models/Branch';
import { ICleaningModel, loadCleaningClass } from '@/pms/db/models/Cleaning';
import {
  ICleaningHistoryModel,
  loadCleaningHistoryClass,
} from '@/pms/db/models/CleaningHistory';
import { IConfigModel, loadConfigClass } from '@/pms/db/models/Configs';
import { IPmsBranchDocument } from '@/pms/@types/branch';
import {
  ICleaningDocument,
  ICleaningHistoryDocument,
} from '@/pms/@types/cleanings';
import mongoose from 'mongoose';
import { IConfigDocument } from '@/pms/@types/configs';
import {
  ITourCategoryTranslationModel,
  loadTourCategoryTranslationClass,
} from './modules/bms/db/models/TourCategoryTranslation';
import { ITourCategoryTranslationDocument } from './modules/bms/@types/tourCategoryTranslation';

export interface IModels {
  Elements: IElementModel;
  ElementCategories: IElementCategoryModel;
  ElementTranslations: IElementTranslationModel;
  Itineraries: IItineraryModel;
  ItineraryTranslations: IItineraryTranslationModel;
  Tours: ITourModel;
  BmsTourCategories: IBmsTourCategoryModel;
  TourTranslations: ITourTranslationModel;
  TourCategoryTranslations: ITourCategoryTranslationModel;
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

  PmsBranch: IPMSBranchModel;
  Cleaning: ICleaningModel;
  History: ICleaningHistoryModel;
  Configs: IConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  commonQuerySelector: any;
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

  models.ElementTranslations = db.model<
    IElementTranslationDocument,
    IElementTranslationModel
  >('bm_element_translations', loadElementTranslationClass(models));

  models.Itineraries = db.model<IItineraryDocument, IItineraryModel>(
    'bm_itinerary',
    loadItineraryClass(models),
  );

  models.ItineraryTranslations = db.model<
    IItineraryTranslationDocument,
    IItineraryTranslationModel
  >('bm_itinerary_translations', loadItineraryTranslationClass(models));

  models.Tours = db.model<ITourDocument, ITourModel>(
    'bm_tours',
    loadTourClass(models),
  );

  models.TourTranslations = db.model<
    ITourTranslationDocument,
    ITourTranslationModel
  >('bm_tour_translations', loadTourTranslationClass(models));

  models.BmsTourCategories = db.model<
    ITourCategoryDocument,
    IBmsTourCategoryModel
  >('bm_tour_categories', loadBmsTourCategoryClass(models));

  models.TourCategoryTranslations = db.model<
    ITourCategoryTranslationDocument,
    ITourCategoryTranslationModel
  >('bm_tour_category_translations', loadTourCategoryTranslationClass(models));

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

  models.PmsBranch = db.model<IPmsBranchDocument, IPMSBranchModel>(
    'pms_branches',
    loadPmsBranchClass(models),
  );

  models.Cleaning = db.model<ICleaningDocument, ICleaningModel>(
    'pms_cleanings',
    loadCleaningClass(models),
  );

  models.History = db.model<ICleaningHistoryDocument, ICleaningHistoryModel>(
    'pms_cleaning_histories',
    loadCleaningHistoryClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'pms_configs',
    loadConfigClass(models),
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
