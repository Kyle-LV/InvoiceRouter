import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useInvoices } from "./useInvoices";

const mockRawInvoice = {
  ID: "42",
  Title: "INV-001",
  NetTotal: "1500.00",
  Total: "1800.00",
  Vendor: "Acme Corp",
  CurrencyCode: "GBP",
  PONos: "PO-001,PO-002",
  JobNos: "JOB-1",
  Entity: { Value: "UKLS" },
  Status: { Value: "Pending" },
  InvoiceDate: "2024-01-15",
};

describe("useInvoices", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns loading true initially", () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ Invoiced: [] }), { status: 200 }),
    );
    const { result } = renderHook(() => useInvoices("kyle@example.com"));
    expect(result.current.loading).toBe(true);
  });

  it("returns mapped invoices after fetch resolves", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ Invoiced: [mockRawInvoice] }), {
        status: 200,
      }),
    );
    const { result } = renderHook(() => useInvoices("kyle@example.com"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toHaveLength(1);
    expect(result.current.invoices[0].id).toBe("42");
    expect(result.current.invoices[0].label).toBe("INV-001");
    expect(result.current.invoices[0].vendor).toBe("Acme Corp");
    expect(result.current.invoices[0].entity).toBe("UKLS");
    expect(result.current.invoices[0].poNos).toEqual(["PO-001", "PO-002"]);
  });

  it("returns empty array when user email is null", async () => {
    const { result } = renderHook(() => useInvoices(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.invoices).toEqual([]);
  });

  it("sets error when fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useInvoices("kyle@example.com"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load invoices");
  });
});
