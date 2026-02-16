import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from "../lib/api";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((option) => option.trim()).filter(Boolean);

    if (trimmedQuestion.length < 5) {
      setError("Question must be at least 5 characters.");
      return;
    }

    if (trimmedOptions.length < 2) {
      setError("Please provide at least two options.");
      return;
    }

    try {
      setIsSubmitting(true);
      const poll = await createPoll({
        question: trimmedQuestion,
        options: trimmedOptions,
      });
      navigate(`/poll/${poll._id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create poll.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Live Poll Rooms</p>
        <h1>Create a poll in seconds</h1>
        <p className="subtext">
          Ask a question, share the link, and watch results update together.
        </p>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Poll question</span>
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What should we ship next?"
          />
        </label>

        <div className="options">
          <span>Options</span>
          {options.map((option, index) => (
            <div className="option-row" key={`option-${index}`}>
              <input
                type="text"
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => removeOption(index)}
                  aria-label="Remove option"
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}
          <button type="button" className="ghost" onClick={addOption}>
            Add option
          </button>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create poll"}
        </button>
      </form>
    </div>
  );
}
