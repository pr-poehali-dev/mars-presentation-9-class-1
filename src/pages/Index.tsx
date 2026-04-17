import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const MARS_IMAGE = "https://cdn.poehali.dev/projects/e299f5fd-2429-46f5-8bf1-d588a7d302ef/files/545ee67e-16d5-4031-8a69-543904218967.jpg";

const sections = [
  { id: "hero", label: "Марс" },
  { id: "physical", label: "Характеристики" },
  { id: "atmosphere", label: "Атмосфера" },
  { id: "geology", label: "Геология" },
  { id: "missions", label: "Миссии" },
  { id: "colonization", label: "Колонизация" },
];

// --- Radar Chart SVG ---
function RadarChart({ data }: { data: { label: string; value: number }[] }) {
  const cx = 160;
  const cy = 160;
  const r = 120;
  const n = data.length;

  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = (d.value / 100) * r;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      lx: cx + (r + 28) * Math.cos(angle),
      ly: cy + (r + 28) * Math.sin(angle),
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const gridLines = data.map((_, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 320 320" className="w-full max-w-xs mx-auto">
      {/* Grid circles */}
      {gridLevels.map((level, li) => {
        const gridPts = data
          .map((_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
          })
          .join(" ");
        return (
          <polygon
            key={li}
            points={gridPts}
            fill="none"
            stroke="rgba(232,98,26,0.15)"
            strokeWidth="1"
          />
        );
      })}
      {/* Axis lines */}
      {gridLines.map((pt, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={pt.split(",")[0]}
          y2={pt.split(",")[1]}
          stroke="rgba(232,98,26,0.2)"
          strokeWidth="1"
        />
      ))}
      {/* Data polygon */}
      <polygon
        points={polyPoints}
        className="radar-fill"
        style={{ transition: "all 1s ease" }}
      />
      {/* Data dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill="#f5a623"
          style={{ filter: "drop-shadow(0 0 4px rgba(245,166,35,0.8))" }}
        />
      ))}
      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.lx}
          y={p.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,200,150,0.85)"
          fontSize="10"
          fontFamily="IBM Plex Sans, sans-serif"
        >
          {data[i].label}
        </text>
      ))}
    </svg>
  );
}

// --- Bar Chart ---
function BarChart({
  data,
  visible,
}: {
  data: { label: string; value: number; max: number; unit: string; color: string }[];
  visible: boolean;
}) {
  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const pct = Math.round((item.value / item.max) * 100);
        return (
          <div key={i} style={{ animationDelay: `${i * 0.12}s` }} className={visible ? "animate-fade-up" : "opacity-0"}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-orange-200/80 font-medium">{item.label}</span>
              <span className="text-sm font-mono" style={{ color: item.color }}>
                {item.value} {item.unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: visible ? `${pct}%` : "0%",
                  background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                  transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
                  boxShadow: `0 0 8px ${item.color}66`,
                }}
              />
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
    <div
      className="mars-card rounded-2xl p-5 text-center animate-fade-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-3xl font-bold gradient-text" style={{ fontFamily: "Oswald, sans-serif" }}>
        {value}
        <span className="text-lg ml-1 text-orange-400/70">{unit}</span>
      </div>
      <div className="text-xs text-orange-200/50 mt-1 uppercase tracking-widest">{label}</div>
    </div>
  );
}

// --- Section Title ---
function SectionTitle({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <div className="mb-10 animate-fade-up">
      <span
        className="text-xs uppercase tracking-[0.3em] text-orange-400/70 font-medium"
        style={{ fontFamily: "Oswald, sans-serif" }}
      >
        {tag}
      </span>
      <h2
        className="text-4xl md:text-5xl font-bold mt-2 text-white"
        style={{ fontFamily: "Oswald, sans-serif", fontWeight: 300 }}
      >
        {title}
      </h2>
      {sub && <p className="mt-3 text-orange-200/60 max-w-xl">{sub}</p>}
      <div className="mars-divider mt-6" />
    </div>
  );
}

// --- Timeline Item ---
function TimelineItem({
  year,
  mission,
  country,
  desc,
  i,
}: {
  year: string;
  mission: string;
  country: string;
  desc: string;
  i: number;
}) {
  return (
    <div
      className="flex gap-5 animate-fade-up"
      style={{ animationDelay: `${i * 0.1}s` }}
    >
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 shrink-0" style={{ boxShadow: "0 0 8px rgba(232,98,26,0.8)" }} />
        {i < 8 && <div className="w-px flex-1 bg-gradient-to-b from-orange-500/40 to-transparent mt-1" />}
      </div>
      <div className="mars-card rounded-xl px-5 py-4 mb-4 flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-orange-400 font-mono text-sm font-bold">{year}</span>
          <span className="text-[10px] uppercase tracking-widest text-orange-200/40 border border-orange-900/40 rounded px-2 py-0.5">{country}</span>
        </div>
        <div className="font-semibold text-white" style={{ fontFamily: "Oswald, sans-serif" }}>{mission}</div>
        <div className="text-sm text-orange-200/60 mt-1">{desc}</div>
      </div>
    </div>
  );
}

const missions = [
  { year: "1965", mission: "Маринер-4", country: "США", desc: "Первые снимки поверхности Марса с близкого расстояния" },
  { year: "1971", mission: "Маринер-9", country: "США", desc: "Первый орбитальный аппарат, составил карту всей планеты" },
  { year: "1976", mission: "Викинг 1 и 2", country: "США", desc: "Первая успешная посадка, поиск признаков жизни" },
  { year: "1997", mission: "Mars Pathfinder", country: "США", desc: "Первый марсоход Sojourner исследует поверхность" },
  { year: "2004", mission: "Spirit и Opportunity", country: "США", desc: "Двойная миссия, Opportunity проработал 14 лет" },
  { year: "2012", mission: "Curiosity", country: "США", desc: "Ядерный марсоход, ищет органику и воду" },
  { year: "2021", mission: "Perseverance + Ingenuity", country: "США", desc: "Первый вертолёт на другой планете, сбор образцов" },
  { year: "2021", mission: "Тяньвэнь-1", country: "Китай", desc: "Первая китайская орбитальная-посадочная миссия" },
  { year: "2028", mission: "Mars Sample Return", country: "США / ЕКА", desc: "Доставка образцов грунта на Землю" },
];

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
  { label: "H₂O", value: 0.03 },
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

export default function Index() {
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]));
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(i);
            setVisibleSections((prev) => new Set([...prev, i]));
          }
        },
        { threshold: 0.25 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const scrollToSection = (i: number) => {
    sectionRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      <div className="stars-bg" />

      {/* Side Navigation */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-center">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(i)}
            className={`nav-dot group relative ${activeSection === i ? "active" : ""}`}
            title={s.label}
          >
            <span className="absolute right-full mr-3 whitespace-nowrap text-xs text-orange-300/0 group-hover:text-orange-300/80 transition-colors duration-200 pointer-events-none"
              style={{ fontFamily: "Oswald, sans-serif", fontSize: "11px", letterSpacing: "0.1em" }}>
              {s.label}
            </span>
          </button>
        ))}
      </nav>

      {/* ===================== HERO ===================== */}
      <section
        ref={(el) => { sectionRefs.current[0] = el; }}
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={MARS_IMAGE}
            alt="Поверхность Марса"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0604]/60 via-transparent to-[#0a0604]" />
        </div>

        {/* Floating planet sphere */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden float-anim planet-glow z-10 opacity-70 hidden md:block">
          <img src={MARS_IMAGE} alt="Марс" className="w-full h-full object-cover scale-150 -translate-x-6 -translate-y-4" />
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(ellipse at 30% 30%, transparent 40%, rgba(10,6,4,0.7) 100%)" }} />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-fade-up">
            <span
              className="text-xs uppercase tracking-[0.4em] text-orange-400/80 font-medium"
              style={{ fontFamily: "Oswald, sans-serif" }}
            >
              Четвёртая планета Солнечной системы
            </span>
          </div>
          <h1
            className="animate-fade-up delay-100 text-7xl md:text-[10rem] font-bold leading-none mt-4 glow-text"
            style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            <span className="gradient-text">МАРС</span>
          </h1>
          <p className="animate-fade-up delay-200 text-xl md:text-2xl text-orange-100/70 mt-6 font-light max-w-2xl mx-auto leading-relaxed">
            Красная планета — место, где умерли вулканы, бушевали океаны и где, возможно, зародилась жизнь
          </p>

          <div className="animate-fade-up delay-300 flex flex-wrap justify-center gap-4 mt-10">
            {[
              { v: "227.9", u: "млн км", l: "от Земли" },
              { v: "−63°C", u: "", l: "средняя т-ра" },
              { v: "2", u: "луны", l: "Фобос и Деймос" },
            ].map((s, i) => (
              <div key={i} className="mars-card rounded-2xl px-6 py-4 text-center min-w-[120px]">
                <div className="text-2xl font-bold gradient-text" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {s.v} <span className="text-base text-orange-400/70">{s.u}</span>
                </div>
                <div className="text-xs text-orange-200/50 mt-1 uppercase tracking-widest">{s.l}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scrollToSection(1)}
            className="animate-fade-up delay-400 mt-12 inline-flex items-center gap-2 text-orange-400/70 hover:text-orange-300 transition-colors"
          >
            <span className="text-sm uppercase tracking-widest" style={{ fontFamily: "Oswald, sans-serif" }}>
              Исследовать
            </span>
            <Icon name="ChevronDown" size={18} />
          </button>
        </div>
      </section>

      {/* ===================== PHYSICAL ===================== */}
      <section
        ref={(el) => { sectionRefs.current[1] = el; }}
        id="physical"
        className="relative min-h-screen py-24 px-6 section-gradient-1"
      >
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            tag="01 / Физические характеристики"
            title="Параметры планеты"
            sub="Марс — меньше Земли, но больше похож на неё, чем любая другая планета"
          />

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <StatCard value="6 779" unit="км" label="Диаметр" delay={0.1} />
            <StatCard value="24.6" unit="ч" label="Марсианские сутки" delay={0.2} />
            <StatCard value="687" unit="дней" label="Год на Марсе" delay={0.3} />
            <StatCard value="3.71" unit="м/с²" label="Ускорение свободного падения" delay={0.4} />
            <StatCard value="2" unit="луны" label="Спутники" delay={0.5} />
            <StatCard value="0.107" unit="M⊕" label="Масса" delay={0.6} />
          </div>

          <div className="mars-divider mb-12" />

          <div className="animate-fade-up delay-300">
            <h3 className="text-xl font-medium text-orange-200/80 mb-6" style={{ fontFamily: "Oswald, sans-serif" }}>
              Сравнение с Землёй
            </h3>
            <BarChart data={physicalData} visible={visibleSections.has(1)} />
          </div>
        </div>
      </section>

      {/* ===================== ATMOSPHERE ===================== */}
      <section
        ref={(el) => { sectionRefs.current[2] = el; }}
        id="atmosphere"
        className="relative min-h-screen py-24 px-6 section-gradient-2"
      >
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            tag="02 / Атмосфера и климат"
            title="Воздух Марса"
            sub="Атмосфера в 100 раз тоньше земной, температура падает до −143°C ночью"
          />

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { icon: "Thermometer", label: "Темп. днём", val: "+20°C", sub: "максимум" },
                  { icon: "Snowflake", label: "Темп. ночью", val: "−143°C", sub: "минимум" },
                  { icon: "Wind", label: "Давление", val: "600 Па", sub: "0.6% от Земли" },
                  { icon: "CloudFog", label: "Пылевые бури", val: "Глобальные", sub: "раз в 3 года" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="mars-card rounded-xl p-4 animate-fade-up"
                    style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                  >
                    <Icon name={item.icon as "Wind"} size={20} className="text-orange-400 mb-2" />
                    <div className="text-xs text-orange-200/50 uppercase tracking-wider mb-1">{item.label}</div>
                    <div className="text-lg font-bold gradient-text" style={{ fontFamily: "Oswald, sans-serif" }}>
                      {item.val}
                    </div>
                    <div className="text-xs text-orange-200/40">{item.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mars-card rounded-2xl p-6 animate-fade-up delay-400">
                <h4 className="text-sm uppercase tracking-widest text-orange-400/70 mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Состав атмосферы
                </h4>
                {atmosphereData.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-orange-300/70 w-12">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: visibleSections.has(2) ? `${Math.min(item.value, 100)}%` : "0%",
                          background: "linear-gradient(90deg, #c1440e88, #e8621a)",
                          transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-orange-200/50 font-mono w-14 text-right">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up delay-200">
              <h4 className="text-center text-sm uppercase tracking-widest text-orange-400/70 mb-4" style={{ fontFamily: "Oswald, sans-serif" }}>
                Радар атмосферы
              </h4>
              <RadarChart data={radarData} />
              <p className="text-center text-xs text-orange-200/40 mt-2">
                CO₂ доминирует — 95.3% состава
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== GEOLOGY ===================== */}
      <section
        ref={(el) => { sectionRefs.current[3] = el; }}
        id="geology"
        className="relative min-h-screen py-24 px-6 section-gradient-1"
      >
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            tag="03 / Рельеф и геология"
            title="Поверхность планеты"
            sub="Самый высокий вулкан и самый глубокий каньон в Солнечной системе — оба на Марсе"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "Mountain",
                name: "Олимп Монс",
                type: "Вулкан",
                stat: "21.9 км",
                desc: "Высочайшая гора Солнечной системы. В 2.5 раза выше Эвереста",
                color: "#e8621a",
              },
              {
                icon: "Waves",
                name: "Долины Маринер",
                type: "Каньон",
                stat: "4000 км",
                desc: "Крупнейший каньон планеты, глубиной до 11 км. Длиной как Австралия",
                color: "#f5a623",
              },
              {
                icon: "Layers",
                name: "Полярные шапки",
                type: "Ледники",
                stat: "3 км",
                desc: "Водяной лёд и сухой лёд (CO₂). Сезонно расширяются и тают",
                color: "#c1440e",
              },
              {
                icon: "Droplets",
                name: "Древние русла",
                type: "Следы воды",
                stat: "3.5 млрд лет",
                desc: "Марс мог быть покрыт океаном 300 млн лет. Следы рек и берегов",
                color: "#e8621a",
              },
              {
                icon: "Atom",
                name: "Метеоритные кратеры",
                type: "Рельеф",
                stat: ">43 000",
                desc: "Больше 43 тысяч кратеров, старейшие — 4 млрд лет. Из них гигантский Эллада",
                color: "#f5a623",
              },
              {
                icon: "Zap",
                name: "Вулканическая история",
                type: "Геология",
                stat: "400 млн лет",
                desc: "Последние вулканы затихли около 400 млн лет назад. Нет тектоники плит",
                color: "#c1440e",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="mars-card rounded-2xl p-6 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                  >
                    <Icon name={item.icon as "Mountain"} size={18} style={{ color: item.color }} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-orange-200/40 border border-orange-900/40 rounded px-2 py-0.5">
                    {item.type}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: "Oswald, sans-serif", color: item.color }}>
                  {item.stat}
                </div>
                <div className="font-semibold text-white mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {item.name}
                </div>
                <p className="text-sm text-orange-200/55 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MISSIONS ===================== */}
      <section
        ref={(el) => { sectionRefs.current[4] = el; }}
        id="missions"
        className="relative min-h-screen py-24 px-6 section-gradient-2"
      >
        <div className="max-w-4xl mx-auto">
          <SectionTitle
            tag="04 / Космические миссии"
            title="История исследований"
            sub="Более 50 миссий к Марсу — половина из них закончилась неудачей"
          />

          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <StatCard value="50+" unit="" label="Запущено миссий" delay={0.1} />
            <StatCard value="26" unit="" label="Успешных" delay={0.2} />
            <StatCard value="7" unit="" label="Марсоходов" delay={0.3} />
          </div>

          <div className="mars-divider mb-10" />

          <div>
            {missions.map((m, i) => (
              <TimelineItem key={i} {...m} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ===================== COLONIZATION ===================== */}
      <section
        ref={(el) => { sectionRefs.current[5] = el; }}
        id="colonization"
        className="relative min-h-screen py-24 px-6 section-gradient-1"
      >
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            tag="05 / Колонизация Марса"
            title="Второй дом человечества?"
            sub="SpaceX, NASA и другие агентства разрабатывают планы первых поселений"
          />

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-lg font-medium text-orange-200/70 mb-6" style={{ fontFamily: "Oswald, sans-serif" }}>
                Пригодность для жизни
              </h3>
              <div className="space-y-5">
                {colonizationFactors.map((f, i) => (
                  <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-orange-200/80">{f.label}</span>
                      <span className="text-sm font-mono font-bold" style={{ color: f.color }}>
                        {f.value}{f.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-1">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: visibleSections.has(5) ? `${f.value}%` : "0%",
                          background: `linear-gradient(90deg, ${f.color}88, ${f.color})`,
                          transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s`,
                          boxShadow: `0 0 6px ${f.color}55`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-orange-200/40">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-orange-200/70 mb-6" style={{ fontFamily: "Oswald, sans-serif" }}>
                Ключевые вызовы
              </h3>
              <div className="space-y-3">
                {[
                  { icon: "ShieldAlert", title: "Радиация", desc: "Без магнитного поля радиация в 700 раз выше земной нормы. Нужны подземные жилища или сильная защита." },
                  { icon: "Flame", title: "Ресурсы", desc: "Воду можно добыть из льда, кислород — из CO₂ методом MOXIE. SpaceX уже тестирует технологию." },
                  { icon: "Rocket", title: "Транспорт", desc: "Перелёт занимает 6–9 месяцев. Starship рассчитан на 100 пассажиров, взлёт с Марса без дозаправки." },
                  { icon: "Sprout", title: "Еда", desc: "Эксперименты NASA по выращиванию картофеля в марсианском грунте прошли успешно." },
                  { icon: "Users", title: "Психология", desc: "Изоляция на 2–3 года — один из главных рисков. Проводятся многолетние земные симуляции." },
                  { icon: "Calendar", title: "Сроки", desc: "Первые люди на Марсе — по планам SpaceX — в 2029–2033 годах. NASA — в 2040-х." },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="mars-card rounded-xl p-4 flex gap-4 animate-fade-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(232,98,26,0.12)", border: "1px solid rgba(232,98,26,0.3)" }}>
                      <Icon name={item.icon as "Flame"} size={16} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>
                        {item.title}
                      </div>
                      <p className="text-xs text-orange-200/55 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 text-center">
            <div className="mars-divider mb-8" />
            <p className="text-orange-200/30 text-sm" style={{ fontFamily: "Oswald, sans-serif", letterSpacing: "0.15em" }}>
              MARS PRESENTATION · 2026
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
