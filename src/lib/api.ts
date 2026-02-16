const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type PollOption = {
  _id: string;
  text: string;
  votes: number;
};

export type Poll = {
  _id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.json().catch(() => ({}));
    const error = new Error(message?.message || "Request failed.");
    throw Object.assign(error, { status: response.status });
  }

  return response.json() as Promise<T>;
}

export function createPoll(payload: { question: string; options: string[] }) {
  return request<Poll>("/api/polls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPoll(pollId: string) {
  return request<Poll>(`/api/polls/${pollId}`);
}

export function votePoll(payload: {
  pollId: string;
  optionId: string;
  voterId: string;
}) {
  return request<Poll>(`/api/polls/${payload.pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({ optionId: payload.optionId, voterId: payload.voterId }),
  });
}

export function getApiUrl() {
  return API_URL;
}
