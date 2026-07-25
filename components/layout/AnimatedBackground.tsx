export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      {/* faint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* drifting orange blob */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-600/20 blur-[120px] animate-blob-1" />
      {/* drifting indigo blob (your AI accent) */}
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-blob-2" />
      {/* vignette so edges stay dark and cards stay readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/0 via-zinc-950/40 to-zinc-950" />
    </div>
  );
}
