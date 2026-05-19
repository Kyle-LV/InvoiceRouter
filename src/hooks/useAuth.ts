import { useState, useEffect } from "react";
import type { ClientPrincipal, AuthMeResponse } from "../types/auth";

interface UseAuthResult {
  user: ClientPrincipal | null;
  loading: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<ClientPrincipal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/.auth/me")
      .then((res) => {
        return res.json() as Promise<AuthMeResponse>;
      })
      .then((data) => {
        setUser(data.clientPrincipal);
      })
      .catch((err) => {
        setUser(null);
        throw new Error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
