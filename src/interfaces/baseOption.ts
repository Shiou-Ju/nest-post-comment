export interface BaseOption {
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
