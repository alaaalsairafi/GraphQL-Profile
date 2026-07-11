// graphql/client.js
import { Auth } from '../auth/auth.js';

const GQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

export async function gqlQuery(query, variables = {}) {
  const token = Auth.getToken();
  if (!token) throw new Error('Not authenticated.');

  const response = await fetch(GQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) throw new Error(`Network error: ${response.status}`);

  const result = await response.json();
  if (result.errors?.length) throw new Error(result.errors[0].message);

  return result.data;
}