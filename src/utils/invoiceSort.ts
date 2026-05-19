import type { Invoice, SortKey } from "../types/invoice";

function cmp<T>(a: T, b: T, desc = false): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a < b) return desc ? 1 : -1;
  if (a > b) return desc ? -1 : 1;
  return 0;
}

export function sortInvoices(invoices: Invoice[], key: SortKey): Invoice[] {
  const copy = [...invoices];
  switch (key) {
    case "newest":
      return copy.sort((a, b) => cmp(a.date, b.date, true));
    case "az":
      return copy.sort((a, b) =>
        cmp(a.vendor?.toLowerCase(), b.vendor?.toLowerCase()),
      );
    case "za":
      return copy.sort((a, b) =>
        cmp(a.vendor?.toLowerCase(), b.vendor?.toLowerCase(), true),
      );
    case "entity":
      return copy.sort((a, b) =>
        cmp(a.entity?.toLowerCase(), b.entity?.toLowerCase()),
      );
    case "oldest":
    default:
      return copy.sort((a, b) => cmp(a.date, b.date));
  }
}
