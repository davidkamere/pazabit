import { Group, Message } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function TagModal({
  message,
  groups,
  selected,
  onSelect,
  onClose,
  onConfirm,
}: {
  message: Message;
  groups: Group[];
  selected: string[];
  onSelect: (values: string[]) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [search, setSearch] = useState("");

  const availableGroups = groups.filter(
    (group) => !message.groups.includes(group.tag),
  );
  const filteredGroups = availableGroups.filter((g) =>
    g.tag.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (tag: string) =>
    onSelect(
      selected.includes(tag)
        ? selected.filter((item) => item !== tag)
        : [...selected, tag],
    );

  const community = message.flag !== "urgent";

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#3b4140] bg-[#171a1a] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-lime">
              Escalate report
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-[-.04em]">
              Send to action groups
            </h3>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white">
            <Icon name="close" className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#abb3b0]">
          {community
            ? "Community verification unlocked this report for escalation. Add it to another action group."
            : "This urgent report will be delivered securely to the selected groups."}
        </p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search groups..."
          className="mt-4 w-full rounded-xl border border-line bg-[#1e2222] px-3 py-2 text-sm text-white outline-none placeholder:text-[#626967] focus:border-lime"
          autoFocus
        />
        <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2">
          {filteredGroups.length ? (
            filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => toggle(group.tag)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                  selected.includes(group.tag)
                    ? "border-lime bg-[#202b1b]"
                    : "border-line bg-[#1d2121] hover:border-[#49504e]",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-md border",
                    selected.includes(group.tag)
                      ? "border-lime bg-lime text-ink"
                      : "border-[#59605e]",
                  )}
                >
                  {selected.includes(group.tag) && (
                    <Icon name="check" className="size-3" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-bold">{group.tag}</p>
                  <p className="mt-0.5 text-xs text-muted">{group.description}</p>
                </div>
                <Icon name="lock" className="ml-auto size-3.5 text-muted" />
              </button>
            ))
          ) : availableGroups.length > 0 ? (
            <p className="rounded-xl border border-line bg-[#1d2121] px-3 py-4 text-sm text-muted">
              No groups match
            </p>
          ) : (
            <p className="rounded-xl border border-line bg-[#1d2121] px-3 py-4 text-sm text-muted">
              This report has already been delivered to every available action group.
            </p>
          )}
        </div>
        <button
          onClick={onConfirm}
          disabled={!selected.length}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink disabled:opacity-40"
        >
          <Icon name="send" className="size-4" />
          Deliver to {selected.length || "…"} group{selected.length === 1 ? "" : "s"}
        </button>
      </div>
    </div>
  );
}