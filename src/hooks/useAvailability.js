import { useEffect, useState } from "react";

export function useAvailability({ date, serviceType, minutes }) {
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date || !serviceType || !minutes) {
      setAvailable([]);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);

    fetch(
      `/api/slots?date=${date}&serviceType=${serviceType}&minutes=${minutes}`,
    )
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Failed to load slots")),
      )
      .then((d) => {
        if (alive) setAvailable(d.available || []);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [date, serviceType, minutes]);

  return { available, loading, error };
}
