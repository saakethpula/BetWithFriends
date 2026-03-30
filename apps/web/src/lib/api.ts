export type FamilyGroup = {
  id: string;
  name: string;
  joinCode: string;
  role: "ADMIN" | "MEMBER";
  members: Array<{
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string | null;
    role: "ADMIN" | "MEMBER";
  }>;
};

export type CurrentUserResponse = {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  groups: FamilyGroup[];
};

export type CreatedGroupResponse = {
  id: string;
  name: string;
  joinCode: string;
};

export type Market = {
  id: string;
  question: string;
  description?: string | null;
  closesAt: string;
  resolvesAt?: string | null;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  resolution?: boolean | null;
  createdBy: {
    displayName: string;
  };
  targetUser: {
    id: string;
    displayName: string;
  };
  positions: Array<{
    id: string;
    userId: string;
    side: "YES" | "NO";
    amount: number;
  }>;
  summary: {
    yesVolume: number;
    noVolume: number;
    totalVolume: number;
    yesPrice: number;
    noPrice: number;
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

async function request<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(body?.message ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function getCurrentUser(token: string) {
  return request<CurrentUserResponse>("/api/me", token);
}

export function createGroup(token: string, name: string) {
  return request<CreatedGroupResponse>("/api/groups", token, {
    method: "POST",
    body: JSON.stringify({ name })
  });
}

export function joinGroup(token: string, joinCode: string) {
  return request<{ joined: boolean; groupId: string }>("/api/groups/join", token, {
    method: "POST",
    body: JSON.stringify({ joinCode })
  });
}

export function getMarkets(token: string, groupId: string) {
  return request<Market[]>(`/api/markets?groupId=${groupId}`, token);
}

export function createMarket(
  token: string,
  payload: {
    groupId: string;
    targetUserId: string;
    question: string;
    description?: string;
    closesAt: string;
    resolvesAt?: string;
  }
) {
  return request<Market>("/api/markets", token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createPosition(
  token: string,
  marketId: string,
  payload: { side: "YES" | "NO"; amount: number }
) {
  return request(`/api/markets/${marketId}/positions`, token, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resolveMarket(
  token: string,
  marketId: string,
  resolution: boolean
) {
  return request<Market>(`/api/markets/${marketId}/resolve`, token, {
    method: "POST",
    body: JSON.stringify({ resolution })
  });
}
