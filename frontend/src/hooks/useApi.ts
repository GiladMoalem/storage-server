import { useCallback, useState } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const execute = useCallback(async (request: () => Promise<T>, options?: UseApiOptions<T>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await request();
      options?.onSuccess?.(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
      options?.onError?.(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, success, setSuccess, setError, execute };
}
