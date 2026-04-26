export const STATUS_MAP = {
  new: { label: "Новый", tw: "text-indigo-400 bg-indigo-950 border-indigo-800" },
  qualified: { label: "Квалифицирован", tw: "text-amber-400 bg-amber-950 border-amber-800" },
  trial_booked: { label: "Записан", tw: "text-emerald-400 bg-emerald-950 border-emerald-800" },
  escalated: { label: "Эскалация", tw: "text-red-400 bg-red-950 border-red-800" },
  lost: { label: "Потерян", tw: "text-gray-400 bg-gray-900 border-gray-700" },
};

export const OFFER_MAP = {
  discount_10: "Скидка 10%",
  free_speaking_club: "Разг. клуб бесплатно",
  free_assessment: "Бесплатный тест уровня",
  installment_0: "Рассрочка 0%",
};

export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "только что";
  if (mins < 60) return `${mins} мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч`;
  return `${Math.floor(hrs / 24)} дн`;
}

export function formatSlot(slot) {
  if (!slot) return "—";
  return new Date(slot).toLocaleString("ru-RU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function getScore(lead) {
  let s = 3;
  if (lead.name) s += 1;
  if (lead.phone) s += 1;
  if (lead.level) s += 1;
  if (lead.goal) s += 1;
  if (lead.trial_booked) s += 2;
  if (lead.offer_code && !lead.trial_booked) s -= 1;
  if (lead.needs_human) s -= 1;
  return Math.max(1, Math.min(10, s));
}

export function deriveStatus(lead) {
  if (lead.status && lead.status !== "new") return lead.status;
  if (lead.needs_human) return "escalated";
  if (lead.trial_booked) return "trial_booked";
  if (lead.phone && lead.goal) return "qualified";
  return "new";
}
