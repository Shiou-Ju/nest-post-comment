export interface DocumentTimeStampsBaseOption {
  createdAt: Date;
  updatedAt: Date;
}

export type Pagination = {
  page: number;
  count: number;
};

export type NestResponseBaseOption = {
  success: boolean;
  pagination?: Pagination;
  data: unknown;
};

export type ParameterizedRoutParams = {
  postDocId?: string;
  commentDocId?: string;
};

export type DeleteResult = {
  acknowledged: boolean;
  deletedCount: number;
};

export type ActionsForInvolvingDocumentsUpdate = 'delete' | 'create';
