"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Дашборд", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { href: "/leads", label: "Лиды", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-dark-800 border-r border-dark-700 flex flex-col z-20">
      <div className="px-5 pt-5 pb-4 border-b border-dark-700">
        <div className="text-xl font-bold text-accent tracking-tight">SpeakUp</div>
        <div className="text-xs text-gray-500 mt-0.5">CRM · Панель Ани</div>
      </div>
      <nav className="mt-3 flex flex-col gap-0.5">
        {nav.map((n) => {
          const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm border-l-[3px] transition-colors ${
                active
                  ? "border-accent text-accent bg-dark-700"
                  : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-dark-700/50"
              }`}
            >
              {n.icon}
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
