"use client";

import { useState, useEffect } from "react";
import { getAuthConfigAction } from "@/actions/user";

export function useAuthConfig() {
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    getAuthConfigAction().then((res) => {
      if (res.success && res.data) {
        setGoogleEnabled(res.data.googleEnabled);
      }
    });
  }, []);

  return { googleEnabled };
}
