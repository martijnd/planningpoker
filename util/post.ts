import { Actions } from 'types';

export async function post<T extends object>(type: Actions, payload: T) {
  const response = await fetch('/api/socket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      type,
      ...payload,
    }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  console.log(response);
  const resData = await response.json();
  return resData;
}
