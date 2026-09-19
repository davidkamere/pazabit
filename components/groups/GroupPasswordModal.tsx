import { useState, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";

export function GroupPasswordModal({
  groupTag,
  onSubmit,
  onCancel,
}: {
  groupTag: string;
  onSubmit: (password: string) => void;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError(false);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#3b4140] bg-[#171a1a] p-6 shadow-2xl">
        <div className="flex justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-lime">Private group</p>
            <h3 className="mt-2 text-xl font-bold tracking-[-.04em]">Enter password for {groupTag}</h3>
          </div>
          <button onClick={handleCancel} className="text-muted hover:text-white">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          This group is locked. Enter the password to join.
        </p>
        <form onSubmit={handleSubmit} className="mt-5">
          <label className="block text-xs font-bold uppercase tracking-wide text-muted">
            Password
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(false);
              }}
              placeholder="Enter password"
              className={`mt-2 w-full rounded-xl border bg-[#1e2222] px-3 py-3 text-sm text-white outline-none placeholder:text-[#626967] focus:border-lime ${
                error ? "border-alert" : "border-line"
              }`}
              autoComplete="off"
            />
          </label>
          {error && <p className="mt-2 text-sm text-alert">Incorrect password</p>}
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-white hover:bg-[#191919]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="flex-1 items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink disabled:opacity-40"
            >
              Join group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}