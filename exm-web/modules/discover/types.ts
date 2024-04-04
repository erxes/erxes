import { IAttachment, IUser, QueryResponse } from "../types"

export type Topic = {
  _id: string
  title: string
  description: string
  brandId: string
  categoryIds: string[]
  color: string
  backgroundImage: string
  languageCode?: string

  categories: IKbCategory[]
  parentCategories: IKbParentCategory[]
  createdBy: string
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
}

export interface IKbParentCategory extends IKbCategory {
  childrens: IKbCategory[]
}

interface ICommonFields {
  createdBy: string
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
}

export interface IKbCategory extends ICommonFields {
  _id: string
  title: string
  description: string
  articleIds: string[]
  icon: string

  authors: IUser[]
  articles: IKbArticle[]
  numOfArticles: number
}

export interface IKbArticle extends ICommonFields {
  _id: string
  title: string
  summary: string
  content: string
  status: string
  forms?: IErxesForm[]
  categoryId?: string
  reactionChoices?: string[]
  createdUser: IUser
  viewCount?: number
}

export interface IErxesForm {
  brandId: string
  formId: string
}

export interface IArticle {
  _id: string
  title: string
  summary: string
  content: string
  status: string
  reactionChoices: string[]
  reactionCounts: any
  createdBy: string
  createdUser: IUser
  createdDate: Date
  modifiedBy: string
  modifiedDate: Date
  topicId: string
  categoryId: string
  image: IAttachment
  attachments: [IAttachment]
  forms: IErxesForm[]
}

export type ArticlesQueryResponse = {
  knowledgeBaseArticles: IArticle[]
} & QueryResponse

export interface IStage {
  _id: string
  name: string
  type: string
  probability: string
  index?: number
  itemId?: string
  amount?: any
  itemsTotalCount: number
  formId: string
  pipelineId: string
  status: string
  order: number
}

export interface ITicket {
  source?: string
  _id: string
  name: string
  order: number
  stageId: string
  boardId?: string
  closeDate: Date
  description: string
  amount: number
  modifiedAt: Date
  assignedUserIds?: string[]
  assignedUsers: IUser[]
  createdUser?: IUser
  stage?: IStage
  isWatched?: boolean
  priority?: string
  hasNotified?: boolean
  isComplete: boolean
  reminderMinute: number
  labelIds: string[]
  status?: string
  createdAt: Date
  timeTrack: {
    status: string
    timeSpent: number
    startDate?: string
  }
  customFieldsData?: {
    [key: string]: any
  }
}
