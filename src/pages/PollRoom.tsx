import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { getApiUrl, getPoll, type Poll, votePoll } from "../lib/api";
import { getStoredVote, getVoterId, storeVote } from "../lib/voter";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function PollRoom() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const socket: Socket | null = useMemo(() => {
    if (!pollId) {
      return null;
    }
    return io(getApiUrl(), { transports: ["websocket"] });
  }, [pollId]);

  useEffect(() => {
    if (!pollId) {
      return;
    }

    const storedVote = getStoredVote(pollId);
    if (storedVote) {
      setSelectedOption(storedVote);
    }

    getPoll(pollId)
      .then((data) => setPoll(data))
      .catch((error) => setMessage(error.message || "Failed to load poll."));
  }, [pollId]);

  useEffect(() => {
    if (!socket || !pollId) {
      return;
    }

    socket.emit("poll:join", { pollId });
    socket.on("poll:update", (data: Poll) => {
      setPoll(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket, pollId]);

  const handleVote = async () => {
    if (!pollId || !selectedOption) {
      return;
    }

    setMessage(null);
    setIsVoting(true);

    try {
      const voterId = getVoterId();
      const updated = await votePoll({
        pollId,
        optionId: selectedOption,
        voterId,
      });
      storeVote(pollId, selectedOption);
      setPoll(updated);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Failed to submit vote.");
      }
    } finally {
      setIsVoting(false);
    }
  };

  if (!pollId) {
    return (
      <div className="page">
        <div className="card">Invalid poll link.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card">
        <div className="poll-header">
          <div>
            <p className="eyebrow">Poll room</p>
            <h2>{poll ? poll.question : "Loading poll..."}</h2>
          </div>
          <Link className="ghost" to="/">
            Create another
          </Link>
        </div>

        {!poll ? (
          <p>Loading poll data...</p>
        ) : (
          <div className="poll-body">
            <div className="poll-options">
              {poll.options.map((option) => {
                const percent = poll.totalVotes
                  ? (option.votes / poll.totalVotes) * 100
                  : 0;
                const isSelected = selectedOption === option._id;
                return (
                  <button
                    key={option._id}
                    type="button"
                    className={isSelected ? "option selected" : "option"}
                    onClick={() => setSelectedOption(option._id)}
                  >
                    <span>{option.text}</span>
                    <span className="votes">{option.votes}</span>
                    <span className="bar">
                      <span style={{ width: `${percent}%` }} />
                    </span>
                    <span className="percent">{formatPercent(percent)}</span>
                  </button>
                );
              })}
            </div>

            <div className="poll-actions">
              <button
                type="button"
                className="primary"
                onClick={handleVote}
                disabled={!selectedOption || isVoting}
              >
                {isVoting ? "Submitting..." : "Submit vote"}
              </button>
              <p className="subtext">Share this link to invite others.</p>
              <div className="link-row">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button
                  type="button"
                  className="ghost"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  Copy link
                </button>
              </div>
            </div>
          </div>
        )}

        {message ? <div className="error">{message}</div> : null}
      </div>
    </div>
  );
}
