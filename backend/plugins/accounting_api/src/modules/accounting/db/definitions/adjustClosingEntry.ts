import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const ADJ_CLOSING_STATUSES = {
  DRAFT: 'draft', // шинээр үүссэн эсвэл түр түтгэлзүүлсэн
  WARNING: 'warning', // асуудал гарсан
  COMPLETE: 'complete', // асуудалгүй болсон
  PUBLISH: 'publish', // баталсан
  all: ['draft', 'publish', 'warning', 'complete'],
};

export const closingDetailEntrySchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,

    accountId: { type: String, label: 'Account' },
    balance: { type: Number, label: 'Main Currency Balance' }, // үндсэн үлдэгдэл
    percent: { type: Number, label: 'Main Currency Balance' }, // хаалтаас ашиг алдагдалд нөлөөлөх хувь (front дээр бүлэглэн хувь тохируулах боломж) бусад салбар хэлтэс байсан ч нэг данс нэг л хувьтай байх ёстой #

    mainAccTrId: { type: String, optional: true, label: 'Main Account Transaction' }, // Хадгалах үед тухайн түр данс тухайн салбар хэлтэст үлдэгдэлтэй бол эсрэгээр бичсэн баримт
    integrateTrId: { type: String, optional: true, label: 'Main Account Transaction' }, // Дээрх байгаа бол мөн эсрэгцүүлж орлого зарлагын нэгдсэн дансанд бичилт
  })
);

export const adjustClosingDetailsSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,

    branchId: { type: String, optional: true, label: 'Branch' }, // салбар сонгож болно. Сонгосон бол баримтууд уг салбараар, сонгоогүй бол дансныхаараа
    departmentId: { type: String, optional: true, label: 'Department' }, // хэлтэс сонгож болно. Сонгосон бол баримтууд уг хэлтэсээр, сонгоогүй бол дансныхаараа
    entries: { type: [closingDetailEntrySchema], label: 'Entries' }, // тухайн салбар хэлтэст хамаарах үлдэгдэлтэй данснуудаас хамаарч үүсэх

    closeIntegrateTrId: { type: String, optional: true, label: 'Main Account Transaction' }, // энтрийс ийн үр дүндэх орлого зарлагын нэгдсэн дансыг хаах бичилт
    periodGLTrId: { type: String, optional: true, label: 'Main Account Transaction' }, // орлого зарлагын нэгдсэн дансыг хаах үед тайлант үеийн ашиг алдагдал бичих

    createdAt: { type: Date, default: new Date(), label: 'Created at' },
    updatedAt: { type: Date, optional: true, label: 'Modified at' },
  })
);

export const adjustClosingSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    status: { type: String, label: 'Status', default: 'draft', enum: ADJ_CLOSING_STATUSES.all }, // #
    date: { type: Date, label: 'date' }, // хэднээр ханш тэгшитгэж байна вэ? буюу хүртэлх огноо #
    beginDate: { type: Date, label: 'date' }, // өмнөх хаалтын огноо эсвэл анхны гүйлгээний огноо
    description: { type: String, optional: true, label: 'description' }, // #

    details: { type: [adjustClosingDetailsSchema], optional: true, label: 'description' }, // isTemp == true дансдаас үлдэгдэлтэйнүүдэд харгалзаж салбар хэлтэс бүрээр үүсэх

    integrateAccountId: { type: String, label: 'Integration Account' }, // орлого зарлагын нэгдсэн данс ##
    periodGLAccountId: { type: String, label: 'Period gain loss Account' }, // тайлант үеийн ашиг алдагдал ##
    earningAccountId: { type: String, label: 'Retained Earnings Account' }, // хуримтлагдсан ашиг ~90 | 100 ##
    taxPayableAccountId: { type: String, label: 'tax payable Account' }, // татварын өглөг ~10 | 0 ##

    taxImpactValue: { type: Number, label: 'Tax impact value' }, // хуримтлагдсан ашиг, татварын өглөг нь өмнөх хаалтаас хамаарч тооцогдох учир энд уг хаалтын дараа дараагийн хаалтанд нөлөөлөх татварын буюу ~10% дүн

    closePeriodTrId: { type: String, optional: true, label: 'Main Account Transaction' }, // details ийн нийлбэрээр тайлант үеийн ашиг алдагдал дансыг хаах бичилт
    earningTrId: { type: String, optional: true, label: 'Transaction' }, // хуримтлагдсан ашиг өөрчлөгдсөн бол ~90-100
    taxPayableTrId: { type: String, optional: true, label: 'Transaction' }, // татварын өглөг үүсэн бол ~10-0

    createdBy: { type: String, label: 'Created user' },
    modifiedBy: { type: String, optional: true, label: 'Modified user' },
    createdAt: { type: Date, default: new Date(), label: 'Created at' }, // үүссэн огноо
    updatedAt: { type: Date, optional: true, label: 'Modified at' }, // хамгийн сүүлд өөрчилсөн огноо
  }),
);
