import { supabase } from "@/lib/supabase";
import { getScore } from "@/lib/helpers";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import ScoreBadge from "@/components/ScoreBadge";
import { timeAgo, deriveStatus } from "@/lib/helpers";

export const revalidate = 0; // always fresh

async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  return (data || []).map((l) => ({ ...l, _status: deriveStatus(l), _score: getScore(l) }));
}

export default async function DashboardPage() {
  const leads = await getLeads();

  const total = leads.length;
  const booked = leads.filter((l) => l.trial_booked).length;
  const qualified = leads.filter((l) => ["qualified", "trial_booked"].includes(l._status)).length;
  const withPhone = leads.filter((l) => l.phone).length;
  const escalated = leads.filter((l) => l.needs_human).length;
  const lost = leads.filter((l) => l._status === "lost").length;
  const withOffer = leads.filter((l) => l.offer_code).length;
  const today = leads.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const funnel = [
    { label: "Всего диалогов", value: total, color: "bg-indigo-500" },
    { label: "Телефон оставили", value: withPhone, color: "bg-violet-500" },
    { label: "Квалифицированы", value: qualified, color: "bg-amber-500" },
    { label: "Записаны на пробный", value: booked, color: "bg-emerald-500" },
  ];

  const stats = [
    { label: "Всего лидов", value: total, sub: `${today} сегодня`, accent: "text-indigo-400" },
    { label: "Записаны на пробный", value: booked, sub: total > 0 ? `${Math.round((booked / total) * 100)}% конверсия` : "—", accent: "text-emerald-400" },
    { label: "Ждут решения", value: qualified - booked, sub: "квалифицированы", accent: "text-amber-400" },
    { label: "Эскалации", value: escalated, sub: "требуют менеджера", accent: "text-red-400" },
    { label: "Потеряны", value: lost, sub: "ушли", accent: "text-gray-400" },
    { label: "Офферы выданы", value: withOffer, sub: `из ${total} диалогов`, accent: "text-violet-400" },
  ];

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-1">Дашборд</h1>
        <p className="text-gray-500 text-sm mb-6">Статистика работы ИИ-ассистента Ани</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">
          {stats.map((c, i) => (
            <div key={i} className="bg-dark-800 rounded-xl border border-dark-700 p-5">
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">{c.label}</div>
              <div className={`text-3xl font-bold ${c.accent}`}>{c.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 mb-5">
          <h3 className="text-base font-semibold mb-4">Воронка конверсии</h3>
          <div className="flex flex-col gap-3">
            {funnel.map((st, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-36 text-sm text-gray-400 text-right">{st.label}</div>
                <div className="flex-1 h-8 bg-dark-700 rounded-md overflow-hidden">
                  <div
                    className={`h-full ${st.color} rounded-md flex items-center justify-end pr-3 transition-all duration-500`}
                    style={{ width: total > 0 ? `${(st.value / total) * 100}%` : "0%", minWidth: st.value > 0 ? 40 : 0 }}
                  >
                    <span className="text-sm font-bold text-white">{st.value}</span>
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600">
                  {i > 0 && total > 0 ? `${Math.round((st.value / total) * 100)}%` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h3 className="text-base font-semibold mb-4">Последние лиды</h3>
          {leads.length === 0 && <p className="text-gray-500 text-center py-8">Лидов пока нет</p>}
          {leads.slice(0, 8).map((l) => (
            <Link
              key={l.id}
              href={`/leads/${l.chat_id}`}
              className="flex items-center justify-between py-3 border-b border-dark-700/50 last:border-0 hover:bg-dark-700/30 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center text-sm font-semibold text-accent">
                  {l.name?.[0] || "?"}
                </div>
                <div>
                  <div className="text-sm font-medium">{l.name || "Без имени"}</div>
                  <div className="text-xs text-gray-500">{l.goal || "—"} · {l.level || "?"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ScoreBadge score={l._score} />
                <StatusBadge status={l._status} />
                <span className="text-xs text-gray-600 w-16 text-right">{timeAgo(l.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
