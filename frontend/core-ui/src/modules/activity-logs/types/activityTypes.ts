export interface IActivityLog {
  _id: string;
  action: string;
  contentId: string;
  contentType: string;
  content: any;
  contentDetail: any;
  contentTypeDetail: any;
  createdAt: string;
  createdBy: string;
  createdByDetail: {
    type: string;
    content: {
      details: {
        fullName: string;
      };
    };
  };
}
