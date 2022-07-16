export interface BaseOption {
  createdAt: Date;
  updatedAt: Date;
}

export type NestResponseBaseOption = {
  success: boolean;
  data: unknown;
};
