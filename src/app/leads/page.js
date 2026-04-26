"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { deriveStatus, getScore, timeAgo } from "@/lib/helpers";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";
import ScoreBadge from "@/components/ScoreBadge";
import Link from "next/link";

const FILTERS = [
  { key: "all", label: "Все" },
  { key: "new", label: "Новые" },
  { key: "qualified", label: "Квалиф." },
  { key: "trial_booked", label: "Записаны" },
  { key: "escalated", label: "Эскалация" },
  { key: "lost", label: "Потеряны" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      setLeads((data || []).map((l) => ({ ...l, _status: deriveStatus(l), _score: getScore(l) })));
      setLoading(false);
    })();
  }, []);

  const filtered = leads.filter((l) => {
    if (filter !== "all" && l._status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.name?.toLowerCase().includes(q) || l.phone?.includes(q);
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-5">Лиды</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === f.key
                  ? "border-accent text-accent bg-accent/10"
                  : "border-dark-600 text-gray-400 hover:text-gray-200"
              }`}
            >
              {f.label} {f.key === "all" ? `(${leads.length})` : ""}
            </button>
          ))}
          <input
            className="ml-auto w-56 bg-dark-700 border border-dark-600 rounded-lg px-3.5 py-1.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-accent/50"
            placeholder="Поиск по имени / телефону…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_90px] gap-3 px-5 py-3 border-b border-dark-700 text-[11px] text-gray-500 uppercase tracking-wider">
            <div>Клиент</div>
            <div>Цель</div>
            <div>Уровень</div>
            <div>Статус</div>
            <div>Score</div>
            <div>Когда</div>
          </div>

          {loading && <div className="text-center text-gray-500 py-12">Загрузка…</div>}

          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-500 py-12">Нет лидов по фильтру</div>
          )}

          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/leads/${l.chat_id}`}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_90px] gap-3 px-5 py-3 border-b border-dark-700/40 items-center hover:bg-dark-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-sm font-semibold text-accent shrink-0">
                  {l.name?.[0] || "?"}
                </div>
                <div>
                  <div className="text-sm font-medium">{l.name || "Без имени"}</div>
                  <div className="text-xs text-gray-500">{l.phone || "нет телефона"}</div>
                </div>
              </div>
              <div className="text-sm text-gray-400">{l.goal || "—"}</div>
              <div className="text-sm text-gray-400">{l.level || "?"}</div>
              <div><StatusBadge status={l._status} /></div>
              <div><ScoreBadge score={l._score} /></div>
              <div className="text-xs text-gray-600">{timeAgo(l.created_at)}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
