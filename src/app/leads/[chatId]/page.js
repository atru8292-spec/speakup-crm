"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { deriveStatus, getScore, formatSlot, OFFER_MAP } from "@/lib/helpers";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";
import ScoreBadge from "@/components/ScoreBadge";

// Mock dialog data — in production, fetch from Redis via API route
const MOCK_DIALOGS = {
  "111111111": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня, школа английского SpeakUp. Подскажите, как могу к вам обращаться?" },
    { role: "user", text: "Максим" },
    { role: "bot", text: "Очень приятно, Максим! 🙂 Какой у вас уровень английского?" },
    { role: "user", text: "B1, средний" },
    { role: "bot", text: "Поняла! А для чего планируете учить?" },
    { role: "user", text: "Для работы, переговоры с иностранными партнёрами" },
    { role: "bot", text: "Оставьте номер телефона 📱" },
    { role: "user", text: "+7 999 123 45 67" },
    { role: "bot", text: "Максим, под переговоры идеально — Бизнес-английский 💼 Хотите на пробный?" },
    { role: "user", text: "Да, давайте!" },
    { role: "bot", text: "Записала вас на понедельник в 14:00 🎉 Ссылка на Zoom придёт за час до урока!" },
  ],
  "222222222": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня. Как обращаться?" },
    { role: "user", text: "Анна" },
    { role: "bot", text: "Приятно, Анна! Какой уровень?" },
    { role: "user", text: "A2, начинающий" },
    { role: "bot", text: "Для чего учите?" },
    { role: "user", text: "Путешествия" },
    { role: "bot", text: "Оставьте номер 📱" },
    { role: "user", text: "+7 903 456 78 90" },
    { role: "bot", text: "Анна, под путешествия — Elementary→Pre-Intermediate 📗 9 900₽/мес. Хотите на пробный?" },
    { role: "user", text: "Дороговато…" },
    { role: "bot", text: "Между нами — дам 10% на первый месяц 🙂 И начнём с бесплатного пробного. По рукам?" },
    { role: "user", text: "Подумаю, спасибо" },
  ],
  "333333333": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня. Как обращаться?" },
    { role: "user", text: "Игорь. Я уже у вас учился" },
    { role: "bot", text: "Приятно, Игорь! Уровень?" },
    { role: "user", text: "B2" },
    { role: "bot", text: "Для чего?" },
    { role: "user", text: "IELTS, переезд в Канаду. Но сначала хочу вернуть деньги за прошлый курс" },
    { role: "bot", text: "Секунду, Игорь, передаю вопрос специалисту — напишет в течение пары минут 🙌" },
  ],
  "444444444": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня. Как обращаться?" },
    { role: "user", text: "Елена" },
    { role: "bot", text: "Приятно, Елена! Какой уровень?" },
    { role: "user", text: "Нулевой, это для сына 12 лет" },
  ],
  "555555555": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня. Как обращаться?" },
    { role: "user", text: "Дмитрий" },
    { role: "bot", text: "Приятно! Уровень?" },
    { role: "user", text: "B1" },
    { role: "bot", text: "Для чего?" },
    { role: "user", text: "Просто общение, хочу свободно говорить" },
    { role: "bot", text: "Дарю месяц Разговорного клуба бесплатно 🗣 Хотите на пробный?" },
    { role: "user", text: "Да!" },
    { role: "bot", text: "Записала на воскресенье в 18:00 🎉" },
  ],
  "666666666": [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня. Как обращаться?" },
    { role: "user", text: "Ольга" },
    { role: "bot", text: "Уровень?" },
    { role: "user", text: "C1" },
    { role: "bot", text: "Для чего?" },
    { role: "user", text: "TOEFL" },
    { role: "bot", text: "Под TOEFL — индивидуальная подготовка, рассрочка 0%. Хотите на пробный?" },
    { role: "user", text: "Нет, нашла другую школу" },
  ],
  fallback: [
    { role: "bot", text: "Здравствуйте! 👋 Меня зовут Аня, школа английского SpeakUp." },
  ],
};

export default function LeadDetailPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [replySent, setReplySent] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("chat_id", chatId)
        .limit(1);
      if (data?.[0]) {
        const l = data[0];
        setLead({ ...l, _status: deriveStatus(l), _score: getScore(l) });
      }
      setLoading(false);
    })();
  }, [chatId]);

  const dialog = MOCK_DIALOGS[chatId] || MOCK_DIALOGS.fallback;

  const handleSend = () => {
    if (replyText.trim()) setReplySent(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-dark-900">
        <Sidebar />
        <main className="ml-56 flex-1 p-8 flex items-center justify-center text-gray-500">Загрузка…</main>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen bg-dark-900">
        <Sidebar />
        <main className="ml-56 flex-1 p-8">
          <p className="text-gray-500">Лид не найден (chat_id: {chatId})</p>
          <button onClick={() => router.push("/leads")} className="mt-4 text-accent text-sm hover:underline">← Назад к списку</button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="ml-56 flex-1 p-8">
        {/* Back */}
        <button
          onClick={() => router.push("/leads")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Назад к списку
        </button>

        <div className="grid grid-cols-[340px_1fr] gap-5">
          {/* ─── LEFT: Lead Info ─── */}
          <div className="flex flex-col gap-4">
            {/* Card */}
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-xl font-bold text-accent">
                  {lead.name?.[0] || "?"}
                </div>
                <div>
                  <div className="text-lg font-semibold">{lead.name || "Без имени"}</div>
                  <StatusBadge status={lead._status} />
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: "📞 Телефон", value: lead.phone || "не указан" },
                  { label: "📊 Уровень", value: lead.level || "?" },
                  { label: "🎯 Цель", value: lead.goal || "—" },
                  { label: "📅 Пробный", value: lead.trial_slot ? formatSlot(lead.trial_slot) : "не записан" },
                  { label: "🆔 chat_id", value: lead.chat_id },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-500">{r.label}</span>
                    <span className="font-medium text-right max-w-[180px] truncate">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500">⭐ Скоринг</span>
                  <ScoreBadge score={lead._score} />
                </div>
              </div>
            </div>

            {/* Offer */}
            {lead.offer_code && (
              <div className="bg-violet-950/40 rounded-xl border border-violet-900/50 p-5">
                <div className="text-[11px] text-violet-400 uppercase tracking-wider mb-1">🎁 Оффер</div>
                <div className="text-sm font-semibold text-violet-300">{OFFER_MAP[lead.offer_code] || lead.offer_code}</div>
                {lead.offer_reason && <div className="text-xs text-violet-500 mt-1">{lead.offer_reason}</div>}
              </div>
            )}

            {/* Escalation */}
            {lead.needs_human && (
              <div className="bg-red-950/40 rounded-xl border border-red-900/50 p-5">
                <div className="text-[11px] text-red-400 uppercase tracking-wider mb-1">🆘 Эскалация</div>
                <div className="text-sm text-red-300">{lead.escalation_reason || "Причина не указана"}</div>
              </div>
            )}

            {/* Telegram button */}
            <a
              href={`tg://user?id=${lead.chat_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-accent text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-accent-light transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141a.506.506 0 01.171.325c.016.093.036.306.02.472z" />
              </svg>
              Открыть в Telegram
            </a>
          </div>

          {/* ─── RIGHT: Dialog ─── */}
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5 flex flex-col" style={{ maxHeight: "78vh" }}>
            <div className="text-sm font-semibold text-gray-400 mb-3">💬 Диалог с Аней</div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
              {dialog.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "bot"
                        ? "bg-dark-700 border border-dark-600 rounded-[14px_14px_14px_4px]"
                        : "bg-accent/15 border border-accent/20 rounded-[14px_14px_4px_14px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply */}
            <div className="border-t border-dark-700 pt-3 mt-3">
              {replySent ? (
                <div className="text-center text-emerald-400 text-sm py-2">✅ Сообщение отправлено (демо)</div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3.5 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-accent/50"
                    placeholder="Написать клиенту…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim()}
                    className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-accent-light transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Отправить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
