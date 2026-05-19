import { describe, it, expect } from "vitest";
import { sortInvoices } from "./invoiceSort";
import type { Invoice } from "../types/invoice";

const base: Invoice = {
  id: "1",
  label: "Test",
  netTotal: null,
  grossTotal: null,
  vendor: "",
  currency: "EUR",
  poNos: [],
  jobNos: [],
  jobInfo: [],
  entity: "",
  status: null,
  date: null,
};

const invoices: Invoice[] = [
  { ...base, id: "1", vendor: "Zebra Ltd", entity: "UKLS", date: "2024-01-01" },
  { ...base, id: "2", vendor: "Alpha Co", entity: "NLCT", date: "2024-03-01" },
  { ...base, id: "3", vendor: "Beta GmbH", entity: "AZLS", date: "2024-02-01" },
];

describe("sortInvoices", () => {
  it("sorts oldest first by default", () => {
    const result = sortInvoices(invoices, "oldest");
    expect(result.map((i) => i.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts newest first", () => {
    const result = sortInvoices(invoices, "newest");
    expect(result.map((i) => i.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts vendor A-Z", () => {
    const result = sortInvoices(invoices, "az");
    expect(result.map((i) => i.vendor)).toEqual([
      "Alpha Co",
      "Beta GmbH",
      "Zebra Ltd",
    ]);
  });

  it("sorts vendor Z-A", () => {
    const result = sortInvoices(invoices, "za");
    expect(result.map((i) => i.vendor)).toEqual([
      "Zebra Ltd",
      "Beta GmbH",
      "Alpha Co",
    ]);
  });

  it("sorts by entity", () => {
    const result = sortInvoices(invoices, "entity");
    expect(result.map((i) => i.entity)).toEqual(["AZLS", "NLCT", "UKLS"]);
  });

  it("does not mutate the original array", () => {
    const original = [...invoices];
    sortInvoices(invoices, "newest");
    expect(invoices).toEqual(original);
  });
});
