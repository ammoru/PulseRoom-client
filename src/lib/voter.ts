const STORAGE_KEY = "pollrooms.voterId";

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `voter_${Math.random().toString(36).slice(2)}${Date.now()}`;
}

export function getVoterId() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }
  const next = generateId();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export function getStoredVote(pollId: string) {
  return localStorage.getItem(`pollrooms.vote.${pollId}`);
}

export function storeVote(pollId: string, optionId: string) {
  localStorage.setItem(`pollrooms.vote.${pollId}`, optionId);
}
