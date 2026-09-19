import { useState, useRef, useEffect } from "react";
import { Group } from "@/types";
import { Icon } from "@/components/ui/Icon";

export function FeedHeader({
  group,
  groups,
  activeGroup,
  onBack,
  onSelect,
  onCreate,
}: {
  group?: Group;
  groups: Group[];
  activeGroup: string | null;
  onBack: () => void;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const choose = (id: string | null) => {
    onSelect(id);
    setMenuOpen(false);
    setSearch("");
  };

  const filteredGroups = groups.filter((g) =>
    g.tag.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setSearch("");
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="relative z-30 flex h-[58px] items-center border-b border-line bg-black px-5 sm:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button onClick={onBack} className="shrink-0 text-lime hover:text-white">
          pazabit/
        </button>
        <h1 className="truncate text-[22px] text-[#1779ff]">
          {group?.tag ?? "#mesh"}
        </h1>
      </div>
      <span className="mr-3 size-2 rounded-full bg-lime" title="Mesh connected" />
      <button
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open mesh feeds"
        aria-expanded={menuOpen}
        className="grid size-10 place-items-center text-[#949494] hover:text-white"
      >
        <Icon name={menuOpen ? "close" : "menu"} className="size-5" />
      </button>
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-3 top-[50px] z-50 w-64 border border-[#333] bg-[#0b0b0b] p-1 shadow-2xl"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="w-full rounded-xl border border-line bg-[#1e2222] px-3 py-2 text-sm text-white outline-none placeholder:text-[#626967] focus:border-lime"
            autoFocus
          />
          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            <button
              onClick={() => choose(null)}
              className="flex w-full items-center justify-between px-3 py-3 text-left text-sm text-[#e8e8e8] hover:bg-[#191919]"
            >
              #mesh
              {activeGroup === null && (
                <Icon name="check" className="size-4 text-lime" />
              )}
            </button>
            {filteredGroups.map((item) => (
              <button
                key={item.id}
                onClick={() => choose(item.id)}
                className="flex w-full items-center justify-between px-3 py-3 text-left text-sm text-[#e8e8e8] hover:bg-[#191919]"
              >
                <span>{item.tag}</span>
                {activeGroup === item.id && (
                  <Icon name="check" className="size-4 text-lime" />
                )}
              </button>
            ))}
            {filteredGroups.length === 0 && groups.length > 0 && (
              <p className="px-3 py-3 text-sm text-muted">No groups match</p>
            )}
            <div className="my-1 border-t border-[#333]" />
            <button
              onClick={() => {
                setMenuOpen(false);
                onCreate();
              }}
              className="flex w-full items-center gap-2 px-3 py-3 text-left text-sm text-lime hover:bg-[#102412]"
            >
              <Icon name="plus" className="size-4" />
              create private group
            </button>
          </div>
        </div>
      )}
    </header>
  );
}