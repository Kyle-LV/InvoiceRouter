import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "./useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns loading true initially", () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 }),
    );
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it("returns the user after fetch resolves", async () => {
    const mockUser = {
      identityProvider: "aad",
      userId: "abc123",
      userDetails: "kyle.williams@lv-logistics.com",
      userRoles: ["authenticated"],
      claims: [],
    };
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: mockUser }), {
        status: 200,
      }),
    );
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
  });

  it("returns null user when not authenticated", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientPrincipal: null }), { status: 200 }),
    );
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
