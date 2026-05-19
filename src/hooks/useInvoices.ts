import { useState, useEffect, useCallback } from "react";
import type { Invoice } from "../types/invoice";

const INVOICES_URL = import.meta.env.VITE_INVOICES_URL as string;

function mapInvoice(item: Record<string, unknown>): Invoice {
  const id = String(
    item.ID ??
      item.ItemInternalId ??
      item.SharepointID ??
      item.SharePointID ??
      item.InvoiceId ??
      item.InvoiceID ??
      item.Id ??
      "",
  );
  const label = String(
    item.Title ??
      item.InvoiceNo ??
      item.InvoiceNumber ??
      item.Name ??
      item.FileName ??
      `Invoice ${item.ID ?? item.ItemInternalId ?? "Unknown"}`,
  );
  const netTotal = (() => {
    const n = parseFloat(item.NetTotal as string);
    return !isNaN(n) && n !== 0 ? n : null;
  })();
  const grossTotal = (() => {
    const n = parseFloat(item.Total as string);
    return !isNaN(n) && n !== 0 ? n : null;
  })();
  const vendor = String(item.Vendor ?? item.VendorName ?? item.vendor ?? "");
  const currency = String(
    item.CurrencyCode ??
      item.currencyCode ??
      item.Currency ??
      item.currency ??
      "EUR",
  );
  const poNos: string[] = item.PONos
    ? Array.isArray(item.PONos)
      ? (item.PONos as string[])
      : String(item.PONos)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
    : [];
  const jobNos: string[] = item.JobNos
    ? Array.isArray(item.JobNos)
      ? (item.JobNos as string[])
      : String(item.JobNos)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
    : [];
  const jobInfo: unknown[] = (() => {
    try {
      const parsed =
        typeof item.JobInfo === "string"
          ? JSON.parse(item.JobInfo)
          : item.JobInfo;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const entityRaw = item.Entity as { Value?: string } | string | undefined;
  const entity = String(
    typeof entityRaw === "object"
      ? (entityRaw?.Value ?? "")
      : (entityRaw ?? ""),
  );
  const statusRaw = item.Status as
    | { Value?: string }
    | string
    | null
    | undefined;
  const status =
    typeof statusRaw === "object"
      ? (statusRaw?.Value ?? null)
      : (statusRaw ?? null);
  const date =
    String(
      item.InvoiceDate ?? item.DocumentDate ?? item.Date ?? item.Created ?? "",
    ) || null;

  return {
    id,
    label,
    netTotal,
    grossTotal,
    vendor,
    currency,
    poNos,
    jobNos,
    jobInfo,
    entity,
    status,
    date,
  };
}

interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInvoices(userEmail: string | null): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(INVOICES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: userEmail }),
      });
      const data = await res.json().catch(() => null);
      const raw: unknown[] = Array.isArray(data?.Invoiced)
        ? data.Invoiced
        : Array.isArray(data?.value)
          ? data.value
          : Array.isArray(data)
            ? data
            : [];
      setInvoices(
        (raw as Record<string, unknown>[])
          .map(mapInvoice)
          .filter((inv) => inv.id),
      );
    } catch {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, loading, error, refetch: fetchInvoices };
}
