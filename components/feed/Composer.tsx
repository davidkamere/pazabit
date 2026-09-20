import { Flag } from "@/types";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";

type Props = {
  text: string;
  flag: Flag;
  tags: string[];
  groupOptions: string[];
  topGroups: string[];
  onText: (value: string) => void;
  onFlag: (flag: Flag) => void;
  onTags: (tags: string[]) => void;
  onSend: (audio?: { blob: Blob; durationSec: number; mimeType: string }) => void;
};

export function Composer({
  text,
  flag,
  tags,
  groupOptions,
  topGroups,
  onText,
  onFlag,
  onTags,
  onSend,
}: Props) {
  const toggleTag = (tag: string) =>
    onTags(
      tags.includes(tag) ? tags.filter((item) => item !== tag) : [...tags, tag],
    );

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioMimeType, setAudioMimeType] = useState("audio/webm");
  const [urgentSearch, setUrgentSearch] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setRecording(false);
  }, [recording]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
        setAudioBlob(blob);
        setAudioDuration(durationSec);
        setAudioMimeType(mimeType);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setAudioDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, []);

  const handleVoiceClick = () => {
    if (recording) {
      stopRecording();
    } else if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      new Audio(url).play();
    } else {
      startRecording();
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioDuration(0);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const handleSend = () => {
    if (!text.trim() && !audioBlob) return;
    onSend(audioBlob ? { blob: audioBlob, durationSec: audioDuration, mimeType: audioMimeType } : undefined);
    clearAudio();
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, []);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!urgentSearch) return topGroups;
    const lower = urgentSearch.toLowerCase();
    return groupOptions.filter((tag) => tag.toLowerCase().includes(lower)).slice(0, 5);
  }, [groupOptions, topGroups, urgentSearch]);

  // Groups to display: search results if searching, otherwise topGroups
  const displayGroups = urgentSearch ? filteredGroups : topGroups;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border-t border-line bg-black px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto max-w-4xl">
        {/* Audio preview */}
        {audioBlob && (
          <div className="mb-2 flex items-center gap-2 bg-[#1c2021] rounded-xl p-2">
            <button
              onClick={() => {
                const url = URL.createObjectURL(audioBlob);
                new Audio(url).play();
              }}
              className="grid size-8 place-items-center rounded-full bg-lime text-ink"
              aria-label="Play recording"
            >
              <Icon name="play" className="size-3" />
            </button>
            <div className="flex-1 flex items-center gap-2 text-[12px] text-lime">
              <span>{formatDuration(audioDuration)}</span>
              <span className="text-[#6b6b6b]">|</span>
              <span>voice note</span>
            </div>
            <button
              onClick={clearAudio}
              className="text-[#8f8f8f] hover:text-white text-[18px]"
              aria-label="Delete recording"
            >
              ×
            </button>
          </div>
        )}

        {/* Message input - highest priority */}
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={(event) => onText(event.target.value)}
            placeholder={audioBlob ? "add a caption..." : "type a message..."}
            rows={1}
            className="block min-h-10 flex-1 resize-none bg-transparent py-2 text-[20px] leading-6 text-lime outline-none placeholder:text-[#198f2e]"
          />
          <button
            onClick={handleVoiceClick}
            className={cn(
              "mb-1 grid size-9 place-items-center transition",
              recording
                ? "bg-alert text-black animate-pulse"
                : audioBlob
                  ? "text-lime"
                  : "text-[#8f8f8f] hover:text-white",
            )}
            aria-label={recording ? "Stop recording" : audioBlob ? "Play recording" : "Record voice"}
          >
            <Icon name={recording ? "stop" : "voice"} className="size-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={!text.trim() && !audioBlob}
            className="mb-1 grid size-10 place-items-center rounded-full bg-lime text-black transition hover:bg-[#71f487] disabled:opacity-25"
            aria-label="Send message"
          >
            <Icon name="send" className="size-5" />
          </button>
        </div>

        {/* Flag buttons - second priority */}
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

        {/* Group search & toggles - only when urgent, lowest priority */}
        {flag === "urgent" && displayGroups.length > 0 && (
          <div className="mt-2">
            <input
              type="text"
              value={urgentSearch}
              onChange={(e) => setUrgentSearch(e.target.value)}
              placeholder="Search groups..."
              className="w-full rounded-xl bg-[#0b0b0b] px-3 py-2 text-sm text-[#1779ff] outline-none placeholder:text-[#626967] focus:ring-2 focus:ring-[#1779ff]"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {displayGroups.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "border px-1.5 py-0 text-[10px]",
                    tags.includes(tag)
                      ? "border-[#1779ff] bg-[#1779ff] text-black"
                      : "border-[#1779ff] text-[#1779ff]",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
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
        "border px-1.5 py-0 text-[10px]",
        active ? activeColor : color,
      )}
    >
      {label}
    </button>
  );
}