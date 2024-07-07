import { UnauthorizeError } from "./customs";
import { getAPIBasePath } from "./utils";

interface Props {
  url: string;
  options?: RequestInit;
  authenticated?: boolean;
}

async function makeApiRequest({
  url,
  options = {},
  authenticated = false
}: Props): Promise<Response> {
  let requestOptions: RequestInit = {
    ...options,
  };

  if (authenticated) {
    const accessToken = localStorage?.getItem('access_token');
    if (!accessToken) {
      throw new UnauthorizeError();
    }
    const headers = {
      ...requestOptions.headers,
      "Authorization": `Bearer ${accessToken}`
    }
    requestOptions.credentials = "include";
    requestOptions.headers = headers;
  }

  const response = await fetch(`${getAPIBasePath()}${url}`, requestOptions);

  if (response.status === 401) {
    // access token has expired, try to refresh it
    const refreshResponse = await fetch(`/api/auth/refresh`, {
      method: "POST",
    });
    if (refreshResponse.ok) {
      const { accessToken, refreshToken } = await refreshResponse.json();
      localStorage?.setItem("access_token", accessToken);
      // retry original request with new access token
      const retryResponse = await makeApiRequest({
        url,
        options: {
          ...requestOptions
        },
        authenticated
      });
      return retryResponse;
    }
  }
  return response;
}

export default makeApiRequest;
