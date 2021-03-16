export class MetadataRequestParams {
  excludeThumbnails: boolean;
  search: string[];
  sortBy?: 'ascending' | 'descending';
  solRange?: [number, number];
  dateRange?: [string, string];
}
