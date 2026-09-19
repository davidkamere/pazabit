import { Flag } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
type Props = {
  text: string;
  flag: Flag;
  tags: string[];
  groupOptions: string[];
  onText: (value: string) => void;
  onFlag: (flag: Flag) => void;
  onTags: (tags: string[]) => void;
  onSend: () => void;
};
export function Composer({
  text,
  flag,
  tags,
  groupOptions,
  onText,
  onFlag,
  onTags,
  onSend,
}: Props) {
  const toggleTag = (tag: string) =>
    onTags(
      tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
    );
  return (
    <div className="border-t border-line bg-black px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto max-w-4xl">
        {flag === "urgent" && (
          <div className="mb-2 flex flex-wrap gap-1">
            {groupOptions.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "border px-2 py-1 text-[11px]",
                  tags.includes(tag)
                    ? "border-[#1779ff] bg-[#1779ff] text-black"
                    : "border-[#1779ff] text-[#1779ff]",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={(event) => onText(event.target.value)}
            placeholder="type a message..."
            rows={1}
            className="block min-h-10 flex-1 resize-none bg-transparent py-2 text-[20px] leading-6 text-lime outline-none placeholder:text-[#198f2e]"
          />
          <button
            className="mb-1 grid size-9 place-items-center text-[#8f8f8f] hover:text-white"
            aria-label="Record voice"
          >
            <Icon name="voice" className="size-6" />
          </button>
          <button
            onClick={onSend}
            disabled={!text.trim()}
            className="mb-1 grid size-10 place-items-center rounded-full bg-lime text-black transition hover:bg-[#71f487] disabled:opacity-25"
            aria-label="Send message"
          >
            <Icon name="send" className="size-5" />
          </button>
        </div>
        <div className="flex gap-2 pb-1">
          <FlagButton
            label="normal"
            active={flag === null}
            onClick={() => onFlag(null)}
          />
          <FlagButton
            label="ongoing"
            active={flag === "ongoing"}
            tone="yellow"
            onClick={() => onFlag("ongoing")}
          />
          <FlagButton
            label="urgent"
            active={flag === "urgent"}
            tone="red"
            onClick={() => onFlag("urgent")}
          />
        </div>
      </div>
    </div>
  );
}
function FlagButton({
  label,
  active,
  tone,
  onClick,
}: {
  label: string;
  active: boolean;
  tone?: "red" | "yellow";
  onClick: () => void;
}) {
  const color =
    tone === "red"
      ? "border-alert text-alert"
      : tone === "yellow"
        ? "border-warn text-warn"
        : "border-lime text-lime";
  const activeColor =
    tone === "red"
      ? "bg-alert text-black"
      : tone === "yellow"
        ? "bg-warn text-black"
        : "bg-lime text-black";
  return (
    <button
      onClick={onClick}
      className={cn(
        "border px-1.5 py-0 text-[4px]",
        active ? activeColor : color,
      )}
    >
      {label}
    </button>
  );
}
