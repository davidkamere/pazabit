export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
export const formatTime = (seconds: number) =>
  `0:${String(seconds).padStart(2, "0")}`;
