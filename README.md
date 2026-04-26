# SpeakUp CRM

Мини-CRM для ИИ-ассистента Ани — демо-кейс автоматизации продаж в онлайн-школе.

## Что внутри

- **Дашборд** — метрики + воронка конверсии
- **Список лидов** — фильтры по статусу, поиск, скоринг
- **Карточка лида** — данные, оффер, эскалация, кнопка Telegram
- **Диалог** — история переписки с Аней
- **Форма ответа** — UI для отправки сообщений

## Стек

Next.js 14 (App Router) + Tailwind CSS + Supabase

## Деплой на Vercel (3 минуты)

### 1. Залей на GitHub

```bash
cd speakup-crm
git init
git add .
git commit -m "initial commit"
gh repo create speakup-crm --public --push
```

Или создай репо на github.com вручную и push.

### 2. Подключи Vercel

1. Зайди на [vercel.com](https://vercel.com)
2. Нажми **Add New → Project**
3. Выбери репо `speakup-crm`
4. В разделе **Environment Variables** добавь:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://soctkgdhlaexwnglukov.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_d2ZI2q5-TSCqhNgQg4qJ6Q_JYObdmT0` |

5. Нажми **Deploy**

Готово! CRM будет доступна по ссылке вида `speakup-crm.vercel.app`.

### 3. Локальный запуск (опционально)

```bash
npm install
cp .env.example .env.local
# заполни .env.local своими ключами
npm run dev
```

Откроется на `http://localhost:3000`.

## Supabase RLS

Если данные не загружаются — проверь что в Supabase включен доступ для anon-ключа к таблице `leads`. Самый быстрый способ для демо:

```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for anon" ON leads FOR SELECT USING (true);
```

## Структура

```
src/
├── app/
│   ├── layout.js          # Root layout
│   ├── globals.css         # Tailwind + стили
│   ├── page.js             # Дашборд
│   └── leads/
│       ├── page.js         # Список лидов
│       └── [chatId]/
│           └── page.js     # Карточка лида
├── components/
│   ├── Sidebar.js
│   ├── StatusBadge.js
│   └── ScoreBadge.js
└── lib/
    ├── supabase.js         # Supabase client
    └── helpers.js          # Утилиты
```
