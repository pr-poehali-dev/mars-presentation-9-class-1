import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const MARS_IMAGE = "https://cdn.poehali.dev/projects/e299f5fd-2429-46f5-8bf1-d588a7d302ef/files/545ee67e-16d5-4031-8a69-543904218967.jpg";

const SLIDES = [
  { id: "hero", label: "Марс" },
  { id: "physical", label: "Характеристики" },
  { id: "atmosphere", label: "Атмосфера" },
  { id: "geology", label: "Геология" },
  { id: "missions", label: "Миссии" },
  { id: "colonization", label: "Колонизация" },
];

// --- Radar Chart ---
function RadarChart({ data, visible }: { data: { label: string; value: number }[]; visible: boolean }) {
  const cx = 160, cy = 160, r = 110, n = data.length;
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rv = visible ? (d.value / 100) * r : 0;
    return {
      x: cx + rv * Math.cos(angle),
      y: cy + rv * Math.sin(angle),
      lx: cx + (r + 30) * Math.cos(angle),
      ly: cy + (r + 30) * Math.sin(angle),
    };
  });
  const gridPts = (level: number) =>
    data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
    }).join(" ");
  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-[260px] mx-auto">
      {[0.25, 0.5, 0.75, 1].map((l, i) => (
        <polygon key={i} points={gridPts(l)} fill="none" stroke="rgba(232,98,26,0.15)" strokeWidth="1" />
      ))}
      {data.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="rgba(232,98,26,0.2)" strokeWidth="1" />;
      })}
      <polygon points={polyPoints} className="radar-fill" style={{ transition: "all 1s ease" }} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill="#f5a623" style={{ filter: "drop-shadow(0 0 4px rgba(245,166,35,0.8))", transition: "all 1s ease" }} />
      ))}
      {data.map((d, i) => {
        const lx = cx + (r + 30) * Math.cos((Math.PI * 2 * i) / n - Math.PI / 2);
        const ly = cy + (r + 30) * Math.sin((Math.PI * 2 * i) / n - Math.PI / 2);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,200,150,0.8)" fontSize="10" fontFamily="IBM Plex Sans, sans-serif">{d.label}</text>;
      })}
    </svg>
  );
}

// --- Bar Chart ---
function BarChart({ data, visible }: { data: { label: string; value: number; max: number; unit: string; color: string }[]; visible: boolean }) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = Math.round((item.value / item.max) * 100);
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-orange-200/80">{item.label}</span>
              <span className="text-sm font-mono" style={{ color: item.color }}>{item.value} {item.unit}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: visible ? `${pct}%` : "0%",
                background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                boxShadow: `0 0 8px ${item.color}55`,
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Stat Card ---
function StatCard({ value, unit, label, delay = 0 }: { value: string; unit: string; label: string; delay?: number }) {
  return (
    <div className="mars-card rounded-xl p-4 text-center animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="text-2xl font-bold gradient-text" style={{ fontFamily: "Oswald, sans-serif" }}>
        {value}<span className="text-base ml-1 text-orange-400/60">{unit}</span>
      </div>
      <div className="text-[10px] text-orange-200/45 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

const physicalData = [
  { label: "Диаметр", value: 6779, max: 12742, unit: "км", color: "#e8621a" },
  { label: "Масса", value: 10.7, max: 100, unit: "% от Земли", color: "#f5a623" },
  { label: "Сила тяжести", value: 37.6, max: 100, unit: "% от Земли", color: "#c1440e" },
  { label: "Длина суток", value: 24.6, max: 48, unit: "ч", color: "#e8621a" },
  { label: "Период обращения", value: 687, max: 1000, unit: "дней", color: "#f5a623" },
  { label: "Расстояние от Солнца", value: 228, max: 500, unit: "млн км", color: "#c1440e" },
];

const atmosphereData = [
  { label: "CO₂", value: 95.3 },
  { label: "N₂", value: 2.7 },
  { label: "Ar", value: 1.6 },
  { label: "O₂", value: 0.13 },
  { label: "Пыль", value: 60 },
];

const radarData = [
  { label: "CO₂", value: 95 },
  { label: "N₂", value: 3 },
  { label: "Ar", value: 2 },
  { label: "H₂O", value: 5 },
  { label: "O₂", value: 1 },
];

const colonizationFactors = [
  { label: "Сила тяжести", value: 38, unit: "%", color: "#e8621a", desc: "38% от земной — тело адаптируется" },
  { label: "Солнечная энергия", value: 43, unit: "%", color: "#f5a623", desc: "43% от земной освещённости" },
  { label: "Период суток", value: 97, unit: "%", color: "#c1440e", desc: "24,6 ч — почти как на Земле" },
  { label: "Доступность воды", value: 65, unit: "%", color: "#e8621a", desc: "Лёд на полюсах и под поверхностью" },
  { label: "Защита от радиации", value: 15, unit: "%", color: "#f5a623", desc: "Требуются защитные сооружения" },
  { label: "Пригодность атмосферы", value: 5, unit: "%", color: "#c1440e", desc: "Нужна терраформация или купола" },
];

const missions = [
  { year: "1965", mission: "Маринер-4", country: "США", desc: "Первые снимки поверхности с близкого расстояния" },
  { year: "1971", mission: "Маринер-9", country: "США", desc: "Первый орбитальный аппарат, карта всей планеты" },
  { year: "1976", mission: "Викинг 1 и 2", country: "США", desc: "Первая успешная посадка, поиск признаков жизни" },
  { year: "1997", mission: "Mars Pathfinder", country: "США", desc: "Первый марсоход Sojourner исследует поверхность" },
  { year: "2004", mission: "Spirit и Opportunity", country: "США", desc: "Opportunity проработал рекордные 14 лет" },
  { year: "2012", mission: "Curiosity", country: "США", desc: "Ядерный марсоход, ищет органику и воду" },
  { year: "2021", mission: "Perseverance + Ingenuity", country: "США", desc: "Первый вертолёт на другой планете" },
  { year: "2021", mission: "Тяньвэнь-1", country: "Китай", desc: "Первая китайская орбитальная-посадочная миссия" },
  { year: "2028", mission: "Mars Sample Return", country: "США / ЕКА", desc: "Доставка образцов грунта на Землю" },
];

const geologyItems = [
  { icon: "Mountain", name: "Олимп Монс", type: "Вулкан", stat: "21.9 км", desc: "Высочайшая гора Солнечной системы — в 2.5 раза выше Эвереста", color: "#e8621a" },
  { icon: "Waves", name: "Долины Маринер", type: "Каньон", stat: "4 000 км", desc: "Крупнейший каньон планеты, глубиной до 11 км, длиной как Австралия", color: "#f5a623" },
  { icon: "Layers", name: "Полярные шапки", type: "Ледники", stat: "3 км толщ.", desc: "Водяной лёд и сухой лёд CO₂. Сезонно расширяются и тают", color: "#c1440e" },
  { icon: "Droplets", name: "Древние русла", type: "Следы воды", stat: "3.5 млрд лет", desc: "Марс мог быть покрыт океаном 300 млн лет. Следы рек и берегов", color: "#e8621a" },
  { icon: "Atom", name: "Кратер Эллада", type: "Метеоритный кратер", stat: "2 300 км", desc: "Крупнейший ударный кратер на Марсе, глубиной 9 км", color: "#f5a623" },
  { icon: "Zap", name: "Вулканизм", type: "Геология", stat: "400 млн лет", desc: "Вулканы затихли 400 млн лет назад. Нет тектоники плит", color: "#c1440e" },
];

// =====================
// SLIDES
// =====================

function SlideHero({ active }: { active: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={MARS_IMAGE} alt="Марс" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0604]/90 via-[#0a0604]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0604]/80 via-transparent to-[#0a0604]/40" />
      </div>
      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-72 h-72 md:w-[420px] md:h-[420px] rounded-full overflow-hidden float-anim planet-glow opacity-60 hidden md:block">
        <img src={MARS_IMAGE} alt="" className="w-full h-full object-cover scale-150 -translate-x-8 -translate-y-6" />
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse at 30% 30%, transparent 40%, rgba(10,6,4,0.75) 100%)" }} />
      </div>
      <div className="relative z-10 max-w-2xl px-8 md:px-16">
        {active && <>
          <div className="animate-fade-up text-xs uppercase tracking-[0.4em] text-orange-400/70 mb-4" style={{ fontFamily: "Oswald" }}>
            Четвёртая планета Солнечной системы
          </div>
          <h1 className="animate-fade-up delay-100 text-8xl md:text-[9rem] font-bold leading-none glow-text gradient-text" style={{ fontFamily: "Oswald", fontWeight: 700 }}>
            МАРС
          </h1>
          <p className="animate-fade-up delay-200 text-lg text-orange-100/65 mt-5 leading-relaxed max-w-lg">
            Красная планета — место, где умерли вулканы, бушевали океаны и где, возможно, зародилась жизнь
          </p>
          <div className="animate-fade-up delay-300 flex flex-wrap gap-4 mt-8">
            {[
              { v: "227.9 млн км", l: "от Земли" },
              { v: "−63°C", l: "средняя температура" },
              { v: "2 луны", l: "Фобос и Деймос" },
            ].map((s, i) => (
              <div key={i} className="mars-card rounded-xl px-5 py-3">
                <div className="text-xl font-bold gradient-text" style={{ fontFamily: "Oswald" }}>{s.v}</div>
                <div className="text-xs text-orange-200/45 uppercase tracking-widest mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </>}
      </div>
    </div>
  );
}

function SlidePhysical({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 py-10 overflow-auto">
      {active && <>
        <div className="animate-fade-up mb-1 text-xs uppercase tracking-[0.3em] text-orange-400/70" style={{ fontFamily: "Oswald" }}>01 / Физические характеристики</div>
        <h2 className="animate-fade-up delay-100 text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "Oswald" }}>Параметры планеты</h2>
        <p className="animate-fade-up delay-200 text-orange-200/55 mb-6 text-sm">Марс — меньше Земли, но больше похож на неё, чем любая другая планета</p>
        <div className="mars-divider mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <StatCard value="6 779" unit="км" label="Диаметр" delay={0.1} />
          <StatCard value="24.6" unit="ч" label="Марсианские сутки" delay={0.2} />
          <StatCard value="687" unit="дней" label="Год на Марсе" delay={0.3} />
          <StatCard value="3.71" unit="м/с²" label="Ускорение свободного падения" delay={0.4} />
          <StatCard value="2" unit="луны" label="Спутники" delay={0.5} />
          <StatCard value="10.7%" unit="" label="Масса от Земли" delay={0.6} />
        </div>
        <div className="animate-fade-up delay-300 flex-1">
          <div className="text-sm text-orange-200/60 mb-4 uppercase tracking-wider" style={{ fontFamily: "Oswald" }}>Сравнение с Землёй</div>
          <BarChart data={physicalData} visible={active} />
        </div>
      </>}
    </div>
  );
}

function SlideAtmosphere({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 py-10 overflow-auto">
      {active && <>
        <div className="animate-fade-up mb-1 text-xs uppercase tracking-[0.3em] text-orange-400/70" style={{ fontFamily: "Oswald" }}>02 / Атмосфера и климат</div>
        <h2 className="animate-fade-up delay-100 text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "Oswald" }}>Воздух Марса</h2>
        <p className="animate-fade-up delay-200 text-orange-200/55 mb-5 text-sm">Атмосфера в 100 раз тоньше земной — температура падает до −143°C ночью</p>
        <div className="mars-divider mb-7" />
        <div className="grid md:grid-cols-2 gap-8 flex-1">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon: "Thermometer", label: "День", val: "+20°C" },
                { icon: "Snowflake", label: "Ночь", val: "−143°C" },
                { icon: "Wind", label: "Давление", val: "600 Па" },
                { icon: "CloudFog", label: "Пыльные бури", val: "Раз в 3 года" },
              ].map((item, i) => (
                <div key={i} className="mars-card rounded-xl p-3 animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  <Icon name={item.icon as "Wind"} size={16} className="text-orange-400 mb-1" />
                  <div className="text-[10px] text-orange-200/45 uppercase tracking-wider">{item.label}</div>
                  <div className="text-base font-bold gradient-text" style={{ fontFamily: "Oswald" }}>{item.val}</div>
                </div>
              ))}
            </div>
            <div className="mars-card rounded-xl p-5 animate-fade-up delay-400">
              <div className="text-xs uppercase tracking-widest text-orange-400/60 mb-3" style={{ fontFamily: "Oswald" }}>Состав атмосферы</div>
              {atmosphereData.map((item, i) => (
                <div key={i} className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-orange-300/70 w-10">{item.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: active ? `${Math.min(item.value, 100)}%` : "0%",
                      background: "linear-gradient(90deg, #c1440e88, #e8621a)",
                      transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                    }} />
                  </div>
                  <span className="text-xs text-orange-200/45 font-mono w-14 text-right">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-fade-up delay-200 flex flex-col items-center justify-center">
            <div className="text-xs uppercase tracking-widest text-orange-400/60 mb-3 text-center" style={{ fontFamily: "Oswald" }}>Радар атмосферы</div>
            <RadarChart data={radarData} visible={active} />
            <p className="text-center text-xs text-orange-200/35 mt-2">CO₂ доминирует — 95.3% состава</p>
          </div>
        </div>
      </>}
    </div>
  );
}

function SlideGeology({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 py-10 overflow-auto">
      {active && <>
        <div className="animate-fade-up mb-1 text-xs uppercase tracking-[0.3em] text-orange-400/70" style={{ fontFamily: "Oswald" }}>03 / Рельеф и геология</div>
        <h2 className="animate-fade-up delay-100 text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "Oswald" }}>Поверхность планеты</h2>
        <p className="animate-fade-up delay-200 text-orange-200/55 mb-5 text-sm">Самый высокий вулкан и самый глубокий каньон Солнечной системы — оба на Марсе</p>
        <div className="mars-divider mb-7" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
          {geologyItems.map((item, i) => (
            <div key={i} className="mars-card rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}>
                  <Icon name={item.icon as "Mountain"} size={15} style={{ color: item.color }} />
                </div>
                <span className="text-[9px] uppercase tracking-wider text-orange-200/35 border border-orange-900/30 rounded px-1.5 py-0.5">{item.type}</span>
              </div>
              <div className="text-xl font-bold mb-0.5" style={{ fontFamily: "Oswald", color: item.color }}>{item.stat}</div>
              <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "Oswald" }}>{item.name}</div>
              <p className="text-xs text-orange-200/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

function SlideMissions({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 py-10 overflow-auto">
      {active && <>
        <div className="animate-fade-up mb-1 text-xs uppercase tracking-[0.3em] text-orange-400/70" style={{ fontFamily: "Oswald" }}>04 / Космические миссии</div>
        <h2 className="animate-fade-up delay-100 text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "Oswald" }}>История исследований</h2>
        <p className="animate-fade-up delay-200 text-orange-200/55 mb-4 text-sm">Более 50 миссий к Марсу — половина закончилась неудачей</p>
        <div className="mars-divider mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard value="50+" unit="" label="Запущено миссий" delay={0.1} />
          <StatCard value="26" unit="" label="Успешных" delay={0.2} />
          <StatCard value="7" unit="" label="Марсоходов" delay={0.3} />
        </div>
        <div className="grid md:grid-cols-2 gap-x-8 flex-1">
          {missions.map((m, i) => (
            <div key={i} className="flex gap-3 animate-fade-up mb-3" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" style={{ boxShadow: "0 0 6px rgba(232,98,26,0.7)" }} />
                {i < missions.length - 1 && <div className="w-px flex-1 bg-orange-900/40 mt-1" />}
              </div>
              <div className="mars-card rounded-lg px-3 py-2.5 flex-1 mb-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-orange-400 font-mono text-xs font-bold">{m.year}</span>
                  <span className="text-[9px] uppercase tracking-widest text-orange-200/35 border border-orange-900/30 rounded px-1.5 py-0.5">{m.country}</span>
                </div>
                <div className="font-semibold text-white text-sm" style={{ fontFamily: "Oswald" }}>{m.mission}</div>
                <div className="text-xs text-orange-200/50 mt-0.5">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

function SlideColonization({ active }: { active: boolean }) {
  return (
    <div className="w-full h-full flex flex-col px-8 md:px-16 py-10 overflow-auto">
      {active && <>
        <div className="animate-fade-up mb-1 text-xs uppercase tracking-[0.3em] text-orange-400/70" style={{ fontFamily: "Oswald" }}>05 / Колонизация Марса</div>
        <h2 className="animate-fade-up delay-100 text-4xl md:text-5xl font-light text-white mb-2" style={{ fontFamily: "Oswald" }}>Второй дом человечества?</h2>
        <p className="animate-fade-up delay-200 text-orange-200/55 mb-5 text-sm">SpaceX и NASA разрабатывают планы первых поселений уже на 2029–2040-е годы</p>
        <div className="mars-divider mb-7" />
        <div className="grid md:grid-cols-2 gap-8 flex-1">
          <div>
            <div className="text-xs uppercase tracking-widest text-orange-400/60 mb-4" style={{ fontFamily: "Oswald" }}>Пригодность для жизни</div>
            <div className="space-y-4">
              {colonizationFactors.map((f, i) => (
                <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-orange-200/80">{f.label}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: f.color }}>{f.value}{f.unit}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-0.5">
                    <div className="h-full rounded-full" style={{
                      width: active ? `${f.value}%` : "0%",
                      background: `linear-gradient(90deg, ${f.color}88, ${f.color})`,
                      transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                      boxShadow: `0 0 6px ${f.color}44`,
                    }} />
                  </div>
                  <p className="text-[11px] text-orange-200/35">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-orange-400/60 mb-4" style={{ fontFamily: "Oswald" }}>Ключевые вызовы</div>
            <div className="space-y-2.5">
              {[
                { icon: "ShieldAlert", title: "Радиация", desc: "В 700 раз выше нормы — нужны подземные жилища" },
                { icon: "Flame", title: "Ресурсы", desc: "Вода из льда, кислород из CO₂ методом MOXIE" },
                { icon: "Rocket", title: "Транспорт", desc: "6–9 месяцев полёта, Starship на 100 пассажиров" },
                { icon: "Sprout", title: "Еда", desc: "Картофель в марсианском грунте — успешный эксперимент" },
                { icon: "Users", title: "Психология", desc: "Изоляция 2–3 года — главный риск миссии" },
                { icon: "Calendar", title: "Сроки", desc: "SpaceX — 2029–2033, NASA — 2040-е годы" },
              ].map((item, i) => (
                <div key={i} className="mars-card rounded-lg p-3 flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(232,98,26,0.12)", border: "1px solid rgba(232,98,26,0.25)" }}>
                    <Icon name={item.icon as "Flame"} size={13} className="text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm" style={{ fontFamily: "Oswald" }}>{item.title}</div>
                    <p className="text-xs text-orange-200/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>}
    </div>
  );
}

const slideComponents = [SlideHero, SlidePhysical, SlideAtmosphere, SlideGeology, SlideMissions, SlideColonization];

// =====================
// MAIN
// =====================
export default function Index() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const total = SLIDES.length;

  const goTo = useCallback((idx: number, dir: "next" | "prev" = "next") => {
    if (animating || idx === current) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 350);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % total, "next"), [current, goTo, total]);
  const prev = useCallback(() => goTo((current - 1 + total) % total, "prev"), [current, goTo, total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onEnd = (e: TouchEvent) => {
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) { if (dx > 0) next(); else prev(); }
    };
    window.addEventListener("touchstart", onStart);
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, [next, prev]);

  const SlideComponent = slideComponents[current];

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--mars-dark)" }}>
      <div className="stars-bg" />

      {/* Slide */}
      <div
        className="relative z-10 w-full h-full"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction === "next" ? "-40px" : "40px"})`
            : "translateX(0)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        <SlideComponent active={!animating} />
      </div>

      {/* Slide number */}
      <div className="fixed top-6 left-8 z-50 flex items-center gap-3">
        <span className="text-xs font-mono text-orange-400/60 tracking-widest" style={{ fontFamily: "Oswald" }}>
          {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="text-xs text-orange-200/40 uppercase tracking-widest hidden md:inline" style={{ fontFamily: "Oswald" }}>
          {SLIDES[current].label}
        </span>
      </div>

      {/* Top right logo */}
      <div className="fixed top-6 right-8 z-50 text-xs uppercase tracking-[0.25em] text-orange-400/40" style={{ fontFamily: "Oswald" }}>
        МАРС
      </div>

      {/* Side dots */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            className={`nav-dot group relative`}
            style={i === current ? {
              background: "var(--mars-orange)",
              boxShadow: "0 0 12px rgba(232,98,26,0.8)",
              transform: "scale(1.4)",
            } : {}}
            title={s.label}
          >
            <span className="absolute right-full mr-3 whitespace-nowrap text-[10px] text-orange-300/0 group-hover:text-orange-300/70 transition-colors pointer-events-none uppercase tracking-widest" style={{ fontFamily: "Oswald" }}>
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom navigation arrows */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "rgba(232,98,26,0.12)", border: "1px solid rgba(232,98,26,0.3)" }}
        >
          <Icon name="ChevronLeft" size={18} className="text-orange-400" />
        </button>

        {/* Progress dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "24px" : "6px",
                height: "6px",
                background: i === current ? "var(--mars-orange)" : "rgba(232,98,26,0.25)",
                boxShadow: i === current ? "0 0 8px rgba(232,98,26,0.6)" : "none",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          style={{ background: "rgba(232,98,26,0.12)", border: "1px solid rgba(232,98,26,0.3)" }}
        >
          <Icon name="ChevronRight" size={18} className="text-orange-400" />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-8 right-8 z-50 text-[10px] text-orange-200/25 uppercase tracking-widest hidden md:block" style={{ fontFamily: "Oswald" }}>
        ← → стрелки
      </div>
    </div>
  );
}