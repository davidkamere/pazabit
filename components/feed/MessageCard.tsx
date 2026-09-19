import { Message } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { cn, formatTime } from "@/lib/utils";
import { ESCALATION_THRESHOLD } from "@/lib/constants";
import { useState, useRef, useEffect } from "react";
import { AudioAttachment } from "@/domain/pazabit-events";

export function MessageCard({
  message,
  onVote,
  onTag,
  onPlayAudio,
}: {
  message: Message;
  onVote: (id: string, vote: "up" | "down") => void;
  onTag: (message: Message) => void;
  onPlayAudio?: (messageId: string) => Promise<AudioAttachment | null>;
}) {
  // Community verification unlocks escalation permanently; later participants may
  // route the same verified report to additional action groups.
  const canTag = message.flag === "urgent" || message.upvotes >= ESCALATION_THRESHOLD;
  return (
    <article className="border-b border-[#191919] px-6 py-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-[11px] text-[#6b6b6b]">{message.time} ago</span>
        {message.flag && <FlagBadge flag={message.flag} />}
      </div>
      <p className="mt-1.5 text-[15px] leading-6 text-[#e8e8e8]">{message.body}</p>
      {message.voiceSeconds && (
        <VoiceNote
          seconds={message.voiceSeconds}
          messageId={message.id}
          onPlayAudio={onPlayAudio}
        />
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {message.arrival === "community" && (
          <span className="text-[11px] text-lime">[upvoted → tagged]</span>
        )}
        {message.groups.map((tag) => (
          <span key={tag} className="text-[11px] text-[#1779ff]">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1">
        <VoteButton
          type="up"
          active={message.voted === "up"}
          count={message.upvotes}
          onClick={() => onVote(message.id, "up")}
        />
        <VoteButton
          type="down"
          active={message.voted === "down"}
          count={message.downvotes}
          onClick={() => onVote(message.id, "down")}
        />
        {canTag && (
          <button onClick={() => onTag(message)} className="ml-3 text-xs text-lime hover:text-white">
            tag
          </button>
        )}
      </div>
    </article>
  );
}
function FlagBadge({ flag }: { flag: NonNullable<Message["flag"]> }) {
  const urgent = flag === "urgent";
  return (
    <span className={cn("text-[11px] font-bold", urgent ? "text-alert" : "text-warn")}>
      {urgent ? "[URGENT]" : "[ONGOING]"}
    </span>
  );
}
function VoteButton({
  type,
  active,
  count,
  onClick,
}: {
  type: "up" | "down";
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-0.5 px-1 py-1 text-[11px]", active ? "text-lime" : "text-[#858585] hover:text-white")}
    >
      <Icon name={type} className="size-3" />
      {count}
    </button>
  );
}
function VoiceNote({
  seconds,
  messageId,
  onPlayAudio,
}: {
  seconds: number;
  messageId: string;
  onPlayAudio?: (messageId: string) => Promise<AudioAttachment | null>;
}) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current?.src && URL.revokeObjectURL(audioRef.current.src);
    };
  }, []);

  const handlePlay = async () => {
    if (!onPlayAudio) return;
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const audio = await onPlayAudio(messageId);
      if (audio) {
        const blob = new Blob([audio.data], { type: audio.mimeType });
        const url = URL.createObjectURL(blob);
        const audioEl = new Audio(url);
        audioRef.current = audioEl;
        audioEl.onended = () => setPlaying(false);
        audioEl.onerror = () => setPlaying(false);
        await audioEl.play();
        setPlaying(true);
      }
    } catch (err) {
      console.error("Failed to play audio:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex max-w-sm items-center gap-3 rounded-xl border border-line bg-[#1c2021] p-2.5">
      <button onClick={handlePlay} disabled={loading} className="grid size-8 place-items-center rounded-full bg-lime text-ink">
        <Icon name={playing ? "pause" : loading ? "loader" : "play"} className="size-3" />
      </button>
      <div className="flex-1">
        <div className="flex h-5 items-center gap-0.5">
          {Array.from({ length: 34 }, (_, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-[#7d8785]"
              style={{ height: `${5 + ((i * 13) % 14)}px` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted">{formatTime(seconds)}</span>
      </div>
    </div>
  );
}