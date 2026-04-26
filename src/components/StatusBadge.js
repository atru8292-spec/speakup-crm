import { STATUS_MAP } from "@/lib/helpers";

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.new;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.tw}`}>
      {s.label}
    </span>
  );
}
