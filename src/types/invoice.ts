export type SortKey = "oldest" | "newest" | "az" | "za" | "entity";

export interface Invoice {
  id: string;
  label: string;
  netTotal: number | null;
  grossTotal: number | null;
  vendor: string;
  currency: string;
  poNos: string[];
  jobNos: string[];
  jobInfo: unknown[];
  entity: string;
  status: string | null;
  date: string | null;
}
