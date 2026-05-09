import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Sparkles, 
  Globe, 
  Users, 
  BookOpen, 
  Heart, 
  Compass, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Menu,
  X,
  ChevronDown,
  Star,
  Trees,
  History,
  Binary,
  Lightbulb,
  HandHeart,
  Github,
  Twitter,
  Mail,
  Volume2,
  VolumeX
} from 'lucide-react';

// --- Sound Management ---
const playSound = (type: 'click' | 'correct' | 'wrong' | 'complete', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'complete') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    console.warn('Audio context failed', e);
  }
};

// --- Data ---

const NARRATIVES = [
  {
    id: 'universe',
    title: 'Die Entstehung des Universums',
    icon: <Sparkles className="w-8 h-8" />,
    image: 'https://images.unsplash.com/photo-1464802686167-b939a67a06a1?auto=format&fit=crop&q=80&w=800',
    description: 'Das „Gottesdrama“: Aus dem Chaos entsteht Ordnung durch physikalische Gesetze. Explosionen von Sternen schaffen schwere Elemente, die Grundlage für Planeten und Leben.',
    details: 'Maria Montessori erzählte dies als ein großes Wunder, bei dem jeder Partikel seinem Gesetz folgt.'
  },
  {
    id: 'earth',
    title: 'Die Entstehung der Erde',
    icon: <Globe className="w-8 h-8" />,
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    description: 'Vom feurigen Ball zum blauen Planeten. Die Abkühlung der Kruste, die Bildung der Ozeane und der Atmosphäre bereiteten die Bühne für das Leben.',
    details: 'Ein dynamischer Prozess des Wandels, der Milliarden von Jahren dauerte.'
  },
  {
    id: 'life',
    title: 'Die Entstehung des Lebens',
    icon: <Trees className="w-8 h-8" />,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    description: 'Vom Einzeller in den Urozeanen bis zur Vielfalt heutiger Ökosysteme. Jedes Lebewesen erfüllt eine „kosmische Aufgabe“ im Gleichgewicht der Natur.',
    details: 'Das Leben reinigt das Wasser, schafft Sauerstoff und baut den Boden auf.'
  },
  {
    id: 'human',
    title: 'Die Entwicklung des Menschen',
    icon: <Users className="w-8 h-8" />,
    image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=800',
    description: 'Mit Verstand und Händen gestaltet der Mensch seine Umwelt. Er entwickelt Kultur, Technik und soziale Strukturen und trägt besondere Verantwortung.',
    details: 'Der Mensch als das bewusste Wesen im Kosmos.'
  },
  {
    id: 'tools',
    title: 'Geschichte von Sprache & Mathematik',
    icon: <Binary className="w-8 h-8" />,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    description: 'Abstraktion und Kommunikation: Die Erfindung der Schrift und der Zahlen ermöglichte es uns, Wissen über Generationen hinweg zu teilen.',
    details: 'Dies sind die Werkzeuge des Geistes, die uns verbinden.'
  },
];

const GOALS = [
  { icon: <Heart className="text-red-500" />, title: 'Verantwortung', desc: 'Sich als Teil eines Ganzen begreifen.' },
  { icon: <HandHeart className="text-blue-500" />, title: 'Frieden', desc: 'Verständnis für andere Völker und Kulturen.' },
  { icon: <Lightbulb className="text-amber-500" />, title: 'Selbstständigkeit', desc: 'Eigene Fragen stellen und Antworten finden.' },
  { icon: <Compass className="text-emerald-500" />, title: 'Ganzheitliches Denken', desc: 'Zusammenhänge über Fächergrenzen hinweg sehen.' },
  { icon: <Star className="text-yellow-500" />, title: 'Respekt', desc: 'Ehrfurcht vor der Schöpfung und dem Leben.' },
];

const PRAXIS = [
  { title: 'Schulgarten', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800', detail: 'Hier erfahren Kinder die unmittelbare Abhängigkeit vom Wetter, Boden und den Jahreszeiten.' },
  { title: 'Experimente', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800', detail: 'Naturwissenschaftliche Versuche machen die unsichtbaren Gesetze des Universums greifbar.' },
  { title: 'Projektarbeit', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800', detail: 'Freie Themenwahl ermöglicht es, tief in Forschungsgebiete einzutauchen und Expertenwissen zu teilen.' },
  { title: 'Zeitleisten', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=800', detail: 'Meterlange Zeitbänder visualisieren die Unermesslichkeit der Erdgeschichte im Vergleich zum Menschen.' },
];

const QUIZ = [
  {
    question: 'Welches ist der Kernsatz der Kosmischen Erziehung?',
    options: ['Alles im Universum ist getrennt.', 'Alles im Universum ist miteinander verbunden.', 'Bildung ist nur für die Schule da.', 'Lernen muss hart sein.'],
    correct: 1,
    explanation: 'Montessori betonte die Interdependenz: Jedes Teilchen, jede Pflanze und jeder Mensch hat eine Aufgabe, die das Ganze unterstützt.'
  },
  {
    question: 'Wie viele „Große Erzählungen“ gibt es nach Montessori?',
    options: ['Drei', 'Zehn', 'Fünf', 'Sieben'],
    correct: 2,
    explanation: 'Es gibt traditionell fünf Große Erzählungen: Die Entstehung des Universums, der Erde, des Lebens, des Menschen und die Geschichte von Sprache & Mathematik.'
  },
  {
    question: 'Was ist eine „kosmische Aufgabe“?',
    options: ['Eine Reise zum Mond.', 'Der Beitrag jedes Teils zum Ganzen.', 'Eine schwierige Hausaufgabe.', 'Ein religiöses Gebot.'],
    correct: 1,
    explanation: 'Alles in der Natur erfüllt unbewusst einen Zweck für das Ökosystem. Der Mensch soll seine Aufgabe bewusst erkennen und erfüllen.'
  }
];

const GLOSSARY = [
  { term: 'Große Erzählungen', definition: 'Mythenhafte Rahmenerzählungen, die das Interesse des Kindes an den großen Zusammenhängen der Welt wecken.' },
  { term: 'Interdependenz', definition: 'Die wechselseitige Abhängigkeit aller Dinge im Universum voneinander.' },
  { term: 'Kosmische Aufgabe', definition: 'Die Funktion, die jedes Element (belebt oder unbelebt) im großen Haushalt der Natur erfüllt, um das Gleichgewicht zu halten.' },
  { term: 'Kosmische Erziehung', definition: 'Der ganzheitliche Bildungsplan Montessoris für das 6- bis 12-jährige Kind, der alle Wissensgebiete miteinander vernetzt.' },
  { term: 'Polarisation der Aufmerksamkeit', definition: 'Der Zustand tiefer, ungestörter Konzentration, in den ein Kind bei einer sinnvollen Tätigkeit versinkt.' },
  { term: 'Vorbereitete Umgebung', definition: 'Ein speziell gestalteter Raum, der dem Kind ermöglicht, autonom und seinen Bedürfnissen entsprechend zu lernen.' },
];

const COSMIC_TIMELINE = [
  { year: 'Vor 13,8 Mrd. Jahren', title: 'Der Urknall', desc: 'Die Geburtsstunde von Raum, Zeit und Materie – ein winziger Punkt dehnt sich rasend schnell aus.' },
  { year: 'Vor 4,5 Mrd. Jahren', title: 'Die Erde entsteht', desc: 'Gas und Staub verdichten sich zu einem glühenden Planeten, der schließlich abkühlt.' },
  { year: 'Vor 3,8 Mrd. Jahren', title: 'Das erste Leben', desc: 'In den Urozeanen bilden sich erste komplexe Moleküle und schließlich Einzeller.' },
  { year: 'Vor 2 Mrd. Jahren', title: 'Sauerstoff-Krise', desc: 'Photosynthese verändert die Atmosphäre grundlegend und bereitet den Weg für komplexeres Leben.' },
  { year: 'Vor 200.000 Jahren', title: 'Der Mensch', desc: 'Homo Sapiens erscheint und beginnt, den Kosmos durch Vernunft und Herz zu begreifen.' },
];

// --- Components ---

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-20 text-center relative">
    <motion.div
      initial={{ width: 0 }}
      whileInView={{ width: 80 }}
      transition={{ duration: 1, ease: "circOut" }}
      className="h-1 bg-brand-gold mx-auto mb-10 rounded-full"
    />
    <motion.h2 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-5xl md:text-8xl font-display font-bold text-brand-blue mb-8 tracking-tighter leading-none"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="max-w-2xl mx-auto px-6 relative"
      >
        <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed italic">
          {subtitle}
        </p>
        <div className="absolute -left-4 top-0 text-6xl text-brand-gold/10 font-serif leading-none">“</div>
      </motion.div>
    )}
    <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-brand-gold to-transparent opacity-30" />
  </div>
);

const SectionTransition = ({ color = "bg-brand-blue" }: { color?: string }) => (
  <div className={`h-32 w-full ${color} relative overflow-hidden`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.1),transparent_70%)]" />
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-white to-transparent"
    />
  </div>
);

const Tooltip = ({ text, children }: { text: string, children: React.ReactNode, key?: React.Key }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-brand-blue text-white text-[10px] uppercase tracking-[0.2em] font-bold whitespace-nowrap rounded-2xl shadow-2xl z-[100] pointer-events-none border border-white/10 backdrop-blur-xl"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-blue" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GlossaryItem = ({ item, i, soundEnabled }: { item: typeof GLOSSARY[0], i: number, soundEnabled: boolean, key?: React.Key }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) playSound('click', soundEnabled);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.05 }}
      onClick={toggle}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={`p-10 rounded-[40px] transition-all cursor-pointer group relative overflow-hidden ${
        isExpanded 
          ? 'bg-white shadow-2xl border-brand-gold/30' 
          : 'bg-slate-50 border-slate-100'
      } border`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          isExpanded ? 'bg-brand-gold text-white scale-110' : 'bg-white text-brand-gold shadow-sm'
        }`}>
          <BookOpen size={24} />
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-300"
        >
          <ChevronDown size={20} />
        </motion.div>
      </div>
      
      <h4 className={`text-2xl font-bold transition-colors ${
        isExpanded ? 'text-brand-gold' : 'text-brand-blue'
      }`}>{item.term}</h4>
      
      <motion.div 
        initial={false}
        animate={{ width: isExpanded ? 64 : 32 }}
        className={`h-1 bg-brand-gold mt-4 mb-4 rounded-full transition-opacity ${
          isExpanded ? 'opacity-100' : 'opacity-30'
        }`} 
      />
      
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
          marginTop: isExpanded ? 16 : 0
        }}
        className="overflow-hidden"
      >
        <p className="text-slate-500 leading-relaxed font-light italic">
          {item.definition}
        </p>
      </motion.div>

      {!isExpanded && (
        <div className="absolute bottom-6 right-10 text-[8px] uppercase tracking-widest font-bold text-slate-300">
          Mehr erfahren
        </div>
      )}
    </motion.div>
  );
};

const StarField = () => {
  const [stars, setStars] = useState<{ id: number, x: number, y: number, size: number, opacity: number, duration: string }[]>([]);
  const [nebulae, setNebulae] = useState<{ id: number, x: number, y: number, size: number, color: string }[]>([]);

  useEffect(() => {
    setStars(Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      duration: `${Math.random() * 5 + 3}s`
    })));

    setNebulae(Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 30,
      color: ['rgba(197, 160, 89, 0.1)', 'rgba(29, 44, 77, 0.15)', 'rgba(255, 255, 255, 0.05)'][i % 3]
    })));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-brand-blue">
      {/* Radiant Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05)_0%,transparent_70%)]" />
      
      {nebulae.map(n => (
        <motion.div 
          key={`nebula-${n.id}`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20 + n.id * 5, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full blur-[120px]"
          style={{ 
            left: `${n.x}%`, 
            top: `${n.y}%`, 
            width: `${n.size}vw`, 
            height: `${n.size}vw`, 
            backgroundColor: n.color,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {stars.map(star => (
        <motion.div 
          key={`star-${star.id}`} 
          animate={{ opacity: [star.opacity, star.opacity * 0.3, star.opacity] }}
          transition={{ duration: parseFloat(star.duration), repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bg-white rounded-full" 
          style={{ 
            left: `${star.x}%`, 
            top: `${star.y}%`, 
            width: `${star.size}px`, 
            height: `${star.size}px`,
            boxShadow: star.size > 1.5 ? '0 0 10px rgba(255,255,255,0.8)' : 'none'
          }} 
        />
      ))}
    </div>
  );
};

const UniverseTimeline = () => {
  return (
    <div className="py-24 bg-brand-blue relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-px w-12 bg-brand-gold" />
          <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs">Chronik der Schöpfung</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter">Die Große <br /><span className="text-brand-gold italic">Zeitleiste</span></h2>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent z-0" />
        
        <div className="flex overflow-x-auto gap-12 px-[10vw] pb-20 no-scrollbar cursor-grab active:cursor-grabbing snap-x">
          {COSMIC_TIMELINE.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 w-[300px] md:w-[400px] snap-center"
            >
              <div className="relative pt-12">
                <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-brand-gold shadow-[0_0_20px_#c5a059] z-10" />
                <div className="font-mono text-brand-gold text-sm font-bold tracking-widest mb-6">{item.year}</div>
                <div className="glass p-10 rounded-[32px] border-white/10 hover:border-brand-gold/50 transition-all group">
                  <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-gold transition-colors">{item.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-light italic">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CONCEPT_ELEMENTS = [
  { 
    title: 'Natur', 
    icon: <Trees />, 
    color: 'text-emerald-500',
    desc: 'In der Natur ist alles voneinander abhängig. Pflanzen reinigen die Luft, Tiere verbreiten Samen, und das Wasser nährt alles Leben. Maria Montessori nannte dies die „kosmische Aufgabe“ jedes Lebewesens.' 
  },
  { 
    title: 'Geschichte', 
    icon: <History />, 
    color: 'text-amber-600',
    desc: 'Geschichte ist nicht nur eine Liste von Kriegen, sondern die Entwicklung der menschlichen Dankbarkeit. Wir nutzen heute Werkzeuge und Wissen von Menschen, die vor Tausenden von Jahren gelebt haben.' 
  },
  { 
    title: 'Kultur', 
    icon: <Globe />, 
    color: 'text-blue-500',
    desc: 'Kultur zeigt die Vielfalt, mit der Menschen auf dieselbe Welt reagieren. Kosmische Erziehung fördert den Respekt vor dieser Vielfalt als Bereicherung des menschlichen Ganzen.' 
  },
  { 
    title: 'Mathe', 
    icon: <Binary />, 
    color: 'text-slate-600',
    desc: 'Mathematik ist die Sprache des Universums. Montessori sah darin ein Werkzeug zur Abstraktion und zur Entdeckung der tiefen Ordnung, die hinter dem Chaos der Welt steht.' 
  },
  { 
    title: 'Universum', 
    icon: <Star />, 
    color: 'text-indigo-500',
    desc: 'Das Kind beginnt beim Ganzen. Wenn es die Unermesslichkeit des Weltalls begreift, findet es einen Kontext für die kleinen Details des täglichen Lebens.' 
  },
  { 
    title: 'Frieden', 
    icon: <HandHeart />, 
    color: 'text-red-400',
    desc: 'Frieden ist das ultimative Ziel. Wenn wir verstehen, wie sehr wir alle voneinander abhängen, wird soziale Harmonie zu einer logischen Notwendigkeit für das Überleben der Spezies.' 
  },
];

const FloatingParticles = () => {
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, size: number, delay: number }[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5
    })));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0],
            opacity: [0, 0.4, 0],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
          className="absolute bg-brand-gold/30 rounded-full blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeNarrative, setActiveNarrative] = useState(NARRATIVES[0]);
  const [selectedConcept, setSelectedConcept] = useState<typeof CONCEPT_ELEMENTS[0] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<typeof PRAXIS[0] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const heroRef = useRef(null);
  const quoteRef = useRef(null);
  const { scrollYProgress: globalScrollY } = useScroll();
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const { scrollYProgress: quoteScrollY } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"]
  });

  const heroOpacity = useTransform(heroScrollY, [0, 1], [1, 0]);
  const heroScale = useTransform(heroScrollY, [0, 1], [1, 1.1]);

  const handleQuizOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === QUIZ[quizIndex].correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      playSound('correct', soundEnabled);
    } else {
      playSound('wrong', soundEnabled);
    }
  };

  const nextQuestion = () => {
    if (quizIndex < QUIZ.length - 1) {
      setQuizIndex(q => q + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      playSound('click', soundEnabled);
    } else {
      setQuizFinished(true);
      playSound('complete', soundEnabled);
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setQuizFinished(false);
    playSound('click', soundEnabled);
  };

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      playSound('click', soundEnabled);
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-beige">
      <FloatingParticles />
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold z-[100] origin-left"
        style={{ scaleX: globalScrollY }}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto flex items-center justify-between glass px-8 h-20 rounded-full border-white/20 pointer-events-auto"
        >
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('hero')}>
            <div className="relative">
              <Tooltip text="Zurück zum Start">
                <Globe className="text-brand-gold w-10 h-10 transition-transform duration-700 group-hover:rotate-180" />
              </Tooltip>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-0 bg-brand-gold/40 blur-xl rounded-full -z-10" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-tighter text-brand-blue uppercase leading-none">Kosmos</span>
              <span className="text-[8px] font-bold tracking-[0.3em] text-brand-gold uppercase leading-none mt-1">Montessori</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {['Über', 'Konzept', 'Erzählungen', 'Praxis', 'Glossar'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item === 'Über' ? 'about' : item === 'Konzept' ? 'concept' : item === 'Erzählungen' ? 'narratives' : item === 'Praxis' ? 'praxis' : 'glossary')}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue/60 hover:text-brand-gold transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-brand-blue"
              aria-label="Ton umschalten"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button 
              onClick={() => scrollTo('quiz')}
              className="hidden md:block bg-brand-blue text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-deep"
            >
              Start Quiz
            </button>
            <button className="md:hidden p-2 text-brand-blue" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="md:hidden mt-4 glass rounded-[32px] overflow-hidden pointer-events-auto shadow-2xl origin-top"
            >
              <div className="flex flex-col p-8 gap-6 text-sm font-bold uppercase tracking-widest">
                <button onClick={() => scrollTo('about')} className="text-left py-2 hover:text-brand-gold transition-colors">Montessori</button>
                <button onClick={() => scrollTo('concept')} className="text-left py-2 hover:text-brand-gold transition-colors">Konzept</button>
                <button onClick={() => scrollTo('narratives')} className="text-left py-2 hover:text-brand-gold transition-colors">Erzählungen</button>
                <button onClick={() => scrollTo('praxis')} className="text-left py-2 hover:text-brand-gold transition-colors">Praxis</button>
                <button onClick={() => scrollTo('quiz')} className="text-left py-4 text-brand-gold border-t border-white/20 mt-2">Start Quiz</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <header id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-blue">
        <div className="absolute inset-0 z-0">
          <StarField />
        </div>
        
        {/* Cinematic Celestial Body */}
        <motion.div 
          style={{ 
            opacity: heroOpacity,
            scale: heroScale,
            rotate: useTransform(heroScrollY, [0, 1], [0, 20])
          }}
          className="absolute right-[-10%] top-[-10%] w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] z-10 pointer-events-none"
        >
          <div className="absolute inset-0 bg-brand-gold/10 rounded-full blur-[100px] animate-pulse" />
          <motion.img 
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover rounded-full opacity-40 mix-blend-screen shadow-[0_0_100px_rgba(197,160,89,0.2)]"
            alt="Rotating Planet"
          />
        </motion.div>

        <div className="relative z-20 text-center px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-16 bg-brand-gold/50" />
              <span className="text-brand-gold font-bold uppercase tracking-[0.6em] text-[10px]">Expedition ins Bewusstsein</span>
              <div className="h-px w-16 bg-brand-gold/50" />
            </div>
            
            <h1 className="text-[14vw] md:text-[180px] font-display font-bold text-white mb-6 leading-[0.75] tracking-tighter relative">
              <motion.span 
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="block drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                KOSMOS
              </motion.span>
              <motion.span 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-brand-gold italic font-serif text-3xl md:text-8xl tracking-normal mt-10 block"
              >
                Die Große Ordnung
              </motion.span>
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-20 flex flex-col items-center"
            >
              <div className="glass px-10 py-8 rounded-[40px] border-white/10 max-w-4xl backdrop-blur-xl mb-12">
                <p className="text-xl md:text-3xl text-slate-200 font-light leading-relaxed">
                  „Wir müssen dem Kind die Vision des <span className="text-white font-medium italic underline decoration-brand-gold/50 underline-offset-[12px]">ganzen Universums</span> schenken.“
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <button 
                  onClick={() => scrollTo('narratives')}
                  className="group relative px-16 py-8 bg-brand-gold text-white rounded-full font-bold text-xl overflow-hidden transition-all shadow-[0_20px_60px_-10px_rgba(197,160,89,0.4)] hover:-translate-y-2 active:scale-95"
                >
                  <span className="relative z-10 uppercase tracking-[0.4em] flex items-center gap-4">
                    Zeitreise <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 mix-blend-overlay" />
                </button>
                <button 
                  onClick={() => scrollTo('concept')}
                  className="px-12 py-8 border border-white/20 text-white rounded-full font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-md uppercase tracking-widest hover:border-brand-gold/50"
                >
                  Das Konzept
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* HUD Elements */}
        <div className="absolute left-10 bottom-10 hidden lg:block z-30">
          <div className="font-mono text-[8px] text-white/30 space-y-2 uppercase tracking-widest">
            <div>Sector: 4G-MNT</div>
            <div>Phase: Development</div>
            <div>Sync: 100%</div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20 pointer-events-none"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40">Scroll Down</span>
          <div className="w-px h-32 bg-gradient-to-b from-brand-gold/60 to-transparent relative">
            <motion.div 
              animate={{ y: [0, 128, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-gold rounded-full shadow-[0_0_15px_#c5a059]"
            />
          </div>
        </motion.div>
      </header>

      <UniverseTimeline />

      {/* About Maria Montessori */}
      <section id="about" className="py-32 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-gold/5 rounded-full blur-[120px] -mr-20 -mt-20" />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-5 relative"
            >
              <div className="absolute -inset-6 border border-brand-gold/30 rounded-[40px] rotate-3 z-0" />
              <div className="relative z-10 overflow-hidden rounded-[40px] shadow-deep aspect-[4/5]">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8 }}
                  src="https://upload.wikimedia.org/wikipedia/commons/8/82/Maria_Montessori_%28portrait%29.jpg" 
                  alt="Portrait Maria Montessori" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-10 -right-10 glass p-10 rounded-[32px] z-20 max-w-[320px] shadow-gold border-white/40"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center text-white">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-brand-blue font-bold text-xl">Visionärin</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  „Das Kind ist Baumeister seiner selbst.“
                </p>
                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                  <span>Reformpädagogik</span>
                  <span>•</span>
                  <span>Menschenwürde</span>
                </div>
              </motion.div>
            </motion.div>

            <div className="md:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-brand-gold" />
                  <span className="text-brand-gold font-bold uppercase tracking-[0.4em] text-xs">Pionierin der Pädagogik</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-display font-bold text-brand-blue mb-10 leading-[0.8] tracking-tighter">
                  Maria <br /> Montessori
                </h2>
                <p className="text-2xl text-slate-500 font-light leading-relaxed mb-12">
                  Als erste Ärztin Italiens und visionäre Denkerin revolutionierte sie unser Verständnis von Kindheit. Ihre Arbeit basiert auf der Erkenntnis, dass Kinder einen natürlichen Drang zum Lernen haben – wenn man ihnen die richtige Umgebung schenkt.
                </p>

                {/* Vertical Timeline */}
                <div className="relative space-y-12 before:absolute before:left-3 before:top-4 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-brand-gold before:to-transparent">
                  {[
                    { year: '1870', event: 'Geburt in Italien – Der Beginn einer lebenslangen Reise des Forschens.' },
                    { year: '1896', text: 'Promotion zur Ärztin gegen alle Widerstände ihrer Zeit.' },
                    { year: '1907', event: 'Das erste Kinderhaus in Rom: Der Beweis, dass Autonomie Wunder wirkt.' },
                    { year: '1940er', event: 'Entwicklung der Kosmischen Erziehung während des Exils in Indien.' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex gap-10 items-start relative z-10 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-white border-4 border-brand-gold shadow-sm group-hover:scale-125 transition-transform mt-1" />
                      <div>
                        <div className="font-mono text-brand-gold font-bold text-lg mb-1 tracking-tighter">{item.year}</div>
                        <p className="text-brand-blue font-medium text-lg leading-snug">{item.event || item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Quote Section */}
      <section ref={quoteRef} className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          style={{ y: useTransform(quoteScrollY, [0, 1], [-100, 100]) }}
          className="absolute inset-0 z-0 scale-110"
        >
          <img 
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-40 grayscale"
            alt="Space Parallax"
          />
          <div className="absolute inset-0 bg-brand-blue/80 mix-blend-multiply" />
        </motion.div>
        
        <div className="relative z-10 max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <Tooltip text="Visionäre Kraft">
              <Sparkles className="w-12 h-12 text-brand-gold mx-auto opacity-50" />
            </Tooltip>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-[1.1] italic">
              „Die Aufgabe der Umgebung ist nicht, das Kind zu formen, sondern ihm zu erlauben, sich zu offenbaren.“
            </h2>
            <div className="flex items-center justify-center gap-6 text-brand-gold font-bold tracking-[0.4em] text-xs uppercase mt-12">
              <div className="h-px w-10 bg-brand-gold" />
              Maria Montessori
              <div className="h-px w-10 bg-brand-gold" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Concept Interactive */}
      <section id="concept" className="py-32 px-6 md:px-12 bg-slate-50 relative z-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 blur-[100px] pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <SectionTitle subtitle="Das Kind soll nicht nur isolierte Fakten lernen, sondern die tiefgehende Ordnung und Schönheit des Universums begreifen.">
            Das Netz des Lebens
          </SectionTitle>

          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 relative aspect-square flex items-center justify-center perspective-1000">
              {/* Interaction diagram */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                  className="w-full h-full border-[1px] border-slate-200 border-dashed rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
                  className="w-[80%] h-[80%] border-[1px] border-slate-200 border-dashed rounded-full"
                />
              </div>

              <motion.div 
                whileHover={{ scale: 1.1 }}
                style={{ x: '-50%', y: '-50%' }}
                className="absolute z-10 w-48 h-48 rounded-full bg-brand-blue flex flex-col items-center justify-center text-white p-6 text-center shadow-2xl overflow-hidden left-1/2 top-1/2"
              >
                <div className="absolute inset-0 opacity-20">
                  <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400" alt="Earth" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <Users className="w-8 h-8 mb-2 z-10 text-brand-gold" />
                <span className="font-bold relative z-10">Das Kind & Die Welt</span>
              </motion.div>
              
              {/* Spinning bubbles */}
              {CONCEPT_ELEMENTS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ scale: 1.1, zIndex: 40 }}
                  animate={selectedConcept?.title === item.title 
                    ? { scale: [1, 1.05, 1], zIndex: 30 } 
                    : { scale: 1, zIndex: 1 }
                  }
                  transition={selectedConcept?.title === item.title 
                    ? { repeat: Infinity, duration: 2, ease: "easeInOut" } 
                    : { duration: 0.3 }
                  }
                  onClick={() => setSelectedConcept(item)}
                  className={`absolute p-4 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center gap-3 cursor-pointer group transition-all ${selectedConcept?.title === item.title ? 'ring-2 ring-brand-gold shadow-brand-gold/20' : ''}`}
                  style={{
                    left: `${50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                    top: `${50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                    x: '-50%',
                    y: '-50%'
                  }}
                >
                  <div className={`w-10 h-10 rounded-full bg-brand-beige flex items-center justify-center ${item.color} group-hover:bg-brand-gold group-hover:text-white transition-colors`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 18 })}
                  </div>
                  <span className="font-medium text-slate-700">{item.title}</span>
                </motion.div>
              ))}

              {/* Detail Info Overlay for the diagram */}
              <AnimatePresence>
                {selectedConcept && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{ x: '-50%', y: '-50%' }}
                    className="absolute z-50 bg-white p-8 rounded-3xl shadow-2xl border border-brand-gold/20 max-w-[320px] text-center left-1/2 top-1/2"
                  >
                    <button 
                      onClick={() => setSelectedConcept(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-brand-blue"
                    >
                      <X size={20} />
                    </button>
                    <div className={`w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 ${selectedConcept.color}`}>
                      {React.cloneElement(selectedConcept.icon as React.ReactElement, { size: 32 })}
                    </div>
                    <h4 className="text-2xl font-bold text-brand-blue mb-3">{selectedConcept.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {selectedConcept.desc}
                    </p>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Kosmischer Zusammenhang</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            <div className="space-y-6">
              {[
                { title: 'Interdependenz', desc: 'Nichts existiert für sich allein. Das Wissen wird nicht in Fächern, sondern in Zusammenhängen präsentiert.' },
                { title: 'Kosmische Aufgabe', desc: 'Jedes Element der Natur (Wind, Wasser, Pflanzen, Tiere) erfüllt eine Aufgabe zum Erhalt des Ganzen. Auch der Mensch.' },
                { title: 'Staunen als Motor', desc: 'Durch faszinierende Geschichten werden Emotionen geweckt, die das Interesse am Lernen dauerhaft binden.' },
              ].map((point, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-white font-bold">
                    0{i+1}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-blue mb-2">{point.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{point.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Great Narratives */}
      <section id="narratives" className="py-32 px-6 md:px-12 bg-brand-blue text-white overflow-hidden relative">
        <StarField />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-brand-gold font-bold uppercase tracking-[0.4em] text-sm mb-6 block"
            >
              Die Kosmischen Mythen
            </motion.span>
            <h2 className="text-5xl md:text-8xl font-display font-bold mb-8 tracking-tighter">Die Großen Erzählungen</h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-xl font-light leading-relaxed">
              Diese Mythen bilden den poetischen Rahmen der Kosmischen Erziehung. Sie wecken die Fantasie und stellen die großen Fragen nach dem Woher und Wohin.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
            {NARRATIVES.map((n, i) => (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setActiveNarrative(n);
                  playSound('click', soundEnabled);
                }}
                className={`relative group aspect-[4/5] rounded-[32px] overflow-hidden transition-all duration-500 border-2 ${activeNarrative.id === n.id ? 'border-brand-gold scale-105 shadow-gold ring-4 ring-brand-gold/20' : 'border-white/10 opacity-40 hover:opacity-100 hover:scale-[1.02]'}`}
              >
                <img src={n.image} alt={n.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-brand-blue/20 to-transparent flex flex-col items-center justify-end p-6 text-center">
                  <motion.div 
                    animate={activeNarrative.id === n.id 
                      ? { scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] } 
                      : { scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }
                    }
                    transition={activeNarrative.id === n.id 
                      ? { repeat: Infinity, duration: 2, ease: "easeInOut" } 
                      : { repeat: Infinity, duration: 4, ease: "easeInOut" }
                    }
                    className="text-brand-gold mb-3"
                  >
                    {n.icon}
                  </motion.div>
                  <span className="text-sm font-bold uppercase tracking-widest leading-tight">{n.title}</span>
                </div>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeNarrative.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/5 backdrop-blur-3xl rounded-[64px] border border-white/10 p-10 md:p-20 grid lg:grid-cols-2 gap-16 items-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 order-2 lg:order-1">
                {/* HUD Elements */}
                <div className="flex items-center gap-6 mb-12">
                  <div className="px-4 py-2 bg-brand-gold/20 rounded-full border border-brand-gold/30">
                    <span className="text-brand-gold font-mono text-xs uppercase tracking-widest font-bold">Session Active</span>
                  </div>
                  <div className="h-px flex-grow bg-white/10" />
                  <span className="text-brand-gold font-mono text-xs opacity-50 uppercase tracking-widest">Entry 0{NARRATIVES.indexOf(activeNarrative) + 1}</span>
                </div>

                <h3 className="text-5xl md:text-8xl font-display font-bold mb-10 leading-[0.8] tracking-tighter text-glow-gold">{activeNarrative.title}</h3>
                <p className="text-2xl md:text-3xl text-slate-200 mb-12 leading-relaxed font-light">
                  {activeNarrative.description}
                </p>
                <div className="bg-white/5 p-10 rounded-[48px] border border-white/10 backdrop-blur-3xl shadow-deep relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand-gold opacity-30 group-hover:opacity-100 transition-opacity" />
                  <p className="text-brand-gold/90 font-medium italic text-xl leading-relaxed ml-4">{activeNarrative.details}</p>
                </div>
              </div>
              <div className="relative z-10 order-1 lg:order-2">
                <motion.div 
                  initial={{ rotate: 10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  key={activeNarrative.id + "-img"}
                  className="relative group"
                >
                  <div className="absolute -inset-4 bg-brand-gold/20 rounded-[48px] blur-2xl group-hover:bg-brand-gold/30 transition-all" />
                  <img 
                    src={activeNarrative.image} 
                    alt={activeNarrative.title} 
                    className="relative z-10 w-full aspect-square object-cover rounded-[48px] shadow-deep border border-white/20" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Goals Section: Bento Grid */}
      <section className="py-40 px-6 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative">
          <SectionTitle subtitle="Nach Maria Montessori ruht die Entfaltung des Kindes auf diesen fünf essentiellen Werten.">
            Die Säulen der Vision
          </SectionTitle>
 
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
            {GOALS.map((goal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="relative p-12 rounded-[64px] bg-white border border-slate-100 flex flex-col items-center text-center group hover:shadow-gold-soft hover:-translate-y-4 transition-all duration-700 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-brand-gold/10 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-40" />
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-5xl z-10 relative group-hover:bg-brand-blue group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                    {goal.icon}
                  </div>
                </div>

                <h4 className="text-2xl font-display font-bold text-brand-blue mb-6 tracking-tight group-hover:text-brand-gold transition-colors">
                  {goal.title}
                </h4>
                
                <div className="w-12 h-1 bg-brand-gold/20 mb-8 rounded-full group-hover:w-24 group-hover:bg-brand-gold transition-all duration-500" />
                
                <p className="text-slate-500 text-lg leading-relaxed font-light italic">
                  {goal.desc}
                </p>

                <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.6em] text-brand-gold opacity-20 group-hover:opacity-100 transition-opacity">
                  VIRTUE 0{i + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionTransition color="bg-white" />

      {/* Praxis Gallery */}
      <section id="praxis" className="py-32 px-6 md:px-12 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-brand-gold font-bold uppercase tracking-[0.3em] text-sm mb-4 block"
              >
                In der Realität
              </motion.span>
              <h2 className="text-5xl md:text-7xl font-display font-bold text-brand-blue mb-6">Einblicke in die Praxis</h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed">Vom theoretischen Staunen zum konkreten Tun. Entdecken Sie, wie Montessori-Schüler die Welt erforschen.</p>
            </div>
            <div className="flex-shrink-0">
              <div className="px-8 py-4 bg-brand-blue text-white rounded-full text-sm font-bold uppercase tracking-widest shadow-deep">
                Montessori Erleben
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 relative z-10">
            {PRAXIS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  setSelectedPractice(item);
                  playSound('click', soundEnabled);
                }}
                className={`group relative h-[550px] rounded-[64px] overflow-hidden cursor-pointer bg-brand-blue shadow-deep hover-glow ${i % 2 !== 0 ? 'lg:mt-20' : ''}`}
              >
                <div className="absolute inset-0 z-10 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 backdrop-blur-[2px]" />
                <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 group-hover:opacity-100" referrerPolicy="no-referrer" />
                
                {/* HUD Scanline */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
                
                <div className="absolute inset-0 p-12 flex flex-col justify-end items-center text-center z-30">
                  <div className="w-12 h-1 bg-brand-gold mb-6 rounded-full transform group-hover:scale-x-150 transition-transform duration-500" />
                  <h4 className="text-3xl font-display font-bold text-white mb-4 group-hover:text-brand-gold transition-colors drop-shadow-2xl">{item.title}</h4>
                  <p className="text-sm text-slate-300 opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 font-light leading-relaxed">
                    {item.detail}
                  </p>
                  
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold opacity-30 group-hover:opacity-100 transition-all"
                  >
                    Details <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-white p-12 md:p-20 rounded-[64px] shadow-deep border border-slate-100 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-gold via-brand-blue to-brand-gold opacity-30" />
            <div className="lg:w-2/5 relative">
              <div className="absolute -inset-4 bg-brand-gold/10 rounded-[40px] blur-xl opacity-0 group-hover:opacity-100" />
              <img 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" 
                alt="Praxis" 
                className="rounded-[40px] w-full h-[400px] object-cover shadow-gold relative z-10" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:w-3/5 space-y-10">
              <h3 className="text-4xl md:text-6xl font-display font-bold text-brand-blue leading-none">Vom Greifen zum Begreifen</h3>
              <p className="text-slate-600 text-2xl leading-relaxed font-light">
                In der Montessori-Schule arbeiten Kinder mit konkreten Materialien. Die Kosmische Erziehung bringt diese Elemente zusammen: säen, beobachten, messen und verstehen.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Freiarbeit', 'Fächerübergreifend', 'Umgebung', 'Material'].map(tag => (
                  <span key={tag} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] border border-slate-100 transition-all hover:border-brand-gold hover:text-brand-gold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Critique Section */}
      <section className="py-32 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <SectionTitle subtitle="Eine kritische Auseinandersetzung mit den Herausforderungen und dem zeitlosen Potenzial.">
            Reflektion & Diskurs
          </SectionTitle>

          <div className="grid lg:grid-cols-2 gap-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-white p-16 rounded-[80px] shadow-deep border border-slate-100 relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-[60px]" />
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-sm">
                  <XCircle size={40} />
                </div>
                <h3 className="text-4xl font-display font-bold text-brand-blue tracking-tight">Die Grenzen</h3>
              </div>

              <ul className="space-y-10">
                {[
                  { t: 'Zeitfaktor', d: 'Das Konzept braucht Ruhe und Kontinuität, was oft im Widerspruch zum starren Takt staatlicher Lehrpläne steht.' },
                  { t: 'Abstraktionsgrad', d: 'Einige Kinder benötigen direktere Anleitung, um die philosophischen Zusammenhänge nicht als bloße Mythen abzutun.' },
                  { t: 'Ressourcen', d: 'Die Qualität steht und fällt mit der Ausbildung der Begleiter und der Tiefe der vorbereiteten Umgebung.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-8 group/item">
                    <div className="font-mono text-red-200 text-3xl font-bold leading-none opacity-40">0{i+1}</div>
                    <div>
                      <h4 className="font-bold text-brand-blue mb-3 text-2xl group-hover/item:text-red-500 transition-colors">{item.t}</h4>
                      <p className="text-slate-500 text-lg leading-relaxed font-light">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-brand-blue p-16 rounded-[80px] shadow-deep relative group overflow-hidden text-white"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-gold/30" />
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-gold/5 rounded-full blur-[100px]" />
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-white/5 text-brand-gold rounded-3xl flex items-center justify-center border border-white/10 shadow-sm backdrop-blur-xl">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-4xl font-display font-bold tracking-tight">Das Potenzial</h3>
              </div>

              <ul className="space-y-10 font-light">
                {[
                  { t: 'Sinnstiftung', d: 'Kinder erleben Wissenserwerb nicht als Pflicht, sondern als Entdeckungsreise, die Sinn und Orientierung schenkt.' },
                  { t: 'Globale Ethik', d: 'Durch das Verständnis der Interdependenz wächst eine natürliche Verantwortung für die Erde und die Menschheit.' },
                  { t: 'Resilienz', d: 'Wer das Ganze versteht, kann besser mit den Teilproblemen der Welt umgehen und eigene Lösungen entwickeln.' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-8 group/item">
                    <div className="font-mono text-brand-gold text-3xl font-bold leading-none opacity-40">0{i+1}</div>
                    <div>
                      <h4 className="font-bold mb-3 text-2xl group-hover/item:text-brand-gold transition-colors">{item.t}</h4>
                      <p className="text-slate-300 text-lg leading-relaxed">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionTransition />

      {/* Quiz Section Integration */}
      <section id="quiz" className="py-32 px-6 md:px-12 bg-brand-blue relative overflow-hidden">
        <StarField />
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-gold rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="bg-white rounded-[64px] p-10 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
            {!quizFinished ? (
              <motion.div
                key={quizIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex justify-between items-center mb-12">
                  <span className="text-brand-gold font-bold uppercase tracking-[0.3em] text-sm bg-brand-gold/5 px-4 py-1 rounded-full border border-brand-gold/10">Wissens-Check</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-medium">Frage {quizIndex + 1} von {QUIZ.length}</span>
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((quizIndex + 1) / QUIZ.length) * 100}%` }}
                        className="h-full bg-brand-gold"
                      />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-4xl md:text-5xl font-display font-bold text-brand-blue mb-12 leading-tight">
                  {QUIZ[quizIndex].question}
                </h3>

                <div className="grid gap-4 mb-12">
                  {QUIZ[quizIndex].options.map((option, i) => (
                    <button
                      key={i}
                      disabled={selectedOption !== null}
                      onClick={() => handleQuizOption(i)}
                      className={`quiz-option flex items-center justify-between group ${
                        selectedOption === i 
                          ? (isCorrect ? 'correct' : 'wrong')
                          : (selectedOption !== null && i === QUIZ[quizIndex].correct ? 'border-emerald-500 bg-emerald-50/50' : 'hover:border-brand-gold')
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-colors ${
                          selectedOption === i 
                            ? 'bg-current border-transparent text-white' 
                            : 'border-slate-200 group-hover:border-brand-gold'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-lg leading-tight text-left">
                          {option}
                        </span>
                      </div>
                      {selectedOption === i ? (
                        isCorrect ? <CheckCircle2 className="text-emerald-500" /> : <XCircle className="text-red-500" />
                      ) : (
                        selectedOption !== null && i === QUIZ[quizIndex].correct && <CheckCircle2 className="text-emerald-500 opacity-50" />
                      )}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedOption !== null && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex gap-6 items-start">
                        <Tooltip text="Hintergrundwissen">
                          <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-gold/10 text-brand-gold'}`}>
                            <Lightbulb size={24} />
                          </div>
                        </Tooltip>
                        <div>
                          <h4 className="font-bold text-brand-blue mb-2">Hintergrund</h4>
                          <p className="text-slate-600 leading-relaxed italic">
                            {QUIZ[quizIndex].explanation}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button 
                          onClick={nextQuestion}
                          className="px-14 py-6 bg-brand-blue text-white rounded-full font-bold shadow-deep hover:bg-brand-gold transition-all uppercase tracking-widest text-sm"
                        >
                          {quizIndex < QUIZ.length - 1 ? 'Nächste Frage' : 'Zum Ergebnis'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-32 h-32 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-10"
                >
                  <Sparkles className="text-brand-gold w-16 h-16" />
                </motion.div>
                <h3 className="text-5xl md:text-7xl font-display font-bold text-brand-blue mb-6">Großartig!</h3>
                <p className="text-slate-500 text-2xl mb-12 font-light">
                  Du hast <span className="text-brand-gold font-bold">{score} von {QUIZ.length}</span> Entdeckungen gemacht.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button 
                    onClick={restartQuiz}
                    className="px-12 py-6 bg-brand-blue text-white rounded-full font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-deep"
                  >
                    Nochmal versuchen
                  </button>
                  <button 
                    onClick={() => scrollTo('hero')}
                    className="px-12 py-6 border-2 border-slate-200 text-brand-blue rounded-full font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-mono"
                  >
                    Zurück zum Start
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Glossary Section */}
      <section id="glossary" className="py-32 px-6 md:px-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionTitle subtitle="Wichtige Begriffe der Montessori-Pädagogik einfach erklärt.">
            Das Montessori-ABC
          </SectionTitle>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {GLOSSARY.map((item, i) => (
              <GlossaryItem key={item.term} item={item} i={i} soundEnabled={soundEnabled} />
            ))}
          </div>
        </div>
      </section>

      {/* Practice Details Modal */}
      <AnimatePresence>
        {selectedPractice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-blue/40 backdrop-blur-md"
            onClick={() => setSelectedPractice(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[48px] max-w-2xl w-full p-8 md:p-12 shadow-2xl relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedPractice(null)}
                className="absolute top-8 right-8 p-3 rounded-full bg-slate-50 text-brand-blue hover:bg-brand-gold hover:text-white transition-all shadow-sm z-10"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="w-full md:w-1/2 aspect-square rounded-[32px] overflow-hidden shadow-gold">
                  <img src={selectedPractice.image} alt={selectedPractice.title} className="w-full h-full object-cover" />
                </div>
                <div className="w-full md:w-1/2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-1 bg-brand-gold rounded-full" />
                    <span className="text-brand-gold font-bold uppercase tracking-widest text-xs">Aktivität</span>
                  </div>
                  <h3 className="text-4xl font-display font-bold text-brand-blue mb-6">{selectedPractice.title}</h3>
                  <p className="text-xl text-slate-500 leading-relaxed font-light italic">
                    {selectedPractice.detail}
                  </p>
                  <p className="mt-8 text-slate-600 leading-relaxed">
                    Diese Form der praktischen Arbeit ermöglicht es dem Kind, durch eigenes Handeln die tiefen Zusammenhänge des Kosmos zu erfassen und Verantwortung zu übernehmen.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-24 px-6 md:px-12 bg-brand-blue text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20 text-center md:text-left">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                <Globe className="text-brand-gold w-12 h-12" />
                <span className="font-display font-bold text-3xl tracking-tighter uppercase">Kosmos</span>
              </div>
              <p className="text-slate-400 text-xl font-light leading-relaxed mb-10 max-w-md mx-auto md:mx-0 font-serif italic">
                „Wir müssen das Kind als den Erzeuger des Menschen betrachten.“
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                {[
                  { Icon: Github, label: 'GitHub' },
                  { Icon: Twitter, label: 'Twitter' },
                  { Icon: Mail, label: 'Kontakt' }
                ].map(({ Icon, label }, i) => (
                  <Tooltip key={i} text={label}>
                    <motion.a
                      whileHover={{ scale: 1.1, y: -5 }}
                      href="#"
                      className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold transition-all"
                    >
                      <Icon size={20} />
                    </motion.a>
                  </Tooltip>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-xs mb-8">Navigation</h4>
              <ul className="space-y-4">
                {['Maria Montessori', 'Das Konzept', 'Die Erzählungen', 'Wissens-Check'].map((item, i) => (
                  <li key={i}>
                    <button 
                      onClick={() => scrollTo(item === 'Maria Montessori' ? 'about' : item === 'Das Konzept' ? 'concept' : item === 'Die Erzählungen' ? 'narratives' : 'quiz')}
                      className="text-slate-400 hover:text-white transition-colors text-lg font-light"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-brand-gold font-bold uppercase tracking-[0.2em] text-xs mb-8">Pädagogik-LK</h4>
              <p className="text-slate-400 text-base leading-relaxed mb-6 font-light">
                Diese Seite wurde als Bildungsmaterial für Oberstufenkurse erstellt. Alle Inhalte basieren auf der Montessori-Theorie.
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start py-4 px-6 bg-white/5 rounded-2xl border border-white/10">
                <Info size={18} className="text-brand-gold" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Bildungsprojekt 2026</span>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 uppercase tracking-[0.2em] font-medium">
            <p>© 2024 Die Kosmische Vision – Alle Rechte vorbehalten.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-brand-gold transition-colors">Impressum</a>
              <a href="#" className="hover:text-brand-gold transition-colors">Datenschutz</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
