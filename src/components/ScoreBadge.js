export default function ScoreBadge({ score }) {
  const color =
    score >= 8 ? "text-red-400" : score >= 5 ? "text-amber-400" : "text-gray-400";
  return (
    <span className={`inline-flex items-center gap-1 font-bold text-sm ${color}`}>
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z" />
      </svg>
      {score}/10
    </span>
  );
}
