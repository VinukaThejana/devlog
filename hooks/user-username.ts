import useSWR from 'swr';
import { authEncoded } from '@lib/session';

// Fetch the username from the session coookie
export const useUsername = () => {
  // The fetcher function
  const fetcher = async (url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${authEncoded}`,
      },
    });

    return response.json();
  };

  // Use SWR hook
  const { data, error, mutate } = useSWR(['/api/auth/username'], fetcher);

  return {
    data,
    error,
    mutate,
  };
};
