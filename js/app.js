// KUPO landing page — built from the Claude Design file "KUPO Landing v3".
import { h, render, Component, createRef } from '../vendor/preact.module.js';
import htm from '../vendor/htm.module.js';

// style-hover / style-active / style-focus attributes become generated classes,
// with !important so they win over the inline styles they modify.
const pseudoSheet = document.head.appendChild(document.createElement('style')).sheet;
const pseudoCache = new Map();
function importantify(css) {
  const decls = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '(') depth++;
    else if (c === ')') depth = Math.max(0, depth - 1);
    else if (c === ';' && depth === 0) { decls.push(css.slice(start, i)); start = i + 1; }
  }
  decls.push(css.slice(start));
  return decls.map(d => d.trim()).filter(Boolean).map(d => /!\s*important$/i.test(d) ? d : d + ' !important').join(';');
}
function pseudoClass(pseudo, css) {
  const key = pseudo + '|' + css;
  let cls = pseudoCache.get(key);
  if (!cls) {
    cls = 'ps' + pseudoCache.size.toString(36);
    pseudoSheet.insertRule('.' + cls + ':' + pseudo + '{' + importantify(css) + '}', pseudoSheet.cssRules.length);
    pseudoCache.set(key, cls);
  }
  return cls;
}
function hx(type, props, ...children) {
  if (props) {
    for (const pseudo of ['hover', 'focus', 'active']) {
      const css = props['style-' + pseudo];
      if (css == null) continue;
      props = { ...props };
      delete props['style-' + pseudo];
      const cls = pseudoClass(pseudo, css);
      props.class = props.class ? props.class + ' ' + cls : cls;
    }
  }
  return h(type, props, ...children);
}
const html = htm.bind(hx);

class Kupo extends Component {
  trackRef = createRef();
  state = { w: window.innerWidth, scrolled: false, menu: false, slide: 0, faq: 0, demo: false, dstep: 0, biz: '', chans: {}, derr: false, fName: '', fBiz: '', fContact: '', fTrap: '', dSending: false, dFail: false, step: 0, sel: 0, tab: 'todas', modes: {}, rstep: 0, rAuto: true, apt: 'v', ind: 1 };

  componentDidMount() {
    this.rm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this._r = () => this.setState({ w: window.innerWidth, menu: window.innerWidth >= 860 ? false : this.state.menu });
    this._s = () => { const s = window.scrollY > 24; if (s !== this.state.scrolled) this.setState({ scrolled: s }); };
    this._r(); this._s();
    window.addEventListener('resize', this._r);
    window.addEventListener('scroll', this._s, { passive: true });
    this._k = e => { if (e.key === 'Escape' && this.state.demo) this.closeDemo(); };
    window.addEventListener('keydown', this._k);
    this.startHero();
    if (this.rm) this.setState({ rstep: 3 });
    else this._ri = setInterval(() => { if (this.state.rAuto) this.setState(s => ({ rstep: (s.rstep + 1) % 4 })); }, 4200);
    setTimeout(() => this.reveal(), 60);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._r); window.removeEventListener('keydown', this._k); document.body.style.overflow = ''; window.removeEventListener('scroll', this._s);
    clearTimeout(this._t); clearInterval(this._ri); if (this._io) this._io.disconnect();
  }
  componentDidUpdate(pp) { if (pp.animateHero !== this.props.animateHero) this.startHero(); }
  padL(t) { return parseFloat(getComputedStyle(t).paddingLeft) || 0; }
  goSlide = i => {
    const t = this.trackRef.current; if (!t) return;
    i = Math.max(0, Math.min(t.children.length - 1, i));
    t.scrollTo({ left: t.children[i].offsetLeft - this.padL(t), behavior: this.rm ? 'auto' : 'smooth' });
    this.setState({ slide: i });
  };
  onTrack = () => {
    const t = this.trackRef.current; if (!t) return;
    const p = this.padL(t); let best = 0, bd = 1e9;
    Array.from(t.children).forEach((c, i) => { const d = Math.abs(c.offsetLeft - p - t.scrollLeft); if (d < bd) { bd = d; best = i; } });
    if (t.scrollLeft + t.clientWidth >= t.scrollWidth - 4) best = t.children.length - 1;
    if (best !== this.state.slide) this.setState({ slide: best });
  };
  openDemo = e => { if (e && e.preventDefault) e.preventDefault(); document.body.style.overflow = 'hidden'; this.setState({ demo: true, dstep: 0, biz: '', chans: {}, derr: false, dFail: false, menu: false }); };
  closeDemo = () => { document.body.style.overflow = ''; this.setState({ demo: false }); };
  sendDemo = async () => {
    const S = this.state;
    if (S.dSending) return;
    if (!S.fName.trim() || !S.fContact.trim()) { this.setState({ derr: true }); return; }
    const url = (this.props.sheetsUrl || '').trim();
    if (!url) { console.warn('KUPO: define sheetsUrl en Kupo.defaultProps para guardar las solicitudes de demo.'); this.setState({ dstep: 3 }); return; }
    const names = { wa: 'WhatsApp', ig: 'Instagram', ms: 'Messenger' };
    const body = new URLSearchParams({ nombre: S.fName.trim(), negocio: S.fBiz.trim(), contacto: S.fContact.trim(), giro: S.biz,
      canales: ['wa', 'ig', 'ms'].filter(k => S.chans[k]).map(k => names[k]).join(', '), pagina: location.href, website: S.fTrap });
    this.setState({ dSending: true, dFail: false });
    try {
      // Apps Script doesn't answer CORS preflights, so this goes as a simple request with an opaque response.
      await fetch(url, { method: 'POST', mode: 'no-cors', body });
      this.setState({ dSending: false, dstep: 3 });
    } catch (err) {
      this.setState({ dSending: false, dFail: true });
    }
  };
  startHero() {
    clearTimeout(this._t);
    if (this.rm || this.props.animateHero === false) { this.setState({ step: 6 }); return; }
    this.setState({ step: 0 }, this.tick);
  }
  tick = () => {
    const D = [900, 1500, 1600, 2600, 1700, 1700, 5200];
    this._t = setTimeout(() => this.setState(s => ({ step: (s.step + 1) % 7 }), this.tick), D[this.state.step]);
  };
  reveal() {
    if (this.rm || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'none'; io.unobserve(e.target); }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.style.opacity = '0'; el.style.transform = 'translateY(26px)';
      el.style.transition = 'opacity .65s ease, transform .65s ease';
      io.observe(el);
    });
    this._io = io;
  }

  renderVals() {
    const S = this.state, w = S.w, step = S.step, rs = S.rstep;
    const mobile = w < 860, wide = w >= 1080, mid = w >= 720;
    const hv = this.props.headline || 'B';
    const I = n => `assets/icons/${n}.svg`;
    const CH = {
      wa: { n: 'WhatsApp', bg: '#25D366', src: 'assets/icons/whatsapp.svg' },
      ig: { n: 'Instagram', bg: 'linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF)', src: 'assets/icons/instagram.svg' },
      ms: { n: 'Messenger', bg: 'linear-gradient(45deg,#0866FF,#A033FF)', src: 'assets/icons/messenger.svg' }
    };
    const chan = (k, s) => ({ chBox: { width: s, height: s, borderRadius: s * 0.3, background: CH[k].bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, chImg: { width: s * 0.6, height: s * 0.6, display: 'block', backgroundImage: `url(${CH[k].src})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }, chSrc: CH[k].src, chName: CH[k].n });
    const ST = { ai: ['Atendiendo IA', 'comp'], human: ['Requiere humano', 'pend'], staff: ['Atendiendo equipo', 'nos'], done: ['Resuelta', 'conf'], conf: ['Confirmada', 'conf'], pend: ['Pendiente', 'pend'] };
    const badge = k => ({ bLabel: ST[k][0], bBox: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', color: `var(--s-${ST[k][1]})`, background: `var(--s-${ST[k][1]}-bg)` }, bDot: { width: 6, height: 6, borderRadius: '50%', background: `var(--s-${ST[k][1]}-dot)` } });
    const av = (c, s) => ({ width: s, height: s, borderRadius: '50%', background: c[0], color: c[1], fontSize: Math.round(s * 0.36), fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
    const ini = n => n.split(' ').map(x => x[0]).join('').slice(0, 2);
    const sys = text => ({ t: 'sys', text });

    const P = [
      { n: 'Valeria Montemayor', ch: 'ig', m: 'done', last: 'Cita agendada · jue 15, 16:00', t: '18:43', u: false, c: ['#FBE9DA', '#C9743C'], h: '@vale.montemayor',
        links: [['ig', '@vale.montemayor'], ['wa', '+52 81 1520 8834']], tags: ['Prefiere tardes', 'Faciales'],
        sum: 'Clienta desde marzo. Escribe por Instagram y prefiere citas por la tarde. Su última visita fue una hidratación facial con la Dra. Mariana López.',
        next: ['Limpieza facial profunda', 'Jue 16:00 · Dra. Mariana López'],
        th: [sys('Conversación iniciada por Instagram · 18:42'), { t: 'client', text: 'Hola, ¿tienen espacio mañana por la tarde para una limpieza facial?', time: '18:42' }, { t: 'ai', text: '¡Hola, Valeria! Mañana jueves 15 tenemos disponible a las 16:00 y a las 17:30 con la Dra. Mariana López. ¿Qué horario prefieres?', time: '18:42' }, { t: 'client', text: 'A las 16:00, porfa.', time: '18:43' }, { t: 'ai', text: 'Listo. Tu cita quedó agendada para mañana jueves 15 a las 16:00. Te esperamos en Estudio Alba.', time: '18:43' }, { t: 'card' }] },
      { n: 'Diego Cantú', ch: 'wa', m: 'human', last: '¿Puedo pagar a meses? Quisiera hablar con alguien.', t: '18:38', u: true, c: ['#E8F2F6', '#5B37F0'], h: '+52 81 2245 9071',
        links: [['wa', '+52 81 2245 9071']], tags: ['Nuevo', 'Depilación láser'],
        sum: 'Primer contacto. Pregunta por depilación láser de piernas y por pagos a meses. Pidió hablar con una persona.',
        th: [sys('Conversación iniciada por WhatsApp · 18:20'), { t: 'client', text: 'Hola, ¿cuánto cuesta la depilación láser de piernas?', time: '18:20' }, { t: 'ai', text: '¡Hola, Diego! La depilación láser de piernas completas cuesta $1,900 MXN por sesión. ¿Quieres que te busque un horario?', time: '18:20' }, { t: 'client', text: '¿Puedo pagar a meses? Quisiera hablar con alguien.', time: '18:38' }, { t: 'handoff', time: '18:38' }, { t: 'note', text: 'Revisar con administración si este mes aplican meses sin intereses.' }] },
      { n: 'Paulina Treviño', ch: 'wa', m: 'ai', last: '¿Cuánto cuesta el peeling químico?', t: '18:30', u: true, c: ['#F3E0E6', '#9B2C5A'], h: '+52 81 8834 1290',
        links: [['wa', '+52 81 8834 1290']], tags: ['Peeling'], sum: 'Pregunta por el precio del peeling químico. Todavía no tiene cita.',
        th: [sys('Conversación iniciada por WhatsApp · 18:30'), { t: 'client', text: '¿Cuánto cuesta el peeling químico?', time: '18:30' }, { t: 'ai', text: 'El peeling químico cuesta $1,450 MXN e incluye una valoración previa con la Dra. Mariana López. ¿Te gustaría agendar?', time: '18:30' }] },
      { n: 'Mónica Sepúlveda', ch: 'wa', m: 'done', last: 'Perfecto, ahí estaré. Gracias', t: '18:16', u: false, c: ['#D9E7DC', '#2f7d4a'], h: '+52 81 3378 2261',
        links: [['wa', '+52 81 3378 2261']], tags: ['Depilación láser', 'Frecuente'], sum: 'Clienta frecuente. Confirmó su sesión del jueves a las 9:30 con la Lic. Carolina Ríos.',
        next: ['Depilación láser', 'Jue 09:30 · Lic. Carolina Ríos'],
        th: [sys('Conversación iniciada por WhatsApp · 18:10'), { t: 'client', text: '¿Me confirman mi cita del jueves?', time: '18:10' }, { t: 'ai', text: 'Claro, Mónica. Tu sesión de depilación láser es este jueves 15 a las 9:30 con la Lic. Carolina Ríos.', time: '18:10' }, { t: 'client', text: 'Perfecto, ahí estaré. Gracias', time: '18:16' }] },
      { n: 'Jorge Villarreal', ch: 'ms', m: 'staff', last: 'Déjame revisar y te confirmo', t: '17:54', u: false, c: ['#EDE7C2', '#6B5A1E'], h: 'Messenger',
        links: [['ms', 'Jorge Villarreal']], tags: ['Masajes'], sum: 'Pregunta por disponibilidad para un masaje relajante el sábado. Sofía, de recepción, lo está atendiendo.',
        th: [sys('Conversación iniciada por Messenger · 17:52'), { t: 'client', text: '¿Tienen lugar el sábado para un masaje relajante?', time: '17:52' }, sys('Sofía tomó la conversación · la IA queda en pausa'), { t: 'staff', text: 'Hola, Jorge. Déjame revisar y te confirmo.', time: '17:54' }] },
      { n: 'Ana Paula Garza', ch: 'ig', m: 'ai', last: '¿Tienen estacionamiento?', t: '17:40', u: false, c: ['#E8F2F6', '#5B37F0'], h: '@anapau.garza',
        links: [['ig', '@anapau.garza']], tags: ['Hidratación facial'], sum: 'Tiene cita de hidratación facial el jueves a las 11:00. Preguntó por estacionamiento.',
        next: ['Hidratación facial', 'Jue 11:00 · Lic. Carolina Ríos'],
        th: [sys('Conversación iniciada por Instagram · 17:40'), { t: 'client', text: '¿Tienen estacionamiento?', time: '17:40' }, { t: 'ai', text: 'Sí, contamos con estacionamiento para clientes. Te esperamos el jueves a las 11:00.', time: '17:40' }] }
    ];

    // hero
    const heroList = P.slice(0, 4).map((p, i) => {
      const first = i === 0;
      return { name: p.n, ini: ini(p.n), av: av(p.c, 34), ...chan(p.ch, 14),
        last: first ? (step < 1 ? 'Nueva conversación' : step >= 5 ? 'Cita agendada · jue 15, 16:00' : 'Hola, ¿tienen espacio mañana por la tarde?') : p.last,
        time: first ? '18:42' : p.t, typing: first && step === 2, notTyping: !(first && step === 2),
        row: { display: 'flex', gap: 10, padding: '11px 14px', alignItems: 'center', background: first ? 'var(--c-brand-soft)' : 'transparent', boxShadow: first ? 'inset 2px 0 0 var(--c-brand)' : 'none', borderBottom: '1px solid var(--c-line)' },
        nameStyle: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: first || p.u ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } };
    });
    const chipStyle = (on, line) => ({ padding: '4px 12px', borderRadius: 100, border: on ? '1px solid var(--c-ink)' : `1px solid ${line}`, background: on ? 'var(--c-inverse)' : 'var(--c-surface)', color: on ? 'var(--c-on-inverse)' : 'var(--c-ink)', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', transition: 'all .25s ease' });

    // inbox
    const modeOf = i => S.modes[i] || P[i].m;
    const pass = i => S.tab === 'todas' || (S.tab === 'ia' && modeOf(i) === 'ai') || (S.tab === 'humano' && modeOf(i) === 'human') || (S.tab === 'equipo' && modeOf(i) === 'staff');
    const cnt = k => P.filter((p, i) => k === 'todas' || (k === 'ia' && modeOf(i) === 'ai') || (k === 'humano' && modeOf(i) === 'human') || (k === 'equipo' && modeOf(i) === 'staff')).length;
    const tabs = [['todas', 'Todas'], ['ia', 'IA'], ['humano', 'Humano'], ['equipo', 'Equipo']].map(([k, label]) => {
      const on = S.tab === k;
      return { label, on, count: cnt(k), pick: () => this.setState({ tab: k }),
        style: { display: 'flex', alignItems: 'center', gap: 5, padding: '8px 7px 9px', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 12.5, fontWeight: on ? 600 : 500, color: on ? 'var(--c-ink)' : 'var(--c-ink4)', borderBottom: on ? '2px solid var(--c-ink)' : '2px solid transparent', marginBottom: -1, cursor: 'pointer', whiteSpace: 'nowrap' },
        cStyle: { fontSize: 10.5, padding: '0 6px', borderRadius: 100, fontWeight: 600, background: k === 'humano' ? 'var(--s-pend-bg)' : 'var(--c-sunken)', color: k === 'humano' ? 'var(--s-pend)' : 'var(--c-ink4)' } };
    });
    const inbox = P.map((p, i) => ({ p, i })).filter(x => pass(x.i)).map(({ p, i }) => {
      const on = i === S.sel;
      return { name: p.n, ini: ini(p.n), av: av(p.c, 38), ...chan(p.ch, 15), ...badge(modeOf(i)), last: p.last, time: p.t,
        pick: () => this.setState({ sel: i }),
        nameStyle: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: p.u ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' },
        row: { width: '100%', display: 'flex', gap: 11, padding: '12px 16px', border: 'none', borderBottom: '1px solid var(--c-line)', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--c-ink)', background: on ? 'var(--c-brand-soft)' : 'transparent', boxShadow: on ? 'inset 2px 0 0 var(--c-brand)' : 'none' } };
    });
    const cp = P[S.sel], mode = modeOf(S.sel);
    let thread = cp.th.slice();
    if (S.modes[S.sel] === 'staff') thread.push(sys('Sofía tomó la conversación · la IA queda en pausa'));
    if (S.modes[S.sel] === 'ai' && cp.m !== 'ai') thread.push(sys('Conversación devuelta a la IA'));
    thread = thread.map(m => ({ ...m, isSys: m.t === 'sys', isClient: m.t === 'client', isAi: m.t === 'ai', isStaff: m.t === 'staff', isNote: m.t === 'note', isHandoff: m.t === 'handoff', isCard: m.t === 'card' }));
    const modeText = { ai: 'La IA está atendiendo', human: 'Esperando a una persona', staff: 'Atiende: Sofía (recepción)', done: 'Resuelta' }[mode];
    const cur = { name: cp.n, ini: ini(cp.n), av: av(cp.c, 34), avLg: av(cp.c, 58), handle: cp.h, ...chan(cp.ch, 15), modeText,
      canTake: mode === 'ai' || mode === 'human', isStaff: mode === 'staff',
      links: cp.links.map(([k, handle]) => ({ handle, ...chan(k, 18) })), tags: cp.tags, sum: cp.sum,
      hasNext: !!cp.next, nextSvc: cp.next ? cp.next[0] : '', nextMeta: cp.next ? cp.next[1] : '' };

    // reservas
    const RS = [
      ['El cliente pregunta', 'Escribe como siempre lo hace, por Instagram o WhatsApp. Sin formularios ni enlaces.'],
      ['KUPO ofrece horarios', 'El agente revisa la agenda del profesional y propone horarios que están libres.'],
      ['El cliente elige', 'Con una respuesta corta, el horario queda reservado.'],
      ['La cita llega a tu agenda', 'Aparece en el calendario, marcada como agendada por IA. Tu equipo puede tomar la conversación en cualquier momento.']
    ];
    const rsteps = RS.map(([title, desc], i) => {
      const on = i === rs;
      return { title, desc, on, idx: '0' + (i + 1), pick: () => this.setState({ rstep: i, rAuto: false }),
        box: { display: 'flex', gap: 16, alignItems: 'flex-start', textAlign: 'left', width: '100%', padding: '16px 18px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', border: on ? '1px solid var(--au-line-10)' : '1px solid transparent', background: on ? '#fff' : 'transparent', boxShadow: on ? 'var(--shadow-tab)' : 'none', transition: 'background .3s ease, box-shadow .3s ease, border-color .3s ease' },
        idxStyle: { width: 10, height: 10, borderRadius: '50%', marginTop: 7, flexShrink: 0, background: on ? '#5B37F0' : 'rgba(110,68,255,.25)', transition: 'background .3s ease' } };
    });

    // calendario
    const PR = [['Dra. Mariana López', 'ML', '#dd9a5e'], ['Lic. Carolina Ríos', 'CR', '#3E8FAE'], ['Dr. Luis Garza', 'LG', '#5fa86a']];
    const AP = [
      { id: 'r', p: 0, s: 10, e: 11, svc: 'Consulta de valoración', cl: 'Regina Salinas', st: 'conf', ch: 'wa' },
      { id: 'k', p: 0, s: 12, e: 13.5, svc: 'Peeling químico', cl: 'Karla Elizondo', st: 'pend', ch: 'wa', ai: true },
      { id: 'v', p: 0, s: 16, e: 17, svc: 'Limpieza facial profunda', cl: 'Valeria Montemayor', st: 'conf', ch: 'ig', ai: true },
      { id: 'm', p: 1, s: 9.5, e: 10.5, svc: 'Depilación láser', cl: 'Mónica Sepúlveda', st: 'conf', ch: 'wa', ai: true },
      { id: 'ap', p: 1, s: 11, e: 12, svc: 'Hidratación facial', cl: 'Ana Paula Garza', st: 'pend', ch: 'ig' },
      { id: 'e', p: 1, s: 15, e: 16.5, svc: 'Masaje relajante', cl: 'Emiliano Ríos', st: 'conf', ch: 'ms' },
      { id: 'f', p: 2, s: 10.5, e: 11.5, svc: 'Valoración de depilación', cl: 'Fernanda Garza', st: 'pend', ch: 'wa', ai: true },
      { id: 'lf', p: 2, s: 17, e: 18, svc: 'Rejuvenecimiento facial', cl: 'Luis Fernando Rdz.', st: 'conf', ch: 'wa' }
    ];
    const BL = [{ p: 0, s: 14, e: 15 }, { p: 2, s: 13, e: 14 }];
    const H = 52, top = s => (s - 9) * H;
    const fmt = x => { const h = Math.floor(x), m = Math.round((x - h) * 60); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); };
    const pros = PR.map(([name, ini2, color], pi) => ({ name, ini: ini2,
      av: { width: 24, height: 24, borderRadius: '50%', background: color, color: '#fff', fontSize: 9.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
      blocks: BL.filter(b => b.p === pi).map(b => ({ style: { position: 'absolute', left: 4, right: 4, top: top(b.s) + 2, height: (b.e - b.s) * H - 4, borderRadius: 8, background: 'var(--c-unavail)', display: 'flex', alignItems: 'center', justifyContent: 'center' } })),
      apts: AP.filter(a => a.p === pi).map(a => {
        const sel = S.apt === a.id, k = ST[a.st][1];
        return { svc: a.svc, cl: a.cl, ai: !!a.ai, sel, range: fmt(a.s), pick: () => this.setState({ apt: a.id }),
          style: { position: 'absolute', left: 4, right: 4, top: top(a.s) + 2, height: (a.e - a.s) * H - 4, borderRadius: 10, padding: '6px 9px', display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'stretch', textAlign: 'left', overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--c-ink)', background: `var(--s-${k}-bg)`, border: sel ? '1.5px solid var(--c-brand)' : '1px solid transparent', boxShadow: sel ? '0 8px 22px rgba(91,55,240,.18)' : 'none', transition: 'box-shadow .2s ease, border-color .2s ease' } };
      }) }));
    const hours = Array.from({ length: 10 }, (_, i) => ({ l: fmt(9 + i), style: { position: 'absolute', top: i * H + 4, right: 10, fontSize: 10.5, color: 'var(--c-ink4)', fontVariantNumeric: 'tabular-nums' } }));
    const A = AP.find(a => a.id === S.apt) || AP[2];
    const apt = { svc: A.svc, cl: A.cl, pro: PR[A.p][0], ai: !!A.ai, when: `Jueves 15 de octubre · ${fmt(A.s)} – ${fmt(A.e)}`, ...badge(A.st), ...chan(A.ch, 16) };

    // reportes
    const WK = [62, 71, 68, 80, 77, 85, 91, 88, 96, 102, 98, 110], mx = 110;
    const weeks = WK.map((v, i) => ({ tip: `Semana ${i + 1}: ${v} citas`, bar: { flex: 1, height: (v / mx * 100) + '%', borderRadius: '4px 4px 2px 2px', background: i === WK.length - 1 ? '#5B37F0' : 'rgba(110,68,255,.28)' } }));
    const RE = [['Precio o forma de pago', 38], ['Pide hablar con una persona', 27], ['Duda sobre un tratamiento', 21], ['Cambio de cita', 14]];
    const reasons = RE.map(([t, n]) => ({ t, n, bar: { width: (n / 38 * 100) + '%', height: '100%', borderRadius: 3, background: '#E6B34D' } }));

    const demo = (this.props.demoUrl || '').trim();
    const sc = S.scrolled || S.menu;
    return {
      mobile, desktop: !mobile, wide, mid,
      menuOpen: S.menu && mobile, menuClosed: !(S.menu && mobile),
      toggleMenu: () => this.setState({ menu: !S.menu }), closeMenu: () => this.setState({ menu: false }),
      navStyle: { width: '100%', maxWidth: S.scrolled ? 1060 : 1320, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: S.scrolled ? '8px 8px 8px 14px' : '9px 10px 9px 16px', borderRadius: 18, background: sc ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0)', backdropFilter: sc ? 'var(--blur-glass)' : 'none', WebkitBackdropFilter: sc ? 'var(--blur-glass)' : 'none', border: `1px solid ${sc ? 'var(--au-line-08)' : 'rgba(10,10,10,0)'}`, boxShadow: sc ? 'var(--shadow-nav)' : 'none', transition: 'max-width .55s var(--ease-standard), padding .45s var(--ease-standard), background-color .35s ease, border-color .35s ease, box-shadow .35s ease' },
      navLink: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', color: sc ? 'var(--au-ink-3)' : 'rgba(255,255,255,.9)', transition: 'color .3s ease, opacity .2s ease' },
      navWord: { height: 24, width: 'auto', display: 'block', filter: sc ? 'none' : 'brightness(0) invert(1)', transition: 'filter .3s ease' },
      navCta: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 20px', borderRadius: 100, fontWeight: 600, fontSize: 13, lineHeight: 1.6, whiteSpace: 'nowrap', background: sc ? '#5B37F0' : '#fff', color: sc ? '#fff' : '#4B2BC9', transition: 'background .3s ease, color .3s ease, transform .25s var(--ease-standard)' },
      menuBtn: { width: 40, height: 40, borderRadius: 12, border: '1px solid ' + (sc ? 'var(--au-line-10)' : 'rgba(255,255,255,.45)'), background: sc ? 'var(--au-fill-03)' : 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
      menuImg: { width: 18, height: 18, filter: sc ? 'none' : 'invert(1)' },
      trackRef: this.trackRef, onTrack: this.onTrack,
      slideTabs: ['Conversaciones', 'Inteligencia artificial', 'Operación'].map((label, i) => { const on = i === S.slide; return { idx: '0' + (i + 1), label, on, pick: () => this.goSlide(i),
        style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', color: on ? 'var(--au-ink)' : 'var(--au-ink-4)', boxShadow: on ? 'inset 0 -2px 0 #5B37F0' : 'inset 0 -2px 0 rgba(10,10,10,0)', transition: 'color .25s ease, box-shadow .25s ease' } }; }),
      atStart: S.slide === 0, atEnd: S.slide === 2,
      prevSlide: () => this.goSlide(S.slide - 1), nextSlide: () => this.goSlide(S.slide + 1),
      prevBtn: { width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(110,68,255,.3)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: S.slide === 0 ? 'default' : 'pointer', opacity: S.slide === 0 ? 0.35 : 1, transition: 'background .2s ease, opacity .2s ease' },
      nextBtn: { width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(110,68,255,.3)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: S.slide === 2 ? 'default' : 'pointer', opacity: S.slide === 2 ? 0.35 : 1, transition: 'background .2s ease, opacity .2s ease' },
      faqs: [
        ['¿Qué canales puedo conectar?', 'WhatsApp, Instagram y Messenger. Los mensajes de todos llegan a una sola bandeja, con el historial de cada cliente.'],
        ['¿La IA puede agendar citas sola?', 'Sí. El agente revisa la agenda del profesional, propone horarios libres y deja la cita en el calendario, marcada como agendada por IA.'],
        ['¿Qué pasa si un cliente quiere hablar con una persona?', 'La conversación se marca como “Requiere humano” para que tu equipo la tome. Cuando terminen, pueden devolverla a la IA.'],
        ['¿Funciona si tengo varios profesionales?', 'Sí. El calendario muestra el día de cada profesional, con el estado de cada cita y el canal por el que llegó.'],
        ['¿Qué información veo en los reportes?', 'Citas por periodo, canal de origen, conversaciones resueltas por la IA y motivos de escalamiento.']
      ].map(([q, a], i) => { const on = S.faq === i; return { q, a, on, pick: () => this.setState({ faq: on ? -1 : i }),
        box: { borderRadius: 20, background: on ? '#F7F5FF' : '#fff', border: '1px solid ' + (on ? 'rgba(110,68,255,.3)' : 'var(--au-line-08)'), transition: 'background .25s ease, border-color .25s ease' },
        plus: { width: 34, height: 34, borderRadius: '50%', flexShrink: 0, backgroundColor: on ? '#5B37F0' : '#EEE9FF', backgroundImage: 'url(assets/icons/plus.svg)', backgroundSize: '16px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'none', transform: on ? 'rotate(45deg)' : 'none', transition: 'transform .25s ease, background-color .25s ease' } }; }),
      demoOpen: S.demo, openDemo: this.openDemo, closeDemo: this.closeDemo,
      backdrop: e => { if (e.target === e.currentTarget) this.closeDemo(); },
      d0: S.dstep === 0, d1: S.dstep === 1, d2: S.dstep === 2, d3: S.dstep === 3,
      dCanBack: S.dstep > 0 && S.dstep < 3, dNoBack: !(S.dstep > 0 && S.dstep < 3),
      dBack: () => this.setState(s => ({ dstep: Math.max(0, s.dstep - 1) })),
      dBar: { height: '100%', width: ((S.dstep + 1) / 4 * 100) + '%', borderRadius: 3, background: '#fff', transition: 'width .4s var(--ease-standard)' },
      dBiz: [['Clínica o consultorio', 'stethoscope'], ['Clínica estética', 'sparkles'], ['Restaurante', 'utensils'], ['Spa o bienestar', 'flower-2'], ['Salón o barbería', 'scissors'], ['Otro', 'store']].map(([label, ic]) => { const on = S.biz === label; return { label, pick: () => this.setState({ biz: label, dstep: 1 }),
        style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, padding: 14, minHeight: 104, borderRadius: 18, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--au-ink)', background: on ? '#F1EDFF' : '#fff', border: '1.5px solid ' + (on ? '#6E44FF' : '#E4DEFF'), transition: 'border-color .2s ease, background .2s ease' },
        ico: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#EEE9FF', backgroundImage: `url(assets/icons/${ic}.svg)`, backgroundSize: '19px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } }; }),
      dCh: ['wa', 'ig', 'ms'].map(k => { const on = !!S.chans[k]; return { label: CH[k].n, on, pick: () => this.setState(s => ({ chans: { ...s.chans, [k]: !s.chans[k] } })),
        style: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--au-ink)', background: on ? '#F1EDFF' : '#fff', border: '1.5px solid ' + (on ? '#6E44FF' : '#E4DEFF'), transition: 'border-color .2s ease, background .2s ease' },
        ico: { width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: `url(${CH[k].src}) center / 20px no-repeat, ${CH[k].bg}` },
        mark: on ? '✓' : '', check: { width: 24, height: 24, borderRadius: '50%', flexShrink: 0, border: on ? 'none' : '1.5px solid #D6CCFF', background: on ? '#5B37F0' : 'transparent', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' } }; }),
      dNoCh: !Object.values(S.chans).some(Boolean),
      dNext: () => this.setState({ dstep: 2 }),
      dNextStyle: { width: '100%', padding: 15, borderRadius: 100, border: 'none', background: '#5B37F0', color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: Object.values(S.chans).some(Boolean) ? 'pointer' : 'default', opacity: Object.values(S.chans).some(Boolean) ? 1 : 0.4, transition: 'opacity .2s ease' },
      fName: S.fName, fBiz: S.fBiz, fContact: S.fContact, derr: S.derr,
      setName: e => this.setState({ fName: e.target.value, derr: false }),
      setBizName: e => this.setState({ fBiz: e.target.value }),
      fTrap: S.fTrap, setTrap: e => this.setState({ fTrap: e.target.value }),
      dSending: S.dSending, dFail: S.dFail,
      setContact: e => this.setState({ fContact: e.target.value, derr: false }),
      dSubmit: this.sendDemo,
      dFirst: (S.fName.trim().split(' ')[0]) || '',
      dSummary: [S.biz, S.fBiz.trim(), ...['wa', 'ig', 'ms'].filter(k => S.chans[k]).map(k => CH[k].n)].filter(Boolean),
      hasDemoUrl: !!demo,
      hA: hv === 'A', hB: hv === 'B', hC: hv === 'C',
      heroList, h1: step >= 1, heroTyping: step === 2, h3: step >= 3, h4: step >= 4, h5: step >= 5, h5not: step < 5, h6: step >= 6,
      heroChip: chipStyle(step >= 4, 'var(--c-brand-line)'),
      inboxWrap: { display: 'flex', flexDirection: mid ? 'row' : 'column', height: mid ? 580 : 'auto' },
      listCol: { width: mid ? (wide ? 310 : 280) : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: mid ? '1px solid var(--c-line)' : 'none', borderBottom: mid ? 'none' : '1px solid var(--c-line)', maxHeight: mid ? 'none' : 300, minHeight: 0, background: 'var(--c-surface)' },
      tabs, inbox, thread, cur,
      take: () => this.setState(s => ({ modes: { ...s.modes, [s.sel]: 'staff' } })),
      giveBack: () => this.setState(s => ({ modes: { ...s.modes, [s.sel]: 'ai' } })),
      rsteps, r2: rs >= 1, r3: rs >= 2, r4: rs >= 3, r4not: rs < 3, rChip: chipStyle(rs >= 2, 'var(--c-line2)'),
      rCal: { width: 'min(92%,340px)', marginTop: -28, position: 'relative', zIndex: 2, padding: 14, borderRadius: 18, background: '#fff', border: rs >= 3 ? '1px solid var(--c-brand-line)' : '1px solid var(--au-line-08)', boxShadow: rs >= 3 ? '0 22px 60px rgba(91,55,240,.22)' : '0 16px 44px rgba(10,10,10,.08)', transition: 'box-shadow .4s ease, border-color .4s ease', color: 'var(--c-ink)' },
      pros, hours, apt,
      kpis: [{ l: 'Conversaciones', v: '1,284' }, { l: 'Citas agendadas', v: '412' }, { l: 'Agendadas por IA', v: '268' }, { l: 'No-shows', v: '3.1%' }],
      weeks, reasons,
      industries: [
        { ic: 'stethoscope', name: 'Clínicas y consultorios', short: 'CONSULTORIO', pain: 'Pacientes que escriben fuera de horario.', biz: 'Consultorio Dr. Garza', type: 'Medicina general', res: 'Dr. Luis Garza', agendaTitle: 'Consultas de hoy', ch: 'wa', time: '23:14',
          kpis: [['Citas hoy', '14'], ['Agendadas por IA', '9'], ['Fuera de horario', '5']],
          agenda: [['09:00', 'Consulta general', 'Regina Salinas', 'conf'], ['10:30', 'Seguimiento', 'Héctor Medina', 'conf', 1], ['12:00', 'Certificado médico', 'Andrea Lozano', 'pend', 1], ['16:00', 'Primera consulta', 'Tomás Ibarra', 'conf', 1]],
          q: 'Buenas noches, ¿puedo agendar consulta para mañana temprano?', a: 'Claro. El Dr. Garza tiene espacio mañana a las 9:00 y a las 9:30. ¿Cuál te acomoda?', svcs: ['Consulta general', 'Seguimiento', 'Certificados'] },
        { ic: 'sparkles', name: 'Clínicas estéticas', short: 'CLÍNICA ESTÉTICA', pain: 'Muchas preguntas antes de reservar.', biz: 'Estudio Alba', type: 'Clínica estética', res: 'Dra. Mariana López', agendaTitle: 'Citas de hoy', ch: 'ig', time: '18:42',
          kpis: [['Citas hoy', '18'], ['Agendadas por IA', '12'], ['Dudas resueltas', '41']],
          agenda: [['10:00', 'Valoración facial', 'Karla Elizondo', 'conf'], ['11:30', 'Peeling químico', 'Paulina Treviño', 'pend', 1], ['13:00', 'Hidratación facial', 'Ana Paula Garza', 'conf'], ['16:00', 'Limpieza facial', 'Valeria Montemayor', 'conf', 1]],
          q: '¿El peeling duele? ¿Cuánto dura?', a: 'Es una molestia leve y dura unos 40 minutos. Incluye valoración con la Dra. López. ¿Te busco un horario?', svcs: ['Valoración', 'Peeling', 'Limpieza facial'] },
        { ic: 'utensils', name: 'Restaurantes', short: 'RESTAURANTE', pain: 'Reservaciones por mensaje en hora pico.', biz: 'La Terraza', type: 'Restaurante', res: 'Terraza y salón', agendaTitle: 'Reservaciones de hoy', ch: 'wa', time: '13:05',
          kpis: [['Reservas hoy', '32'], ['Por IA', '21'], ['Comensales', '118']],
          agenda: [['14:00', 'Mesa para 4', 'Familia Cantú', 'conf', 1], ['14:30', 'Mesa para 2', 'Daniel Ruiz', 'conf'], ['20:00', 'Mesa para 6 · Terraza', 'Cumpleaños de Ana', 'pend', 1], ['21:00', 'Mesa para 2', 'Luis Pérez', 'conf', 1]],
          q: '¿Tienen mesa para 6 este viernes a las 8?', a: 'Sí, tenemos mesa en terraza a las 20:00. ¿A nombre de quién la reservo?', svcs: ['Terraza', 'Salón', 'Eventos'] },
        { ic: 'flower-2', name: 'Spas y bienestar', short: 'SPA', pain: 'Varios terapeutas, una sola agenda.', biz: 'Spa Bruma', type: 'Spa y bienestar', res: '3 terapeutas', agendaTitle: 'Sesiones de hoy', ch: 'ig', time: '19:20',
          kpis: [['Sesiones hoy', '22'], ['Agendadas por IA', '15'], ['Terapeutas', '3']],
          agenda: [['10:00', 'Masaje relajante', 'Jorge Villarreal · con Sara', 'conf'], ['11:00', 'Facial hidratante', 'Ana Paula Garza · con Pablo', 'conf', 1], ['15:00', 'Piedras calientes', 'Emiliano Ríos · con Sara', 'pend', 1], ['17:30', 'Masaje en pareja', 'Laura y Raúl · con Lucía', 'conf', 1]],
          q: 'Quiero regalar un masaje en pareja, ¿qué opciones hay?', a: 'Tenemos masaje en pareja de 60 o 90 minutos. El sábado hay lugar a las 12:00. ¿Lo aparto?', svcs: ['Masajes', 'Faciales', 'Paquetes'] },
        { ic: 'scissors', name: 'Salones y barberías', short: 'BARBERÍA', pain: 'Coordinar horarios mientras atiendes.', biz: 'Barbería Norte', type: 'Salón y barbería', res: '4 estilistas', agendaTitle: 'Turnos de hoy', ch: 'wa', time: '12:48',
          kpis: [['Citas hoy', '27'], ['Agendadas por IA', '19'], ['Clientes nuevos', '6']],
          agenda: [['10:00', 'Corte y barba', 'Marco Treviño · con Beto', 'conf', 1], ['11:00', 'Fade', 'Iván Rocha · con Leo', 'conf'], ['13:30', 'Tinte', 'Daniela Soto · con Mariel', 'pend', 1], ['18:00', 'Corte clásico', 'Rodrigo Luna · con Beto', 'conf', 1]],
          q: '¿Hay lugar hoy para corte y barba con Beto?', a: 'Beto tiene espacio hoy a las 17:00 y a las 18:30. ¿Te lo dejo a las 17:00?', svcs: ['Corte', 'Barba', 'Color'] }
      ].map((n, i) => { const on = i === S.ind; return { ...n, on, showPain: mid, pick: () => { if (this.state.ind !== i) this.setState({ ind: i }); },
        kpis: n.kpis.map(([l, v]) => ({ l, v })), ...chan(n.ch, 16),
        agenda: n.agenda.map(([t, svc, cl, st, ai]) => ({ t, svc, cl, ai: !!ai, ...badge(st) })),
        btn: { display: 'flex', alignItems: 'center', gap: 14, width: mid ? '100%' : 'auto', flexShrink: 0, padding: mid ? '14px 16px' : '10px 14px', borderRadius: 18, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', color: 'var(--au-ink)', background: on ? '#F1EDFF' : '#fff', border: '1.5px solid ' + (on ? '#6E44FF' : 'var(--au-line-08)'), boxShadow: on ? '0 14px 36px rgba(75,43,201,.14)' : 'none', transform: on && mid ? 'translateX(6px)' : 'none', transition: 'all .25s var(--ease-standard)' },
        icoBox: { width: mid ? 46 : 36, height: mid ? 46 : 36, borderRadius: 14, flexShrink: 0, background: on ? '#5B37F0' : '#EEE9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .25s ease' },
        icoImg: { width: mid ? 22 : 18, height: mid ? 22 : 18, backgroundColor: on ? '#fff' : '#1B1240', WebkitMask: `url(${I(n.ic)}) center / contain no-repeat`, mask: `url(${I(n.ic)}) center / contain no-repeat` },
        panel: { display: on ? 'block' : 'none', animation: 'kupo-in .45s ease both' } }; }),
      indList: { flex: mid ? '1 1 280px' : '1 1 100%', maxWidth: mid ? 360 : 'none', display: 'flex', flexDirection: mid ? 'column' : 'row', gap: 10, overflowX: mid ? 'visible' : 'auto', scrollbarWidth: 'none', paddingBottom: mid ? 0 : 4 },
      dFont: `'${this.props.displayFont || 'Unbounded'}', 'Fredoka', sans-serif`,
      demoHref: demo || '#demo', demoTarget: demo ? '_blank' : '_self', noDemo: !demo
    };
  }

  render() {
    const v = this.renderVals();
    return html`
<div style="background:#fff;color:var(--au-ink);font-family:var(--font-sans);overflow-x:clip;min-height:100vh">

<header style="position:fixed;top:0;left:0;right:0;z-index:60;display:flex;flex-direction:column;align-items:center;padding:14px clamp(12px,3vw,24px)">
  <nav aria-label="Principal" style=${v.navStyle}>
    <a href="#inicio" aria-label="KUPO, ir al inicio" style="display:flex;align-items:center;gap:9px;flex-shrink:0"><img src="assets/kupo-word.png" alt="KUPO" style=${v.navWord} /><span style="width:34px;height:34px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(30,10,90,.18);flex-shrink:0"><img src="assets/kupo-mark.png" alt="" style="width:21px;height:auto;display:block" /></span></a>
    ${v.desktop ? html`
      <ul style="display:flex;gap:34px;list-style:none;align-items:center;margin:0;padding:0">
        <li><a href="#producto" style=${v.navLink} style-hover="opacity:.65">Producto</a></li>
        <li><a href="#como" style=${v.navLink} style-hover="opacity:.65">Cómo funciona</a></li>
        <li><a href="#soluciones" style=${v.navLink} style-hover="opacity:.65">Soluciones</a></li>
      </ul>
    ` : null}
    <div style="display:flex;align-items:center;gap:8px">
      <a href="#demo" onClick=${v.openDemo} style=${v.navCta} style-hover="transform:translateY(-1px)" style-active="transform:none">Solicitar demo</a>
      ${v.mobile ? html`
        <button onClick=${v.toggleMenu} aria-label="Abrir menú" aria-expanded=${v.menuOpen} style=${v.menuBtn}>${v.menuOpen ? html`<img src="assets/icons/x.svg" alt="" style=${v.menuImg} />` : null}${v.menuClosed ? html`<img src="assets/icons/menu.svg" alt="" style=${v.menuImg} />` : null}</button>
      ` : null}
    </div>
  </nav>
  ${v.menuOpen ? html`
    <div style="width:100%;max-width:1060px;margin-top:8px;padding:8px;border-radius:18px;background:rgba(255,255,255,.9);backdrop-filter:var(--blur-glass);-webkit-backdrop-filter:var(--blur-glass);border:1px solid var(--au-line-08);box-shadow:var(--shadow-menu);display:flex;flex-direction:column;animation:kupo-in .25s ease both">
      <a href="#producto" onClick=${v.closeMenu} style="padding:14px;border-radius:12px;font-size:16px;font-weight:500;color:var(--au-ink)" style-hover="background:#F1EDFF">Producto</a>
      <a href="#como" onClick=${v.closeMenu} style="padding:14px;border-radius:12px;font-size:16px;font-weight:500;color:var(--au-ink)" style-hover="background:#F1EDFF">Cómo funciona</a>
      <a href="#soluciones" onClick=${v.closeMenu} style="padding:14px;border-radius:12px;font-size:16px;font-weight:500;color:var(--au-ink)" style-hover="background:#F1EDFF">Soluciones</a>
    </div>
  ` : null}
</header>

<main>
<section id="inicio" data-screen-label="Hero" style="position:relative;padding:clamp(118px,13vw,150px) clamp(16px,4vw,40px) 36px">
  <div aria-hidden="true" class="au-grain" style="position:absolute;left:0;right:0;top:0;bottom:clamp(150px,20vw,270px);background:#6E44FF;border-radius:0 0 clamp(28px,4vw,48px) clamp(28px,4vw,48px)">
    <div style="position:absolute;inset:0;background:radial-gradient(60% 70% at 88% 0%, #9A7BFF 0%, transparent 60%), radial-gradient(50% 60% at 0% 100%, #5128E8 0%, transparent 60%)"></div>
  </div>
  <div style="position:relative;z-index:1;max-width:1180px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:clamp(18px,3vw,44px);margin-top:12px">
      
      <div style="flex:1;min-width:0">
        ${v.hB ? html`<h1 style="margin:0;color:#fff"><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:700;font-size:clamp(46px,8.2vw,128px);line-height:.9;letter-spacing:-0.01em;text-transform:uppercase;text-wrap:balance">Menos mensajes pendientes.</span><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(38px,6.4vw,100px);line-height:.95;letter-spacing:-0.01em;margin-top:12px;text-transform:uppercase;color:#D9CCFF;text-wrap:balance">Más reservas confirmadas.</span></h1>` : null}
        ${v.hA ? html`<h1 style="margin:0;color:#fff"><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:700;font-size:clamp(46px,8.2vw,128px);line-height:.9;letter-spacing:-0.01em;text-transform:uppercase;text-wrap:balance">Cada conversación,</span><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(38px,6.4vw,100px);line-height:.95;letter-spacing:-0.01em;margin-top:12px;text-transform:uppercase;color:#D9CCFF;text-wrap:balance">una reserva posible.</span></h1>` : null}
        ${v.hC ? html`<h1 style="margin:0;color:#fff"><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:700;font-size:clamp(46px,8.2vw,128px);line-height:.9;letter-spacing:-0.01em;text-transform:uppercase;text-wrap:balance">Tus mensajes,</span><span style="display:block;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(38px,6.4vw,100px);line-height:.95;letter-spacing:-0.01em;margin-top:12px;text-transform:uppercase;color:#D9CCFF;text-wrap:balance">convertidos en citas.</span></h1>` : null}
        
      </div>
      ${v.mid ? html`<span aria-hidden="true" style="width:clamp(150px,19vw,260px);height:clamp(150px,19vw,260px);border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 24px 60px rgba(30,10,90,.28);animation:kupo-arrive 1.8s cubic-bezier(.3,.7,.3,1) .2s both"><span style="position:relative;display:block;width:58%;container-type:inline-size"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s -1.9s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span>` : null}
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:24px 40px;align-items:center;justify-content:space-between;margin-top:clamp(30px,4vw,48px)">
      <p style="margin:0;max-width:540px;font-size:clamp(16px,1.6vw,19px);line-height:1.6;color:rgba(255,255,255,.9);text-wrap:pretty">KUPO reúne tus mensajes de WhatsApp e Instagram en una sola bandeja, los atiende con IA y lleva cada cita a tu calendario.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="#demo" onClick=${v.openDemo} style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 32px;border-radius:100px;background:#fff;color:#4B2BC9;font-weight:600;font-size:15px;line-height:1.6;white-space:nowrap;box-shadow:0 10px 30px rgba(30,10,90,.25);transition:transform .25s var(--ease-standard),box-shadow .25s ease,background .25s ease" style-hover="transform:translateY(-1px);box-shadow:0 16px 40px rgba(30,10,90,.32);background:#F7F5FF;color:#4B2BC9" style-active="transform:none;background:#EEE9FF">Solicitar demo<span aria-hidden="true" style="font-size:16px">→</span></a>
        <a href="#como" style="display:inline-flex;align-items:center;justify-content:center;padding:15px 30px;border-radius:100px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.45);color:#fff;font-weight:600;font-size:15px;line-height:1.6;white-space:nowrap;transition:background .25s ease,transform .25s var(--ease-standard)" style-hover="background:rgba(255,255,255,.22);transform:translateY(-1px);color:#fff" style-active="transform:none;background:rgba(255,255,255,.3)">Ver cómo funciona</a>
      </div>
    </div>
    <figure aria-label="Demostración: una conversación de Instagram se convierte en una cita en el calendario" style="width:100%;margin:clamp(44px,6vw,64px) 0 0">
      <div style="border-radius:28px;padding:clamp(8px,1.6vw,18px);background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 40px 110px rgba(40,15,120,.32)">
        <div style="border-radius:16px;overflow:hidden;background:var(--c-surface);box-shadow:var(--shadow-inner);text-align:left;position:relative;color:var(--c-ink);font-size:13px">
          <div style="height:44px;display:flex;align-items:center;gap:12px;padding:0 14px;background:var(--c-bg);border-bottom:1px solid var(--c-line)">
            <div style="display:flex;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:#E5675C"></span><span style="width:10px;height:10px;border-radius:50%;background:#E6B34D"></span><span style="width:10px;height:10px;border-radius:50%;background:#5fa86a"></span></div>
            <div style="flex:1;display:flex;align-items:center;gap:8px;min-width:0"><img src="assets/kupo-mark.png" alt="" style="width:18px;height:18px;object-fit:contain" /><span style="font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Estudio Alba · Clínica estética</span></div>
            <span style="display:flex;align-items:center;gap:7px;height:26px;padding:0 10px;border-radius:100px;border:1px solid rgba(95,168,106,.35);background:var(--s-conf-bg);color:var(--s-conf);font-size:11.5px;font-weight:600;white-space:nowrap"><span style="width:6px;height:6px;border-radius:50%;background:#5fa86a;animation:cupo-pulse 2s infinite"></span>Agente activo</span>
          </div>
          <div style="display:flex;height:clamp(420px,46vw,470px)">
            ${v.wide ? html`
              <div style="width:264px;flex-shrink:0;border-right:1px solid var(--c-line);display:flex;flex-direction:column;background:var(--c-surface)">
                <div style="padding:14px 14px 10px;display:flex;align-items:center;gap:8px"><span style="flex:1;font-weight:600;font-size:15px;letter-spacing:-0.02em">Bandeja</span><span style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4)">HOY</span></div>
                <div style="display:flex;gap:2px;padding:0 10px;border-bottom:1px solid var(--c-line)"><span style="padding:6px 6px 8px;font-size:12px;font-weight:600;border-bottom:2px solid var(--c-ink);margin-bottom:-1px">Todas</span><span style="padding:6px 6px 8px;font-size:12px;color:var(--c-ink4)">IA</span><span style="padding:6px 6px 8px;font-size:12px;color:var(--c-ink4)">Requieren humano</span></div>
                ${v.heroList.map((c) => html`
                  <div style=${c.row}>
                    <div style="position:relative;flex-shrink:0"><span style=${c.av}>${c.ini}</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid var(--c-surface);border-radius:6px;display:flex"><span style=${c.chBox}><span role="img" aria-label=${c.chName} style=${c.chImg}></span></span></span></div>
                    <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:2px">
                      <div style="display:flex;align-items:center;gap:6px"><span style=${c.nameStyle}>${c.name}</span><span style="font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums">${c.time}</span></div>
                      ${c.typing ? html`<span style="font-size:12px;color:var(--c-brand);display:flex;align-items:center;gap:3px">IA escribiendo<span style="animation:kupo-dots 1.2s infinite">•</span><span style="animation:kupo-dots 1.2s .2s infinite">•</span><span style="animation:kupo-dots 1.2s .4s infinite">•</span></span>` : null}
                      ${c.notTyping ? html`<span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.last}</span>` : null}
                    </div>
                  </div>
                `)}
              </div>
            ` : null}
            <div style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--c-bg)">
              <div style="height:56px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:0 16px;border-bottom:1px solid var(--c-line);background:var(--c-surface)">
                <span style="width:32px;height:32px;border-radius:50%;background:#FBE9DA;color:#C9743C;font-size:11.5px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0">VM</span>
                <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:13.5px">Valeria Montemayor<span style="width:15px;height:15px;border-radius:4.5px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/instagram.svg" alt="Instagram" style="width:9px;height:9px" /></span></div><div style="font-size:11.5px;color:var(--c-ink4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">@vale.montemayor · La IA está atendiendo</div></div>
              </div>
              <div style="flex:1;min-height:0;overflow:hidden;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;gap:9px">
                <div style="align-self:center;font-size:11px;color:var(--c-ink4);padding:2px 0">Conversación iniciada por Instagram · 18:42</div>
                ${v.h1 ? html`
                  <div style="align-self:flex-start;max-width:min(82%,420px);display:flex;flex-direction:column;gap:3px;animation:kupo-in .35s ease both">
                    <div style="padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:13px;line-height:1.5">Hola, ¿tienen espacio mañana por la tarde para una limpieza facial?</div>
                    <span style="font-size:10.5px;color:var(--c-ink4);padding-left:4px">18:42</span>
                  </div>
                ` : null}
                ${v.heroTyping ? html`
                  <div style="align-self:flex-end;padding:10px 14px;border-radius:16px 16px 5px 16px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);display:flex;gap:4px;font-size:14px;color:var(--c-brand);animation:kupo-in .25s ease both"><span style="animation:kupo-dots 1.2s infinite">•</span><span style="animation:kupo-dots 1.2s .2s infinite">•</span><span style="animation:kupo-dots 1.2s .4s infinite">•</span></div>
                ` : null}
                ${v.h3 ? html`
                  <div style="align-self:flex-end;max-width:min(84%,440px);display:flex;flex-direction:column;gap:3px;align-items:flex-end;animation:kupo-in .35s ease both">
                    <div style="padding:9px 13px;border-radius:16px 16px 5px 16px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);font-size:13px;line-height:1.5">¡Hola, Valeria! Mañana jueves 15 tenemos disponible a las 16:00 y a las 17:30 con la Dra. Mariana López. ¿Qué horario prefieres?
                      <div style="display:flex;gap:6px;margin-top:8px"><span style=${v.heroChip}>16:00</span><span style="padding:4px 12px;border-radius:100px;border:1px solid var(--c-brand-line);background:var(--c-surface);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--c-ink)">17:30</span></div>
                    </div>
                    <span style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--c-ink4);padding-right:4px"><img src="assets/icons/sparkles.svg" alt="" style="width:10px;height:10px;opacity:.5" />Agente KUPO · 18:42</span>
                  </div>
                ` : null}
                ${v.h4 ? html`
                  <div style="align-self:flex-start;max-width:min(82%,420px);display:flex;flex-direction:column;gap:3px;animation:kupo-in .35s ease both">
                    <div style="padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:13px;line-height:1.5">A las 16:00, porfa.</div>
                    <span style="font-size:10.5px;color:var(--c-ink4);padding-left:4px">18:43</span>
                  </div>
                ` : null}
                ${v.h5 ? html`
                  <div style="align-self:flex-end;max-width:min(84%,440px);display:flex;flex-direction:column;gap:6px;align-items:flex-end;animation:kupo-in .35s ease both">
                    <div style="padding:9px 13px;border-radius:16px 16px 5px 16px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);font-size:13px;line-height:1.5">Listo. Tu cita quedó agendada para mañana jueves 15 a las 16:00. Te esperamos en Estudio Alba.</div>
                  </div>
                  <div style="align-self:center;margin-top:6px;animation:kupo-in .35s .3s ease both;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;background:var(--c-sunken);font-size:11px;color:var(--c-ink3);white-space:nowrap"><img src="assets/icons/calendar-check.svg" alt="" style="width:12px;height:12px;opacity:.6" />Solo visible para tu equipo · Cita registrada en calendario · Jue 15, 16:00</div>
                ` : null}
              </div>
            </div>
            ${v.mid ? html`
              <div style="width:clamp(220px,24vw,262px);flex-shrink:0;border-left:1px solid var(--c-line);background:var(--c-surface);display:flex;flex-direction:column">
                <div style="padding:14px 14px 12px;border-bottom:1px solid var(--c-line)"><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4)">CALENDARIO</div><div style="font-weight:600;font-size:14px;letter-spacing:-0.02em;margin-top:3px">Jueves 15 de octubre</div><div style="display:flex;align-items:center;gap:6px;margin-top:6px;font-size:11.5px;color:var(--c-ink3)"><span style="width:18px;height:18px;border-radius:50%;background:#dd9a5e;color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">ML</span>Dra. Mariana López</div></div>
                <div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;overflow:hidden">
                  <div style="display:flex;gap:10px"><span style="width:38px;flex-shrink:0;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;padding-top:7px">10:00</span><div style="flex:1;min-width:0;padding:7px 10px;border-radius:10px;background:var(--s-conf-bg)"><div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Consulta de valoración</div><div style="font-size:11px;color:var(--c-ink3)">Regina Salinas</div></div></div>
                  <div style="display:flex;gap:10px"><span style="width:38px;flex-shrink:0;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;padding-top:7px">12:00</span><div style="flex:1;min-width:0;padding:7px 10px;border-radius:10px;background:var(--s-pend-bg)"><div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Peeling químico</div><div style="font-size:11px;color:var(--c-ink3)">Karla Elizondo</div></div></div>
                  <div style="display:flex;gap:10px"><span style="width:38px;flex-shrink:0;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;padding-top:7px">14:00</span><div style="flex:1;padding:7px 10px;border-radius:10px;background:var(--c-unavail);border:1px solid var(--c-line);font-size:11.5px;color:var(--c-ink4)">No disponible</div></div>
                  <div style="display:flex;gap:10px"><span style="width:38px;flex-shrink:0;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;padding-top:7px">16:00</span>
                    ${v.h5not ? html`<div style="flex:1;padding:7px 10px;border-radius:10px;border:1px dashed var(--c-line3);font-size:11.5px;color:var(--c-ink4)">Disponible</div>` : null}
                    ${v.h5 ? html`<div style="flex:1;min-width:0;padding:7px 10px;border-radius:10px;background:var(--s-comp-bg);border:1px solid var(--c-brand-line);animation:kupo-in .4s var(--ease-pop) both, kupo-ring 1.4s ease-out .2s 2"><div style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600"><span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:4px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:9px;height:9px;filter:invert(1)" /></span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Limpieza facial</span></div><div style="font-size:11px;color:var(--c-ink3)">Valeria Montemayor</div></div>` : null}
                  </div>
                  <div style="display:flex;gap:10px"><span style="width:38px;flex-shrink:0;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;padding-top:7px">17:30</span><div style="flex:1;padding:7px 10px;border-radius:10px;border:1px dashed var(--c-line3);font-size:11.5px;color:var(--c-ink4)">Disponible</div></div>
                </div>
              </div>
            ` : null}
          </div>
          
        </div>
      </div>
      <figcaption style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--au-ink-4);text-align:center;margin-top:18px">De mensaje a cita · datos de ejemplo</figcaption>
    </figure>
  </div>
</section>

<section aria-label="Capacidades: conversaciones, atención con IA, reservas, calendario y reportes" style="padding:clamp(28px,4vw,48px) 0;overflow:hidden">
  <div style="background:#1B1240;color:#fff;padding:clamp(16px,2.2vw,26px) 0;transform:rotate(-1.6deg);margin:0 -24px;box-shadow:0 24px 60px rgba(27,18,64,.25)">
    <div style="display:flex;width:max-content;animation:kupo-marq 40s linear infinite"><span style="display:flex;align-items:center;gap:clamp(20px,3vw,40px);padding-right:clamp(20px,3vw,40px);font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(36px,6vw,84px);line-height:1.1;white-space:nowrap">Conversaciones<span style="color:#A68BFF;font-size:.6em">✦</span>Atención con IA<span style="color:#A68BFF;font-size:.6em">✦</span>Reservas<span style="color:#A68BFF;font-size:.6em">✦</span>Calendario<span style="color:#A68BFF;font-size:.6em">✦</span>Reportes<span style="color:#A68BFF;font-size:.6em">✦</span>WhatsApp<span style="color:#A68BFF;font-size:.6em">✦</span>Instagram<span style="color:#A68BFF;font-size:.6em">✦</span>Messenger<span style="color:#A68BFF;font-size:.6em">✦</span></span><span aria-hidden="true" style="display:flex;align-items:center;gap:clamp(20px,3vw,40px);padding-right:clamp(20px,3vw,40px);font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(36px,6vw,84px);line-height:1.1;white-space:nowrap">Conversaciones<span style="color:#A68BFF;font-size:.6em">✦</span>Atención con IA<span style="color:#A68BFF;font-size:.6em">✦</span>Reservas<span style="color:#A68BFF;font-size:.6em">✦</span>Calendario<span style="color:#A68BFF;font-size:.6em">✦</span>Reportes<span style="color:#A68BFF;font-size:.6em">✦</span>WhatsApp<span style="color:#A68BFF;font-size:.6em">✦</span>Instagram<span style="color:#A68BFF;font-size:.6em">✦</span>Messenger<span style="color:#A68BFF;font-size:.6em">✦</span></span></div>
  </div>
</section>

<section id="problema" data-screen-label="Problema" style="padding:clamp(56px,7vw,88px) clamp(16px,4vw,40px);background:#F7F5FF;border-top:1px solid var(--au-line-06)">
  <div style="max-width:1140px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(40px,6vw,80px);align-items:center">
    <div data-reveal="1">
      <h2 style=${`font-family:${v.dFont};font-weight:700;font-size:clamp(38px,5.4vw,72px);line-height:.95;letter-spacing:-0.01em;text-transform:uppercase;margin:0 0 22px;text-wrap:balance`}>Las reservas <span style="color:#5B37F0">se pierden</span> entre mensajes.</h2>
      <p style="margin:0 0 30px;font-size:17px;color:var(--au-ink-3);line-height:1.6;max-width:500px;text-wrap:pretty">Un cliente escribe por Instagram, otro por WhatsApp. Alguien tiene que revisar la agenda, responder y anotar la cita. Mientras tanto, los mensajes esperan.</p>
      <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px">
        <li style="display:flex;gap:14px;align-items:baseline;font-size:16px"><span style="width:9px;height:9px;border-radius:50%;background:#E5675C;flex-shrink:0;align-self:center"></span>Mensajes repartidos entre varias apps.</li>
        <li style="display:flex;gap:14px;align-items:baseline;font-size:16px"><span style="width:9px;height:9px;border-radius:50%;background:#E5675C;flex-shrink:0;align-self:center"></span>Clientes esperando una respuesta.</li>
        <li style="display:flex;gap:14px;align-items:baseline;font-size:16px"><span style="width:9px;height:9px;border-radius:50%;background:#E5675C;flex-shrink:0;align-self:center"></span>Horarios confirmados y anotados a mano.</li>
      </ol>
    </div>
    <div data-reveal="1" aria-hidden="true" style="position:relative;height:350px;max-width:520px;width:100%;justify-self:center">
      <div style="position:absolute;top:8px;left:0;width:min(80%,350px);transform:rotate(-3deg);background:#fff;border:1px solid var(--au-line-08);border-radius:18px;padding:14px 16px;box-shadow:0 18px 44px rgba(10,10,10,.08)">
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--au-ink-4)"><span style="width:18px;height:18px;border-radius:5px;background:#25D366;display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/whatsapp.svg" alt="" style="width:11px;height:11px" /></span>WhatsApp<span style="flex:1"></span><span style="min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#25D366;color:#fff;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">9</span></div>
        <div style="font-size:14.5px;font-weight:600;margin-top:10px">Chats sin leer</div>
        <div style="font-size:13px;color:var(--au-ink-3);margin-top:2px">“¿Me pueden cambiar la cita del viernes?”</div>
      </div>
      <div style="position:absolute;top:104px;right:0;width:min(78%,340px);transform:rotate(2.5deg);background:#fff;border:1px solid var(--au-line-08);border-radius:18px;padding:14px 16px;box-shadow:0 18px 44px rgba(10,10,10,.08)">
        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--au-ink-4)"><span style="width:18px;height:18px;border-radius:5px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/instagram.svg" alt="" style="width:11px;height:11px" /></span>Instagram · mensaje directo</div>
        <div style="font-size:13.5px;margin-top:10px">“Hola, ¿tienen lugar hoy en la tarde?”</div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--s-pend);margin-top:8px"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-pend-dot)"></span>Sin responder · hace 3 h</div>
      </div>
      <div style="position:absolute;top:196px;left:2%;width:min(66%,280px);transform:rotate(-2deg);background:var(--c-note-bg);border:1px solid var(--c-note-line);border-radius:6px;padding:16px 18px;box-shadow:0 14px 34px rgba(107,78,14,.10);color:var(--c-note-ink)">
        <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10.5px;letter-spacing:.06em">AGENDA DE RECEPCIÓN</div>
        <div style="font-size:14px;margin-top:8px;line-height:1.6"><span style="text-decoration:line-through;opacity:.6">Jue 16:00 — ¿Valeria?</span><br />Jue 17:30 — confirmar por DM</div>
      </div>
      <div style="position:absolute;top:-6px;right:0;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px"><span aria-hidden="true" style="width:88px;height:88px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 18px 44px rgba(30,10,90,.22);animation:kupo-float 4s ease-in-out infinite;"><span style="position:relative;display:block;width:58%;container-type:inline-size"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s 1.6s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span><span style="padding:6px 12px;border-radius:100px;background:#5B37F0;color:#fff;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:13px;white-space:nowrap;box-shadow:0 10px 24px rgba(91,55,240,.3)">Yo me encargo</span></div>
      <div style="position:absolute;bottom:14px;right:2%;width:min(52%,240px);transform:rotate(3deg);background:var(--au-ink);color:#fff;border-radius:16px 16px 5px 16px;padding:12px 15px;box-shadow:0 18px 44px rgba(10,10,10,.18);font-size:13.5px;line-height:1.45">¿Alguien ya le contestó a Diego?</div>
    </div>
  </div>
</section>

<section id="producto" data-screen-label="Solución" style="padding:clamp(56px,7vw,88px) 0;scroll-margin-top:90px;overflow:hidden">
  <div style="max-width:1180px;margin:0 auto;padding:0 clamp(16px,4vw,40px)">
    <div data-reveal="1" style="display:flex;flex-wrap:wrap;gap:24px 48px;align-items:flex-end;justify-content:space-between;margin-bottom:32px">
      <div style="max-width:720px">
        <div style="display:flex;align-items:center;gap:clamp(14px,2vw,24px);margin-bottom:18px"><span aria-hidden="true" style="width:clamp(64px,7vw,92px);height:clamp(64px,7vw,92px);border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 18px 44px rgba(30,10,90,.22);animation:kupo-float 4.4s ease-in-out infinite;"><span style="position:relative;display:block;width:58%;container-type:inline-size"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s 1.6s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span><h2 style=${`font-family:${v.dFont};font-weight:700;font-size:clamp(38px,5.6vw,76px);line-height:.92;letter-spacing:-0.01em;text-transform:uppercase;margin:0;text-wrap:balance`}>Del mensaje <span style="display:block;color:#5B37F0">a la cita.</span></h2></div>
        <p style="margin:0;font-size:17px;color:var(--au-ink-3);line-height:1.6;text-wrap:pretty">Conversaciones, IA y agenda conectadas, para que cada mensaje pueda terminar en una cita sin copiar datos de un lado a otro.</p>
      </div>
      <div style="display:flex;gap:10px">
        <button onClick=${v.prevSlide} aria-label="Capa anterior" disabled=${v.atStart} style=${v.prevBtn} style-hover="background:#F1EDFF"><img src="assets/icons/arrow-left.svg" alt="" style="width:18px;height:18px" /></button>
        <button onClick=${v.nextSlide} aria-label="Capa siguiente" disabled=${v.atEnd} style=${v.nextBtn} style-hover="background:#F1EDFF"><img src="assets/icons/arrow-right.svg" alt="" style="width:18px;height:18px" /></button>
      </div>
    </div>
    <div role="tablist" aria-label="Capas de KUPO" style="display:flex;gap:clamp(16px,3vw,36px);margin-bottom:22px;overflow-x:auto;scrollbar-width:none">
      ${v.slideTabs.map((t) => html`<button role="tab" aria-selected=${t.on} onClick=${t.pick} style=${t.style}>${t.label}</button>`)}
    </div>
  </div>
  <div ref=${v.trackRef} onScroll=${v.onTrack} style="position:relative;display:flex;gap:clamp(14px,2vw,22px);overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:6px max(clamp(16px,4vw,40px), calc((100% - 1100px) / 2)) 34px;scroll-padding:0 max(clamp(16px,4vw,40px), calc((100% - 1100px) / 2))">
    <article aria-label="Capa 1: Conversaciones" class="au-grain" style="flex:0 0 min(92%,1060px);scroll-snap-align:start;border-radius:32px;padding:clamp(26px,4vw,56px);background:radial-gradient(70% 90% at 92% 0%, #9A7BFF 0%, transparent 60%), linear-gradient(140deg,#5B37F0 0%,#6E44FF 100%);color:#fff;box-shadow:0 30px 80px rgba(75,43,201,.28);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:clamp(28px,4vw,56px);align-items:center">
      <div>
        <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:rgba(255,255,255,.82)">CONVERSACIONES</div>
        <h3 style="margin:18px 0 14px;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.4vw,56px);line-height:1;letter-spacing:-0.015em">Una sola bandeja</h3>
        <p style="margin:0;font-size:16.5px;line-height:1.6;color:rgba(255,255,255,.9);max-width:440px">Los mensajes de WhatsApp, Instagram y Messenger llegan al mismo lugar, con el historial de cada cliente.</p>
        <ul style="list-style:none;margin:24px 0 30px;padding:0;display:flex;flex-direction:column;gap:12px"><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Todos tus canales en una vista</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Perfiles del mismo cliente unificados</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.22);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Estado claro de cada conversación</li></ul>
        <a href="#bandeja" style="display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:12px 22px;border-radius:100px;color:#fff;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.4);transition:background .25s ease,transform .25s var(--ease-standard)" style-hover="transform:translateY(-1px);background:rgba(255,255,255,.26);color:#fff" style-active="transform:none">Ver la bandeja<span aria-hidden="true">→</span></a>
      </div>
      <div style="background:#fff;color:var(--c-ink);border-radius:22px;box-shadow:0 30px 70px rgba(30,10,90,.28);overflow:hidden;font-size:13px">
        <div style="display:flex;align-items:center;gap:6px;padding:14px 16px;border-bottom:1px solid var(--c-line)"><span style="flex:1;font-weight:600;font-size:15px">Bandeja</span><span style="height:26px;padding:0 10px;border-radius:8px;border:1px solid var(--c-ink);font-size:11.5px;display:inline-flex;align-items:center">Todos</span><span style="height:26px;padding:0 6px;border-radius:8px;border:1px solid var(--c-line);display:inline-flex;align-items:center"><span style="width:15px;height:15px;border-radius:5px;background:#25D366;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/whatsapp.svg" alt="" style="width:9px;height:9px" /></span></span><span style="height:26px;padding:0 6px;border-radius:8px;border:1px solid var(--c-line);display:inline-flex;align-items:center"><span style="width:15px;height:15px;border-radius:5px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/instagram.svg" alt="" style="width:9px;height:9px" /></span></span><span style="height:26px;padding:0 6px;border-radius:8px;border:1px solid var(--c-line);display:inline-flex;align-items:center"><span style="width:15px;height:15px;border-radius:5px;background:linear-gradient(45deg,#0866FF,#A033FF);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/messenger.svg" alt="" style="width:9px;height:9px" /></span></span></div>
        <div style="display:flex;gap:11px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--c-line)"><span style="position:relative;flex-shrink:0;display:flex"><span style="width:36px;height:36px;border-radius:50%;background:#FBE9DA;color:#C9743C;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">VM</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid #fff;border-radius:6px;display:flex"><span style="width:14px;height:14px;border-radius:4px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/instagram.svg" alt="" style="width:8px;height:8px" /></span></span></span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px"><div style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Valeria Montemayor</span><span style="font-size:11px;color:var(--c-ink4)">18:42</span></div><span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">¿Tienen espacio mañana por la tarde?</span><span style="display:flex"><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;white-space:nowrap;color:var(--s-comp);background:var(--s-comp-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-comp-dot)"></span>Atendiendo IA</span></span></div></div>
        <div style="display:flex;gap:11px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--c-line)"><span style="position:relative;flex-shrink:0;display:flex"><span style="width:36px;height:36px;border-radius:50%;background:#EEE9FF;color:#4B2BC9;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">DC</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid #fff;border-radius:6px;display:flex"><span style="width:14px;height:14px;border-radius:4px;background:#25D366;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/whatsapp.svg" alt="" style="width:8px;height:8px" /></span></span></span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px"><div style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Diego Cantú</span><span style="font-size:11px;color:var(--c-ink4)">18:38</span></div><span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">¿Puedo pagar a meses?</span><span style="display:flex"><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;white-space:nowrap;color:var(--s-pend);background:var(--s-pend-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-pend-dot)"></span>Requiere humano</span></span></div></div>
        <div style="display:flex;gap:11px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--c-line)"><span style="position:relative;flex-shrink:0;display:flex"><span style="width:36px;height:36px;border-radius:50%;background:#EDE7C2;color:#6B5A1E;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">JV</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid #fff;border-radius:6px;display:flex"><span style="width:14px;height:14px;border-radius:4px;background:linear-gradient(45deg,#0866FF,#A033FF);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/messenger.svg" alt="" style="width:8px;height:8px" /></span></span></span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px"><div style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Jorge Villarreal</span><span style="font-size:11px;color:var(--c-ink4)">17:54</span></div><span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Déjame revisar y te confirmo</span><span style="display:flex"><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;white-space:nowrap;color:var(--s-nos);background:var(--s-nos-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-nos-dot)"></span>Atendiendo equipo</span></span></div></div>
        <div style="display:flex;gap:11px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--c-line)"><span style="position:relative;flex-shrink:0;display:flex"><span style="width:36px;height:36px;border-radius:50%;background:#D9E7DC;color:#2f7d4a;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center">MS</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid #fff;border-radius:6px;display:flex"><span style="width:14px;height:14px;border-radius:4px;background:#25D366;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0"><img src="assets/icons/whatsapp.svg" alt="" style="width:8px;height:8px" /></span></span></span><div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px"><div style="display:flex;gap:6px;align-items:center"><span style="flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Mónica Sepúlveda</span><span style="font-size:11px;color:var(--c-ink4)">18:16</span></div><span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Perfecto, ahí estaré. Gracias</span><span style="display:flex"><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;white-space:nowrap;color:var(--s-conf);background:var(--s-conf-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-conf-dot)"></span>Resuelta</span></span></div></div>
      </div>
    </article>
    <article aria-label="Capa 2: Inteligencia artificial" style="flex:0 0 min(92%,1060px);scroll-snap-align:start;border-radius:32px;padding:clamp(26px,4vw,56px);background:radial-gradient(60% 80% at 100% 0%, #FFFFFF 0%, transparent 60%), #EEE9FF;color:#1B1240;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:clamp(28px,4vw,56px);align-items:center">
      <div>
        <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:#5B37F0">INTELIGENCIA ARTIFICIAL</div>
        <h3 style="margin:18px 0 14px;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.4vw,56px);line-height:1;letter-spacing:-0.015em">Un agente que atiende</h3>
        <p style="margin:0;font-size:16.5px;line-height:1.6;color:#3F3768;max-width:440px">Responde dudas frecuentes, ofrece horarios libres y avanza la reserva. Tu equipo decide cuándo intervenir.</p>
        <ul style="list-style:none;margin:24px 0 30px;padding:0;display:flex;flex-direction:column;gap:12px;color:#1B1240"><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:#5B37F0;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Entiende lo que pide el cliente</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:#5B37F0;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Propone horarios de la agenda real</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:#5B37F0;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Escala a una persona cuando el cliente lo pide</li></ul>
        <a href="#reservas" style="display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:12px 22px;border-radius:100px;color:#fff;background:#5B37F0;transition:background .25s ease,transform .25s var(--ease-standard)" style-hover="transform:translateY(-1px);background:#4B2BC9;color:#fff" style-active="transform:none">Ver una reserva<span aria-hidden="true">→</span></a>
      </div>
      <div style="background:#fff;color:var(--c-ink);border-radius:22px;box-shadow:0 30px 70px rgba(30,10,90,.28);overflow:hidden;font-size:13px">
        <div style="display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--c-line)"><span style="width:26px;height:26px;border-radius:8px;background:var(--c-ai);display:flex;align-items:center;justify-content:center"><img src="assets/icons/sparkles.svg" alt="" style="width:14px;height:14px;filter:invert(1)" /></span><span style="flex:1;font-weight:600;font-size:14px">Agente KUPO</span><span style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--s-conf)"><span style="width:6px;height:6px;border-radius:50%;background:#5fa86a"></span>Activo</span></div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:9px;background:var(--c-bg)">
          <div style="align-self:flex-start;max-width:85%;padding:9px 13px;border-radius:16px 16px 16px 5px;background:#fff;border:1px solid var(--c-line);line-height:1.5">Hola, ¿tienen espacio mañana por la tarde?</div>
          <div style="align-self:flex-end;max-width:88%;padding:9px 13px;border-radius:16px 16px 5px 16px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);line-height:1.5">Mañana jueves 15 tengo 16:00 y 17:30 con la Dra. Mariana López. ¿Cuál prefieres?</div>
        </div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:9px;border-top:1px solid var(--c-line)"><div style="display:flex;align-items:center;gap:9px;font-size:12.5px"><span style="width:18px;height:18px;border-radius:50%;background:#5B37F0;color:#fff;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">✓</span>Entiende la solicitud</div><div style="display:flex;align-items:center;gap:9px;font-size:12.5px"><span style="width:18px;height:18px;border-radius:50%;background:#5B37F0;color:#fff;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">✓</span>Revisa la disponibilidad</div><div style="display:flex;align-items:center;gap:9px;font-size:12.5px"><span style="width:18px;height:18px;border-radius:50%;background:#5B37F0;color:#fff;font-size:10px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">✓</span>Propone horarios y agenda</div><div style="display:flex;align-items:center;gap:9px;font-size:12.5px"><span style="width:18px;height:18px;border-radius:50%;border:1.5px dashed #8F6BFF;display:inline-flex"></span>Pasa a tu equipo si hace falta</div></div>
        <div style="margin:0 16px 16px;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:var(--s-pend-bg);border:1px solid rgba(230,179,77,.45)"><img src="assets/icons/hand.svg" alt="" style="width:15px;height:15px;opacity:.7" /><span style="flex:1;font-size:12px;line-height:1.4">Diego pidió hablar con una persona</span><span aria-hidden="true" style="padding:5px 11px;border-radius:100px;background:var(--c-inverse);color:#fff;font-size:11px;font-weight:600;white-space:nowrap">Tomar conversación</span></div>
      </div>
    </article>
    <article aria-label="Capa 3: Operación" style="flex:0 0 min(92%,1060px);scroll-snap-align:start;border-radius:32px;padding:clamp(26px,4vw,56px);background:radial-gradient(60% 80% at 100% 0%, rgba(143,107,255,.5) 0%, transparent 60%), #1B1240;color:#fff;box-shadow:0 30px 80px rgba(27,18,64,.3);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:clamp(28px,4vw,56px);align-items:center">
      <div>
        <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:rgba(255,255,255,.62)">OPERACIÓN</div>
        <h3 style="margin:18px 0 14px;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.4vw,56px);line-height:1;letter-spacing:-0.015em">Tu operación, en orden</h3>
        <p style="margin:0;font-size:16.5px;line-height:1.6;color:rgba(255,255,255,.82);max-width:440px">Cada cita queda en el calendario del profesional, con su estado y su origen, y se refleja en tus reportes.</p>
        <ul style="list-style:none;margin:24px 0 30px;padding:0;display:flex;flex-direction:column;gap:12px"><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(195,178,255,.25);color:#C3B2FF;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Agenda del día por profesional</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(195,178,255,.25);color:#C3B2FF;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Citas agendadas por IA, marcadas</li><li style="display:flex;gap:12px;align-items:flex-start;font-size:15.5px;line-height:1.5"><span style="width:22px;height:22px;border-radius:50%;background:rgba(195,178,255,.25);color:#C3B2FF;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">✓</span>Reportes de conversaciones y reservas</li></ul>
        <a href="#calendario" style="display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:15px;padding:12px 22px;border-radius:100px;color:#1B1240;background:#C3B2FF;transition:background .25s ease,transform .25s var(--ease-standard)" style-hover="transform:translateY(-1px);background:#D6CAFF;color:#1B1240" style-active="transform:none">Ver el calendario<span aria-hidden="true">→</span></a>
      </div>
      <div style="background:#fff;color:var(--c-ink);border-radius:22px;box-shadow:0 30px 70px rgba(30,10,90,.28);overflow:hidden;font-size:13px">
        <div style="padding:14px 16px;border-bottom:1px solid var(--c-line)"><div style="font-weight:600;font-size:15px">Jueves 15 de octubre</div><div style="font-size:11.5px;color:var(--c-ink4);margin-top:2px">8 citas · 4 agendadas por IA</div></div>
        <div style="padding:14px 16px;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;gap:10px;align-items:center"><span style="width:38px;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;flex-shrink:0">09:30</span><div style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;background:var(--s-conf-bg);border:1px solid transparent;display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:9px;height:9px;filter:invert(1)" /></span><span style="flex:1;min-width:0"><span style="display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Depilación láser</span><span style="display:block;font-size:11px;color:var(--c-ink3)">Mónica Sepúlveda</span></span><span style="width:20px;height:20px;border-radius:50%;background:#3E8FAE;color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">CR</span></div></div>
          <div style="display:flex;gap:10px;align-items:center"><span style="width:38px;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;flex-shrink:0">10:00</span><div style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;background:var(--s-conf-bg);border:1px solid transparent;display:flex;align-items:center;gap:8px"><span style="flex:1;min-width:0"><span style="display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Consulta de valoración</span><span style="display:block;font-size:11px;color:var(--c-ink3)">Regina Salinas</span></span><span style="width:20px;height:20px;border-radius:50%;background:#dd9a5e;color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">ML</span></div></div>
          <div style="display:flex;gap:10px;align-items:center"><span style="width:38px;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums;flex-shrink:0">16:00</span><div style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;background:var(--s-comp-bg);border:1px solid var(--c-brand-line);box-shadow:0 8px 20px rgba(91,55,240,.16);display:flex;align-items:center;gap:8px"><span style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:9px;height:9px;filter:invert(1)" /></span><span style="flex:1;min-width:0"><span style="display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Limpieza facial profunda</span><span style="display:block;font-size:11px;color:var(--c-ink3)">Valeria Montemayor</span></span><span style="width:20px;height:20px;border-radius:50%;background:#dd9a5e;color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">ML</span></div></div>
          <div style="display:flex;gap:10px;align-items:center"><span style="width:38px;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums">17:30</span><div style="flex:1;padding:8px 10px;border-radius:10px;border:1px dashed var(--c-line3);font-size:12px;color:var(--c-ink4)">Disponible · Dra. Mariana López</div></div>
        </div>
        <div style="padding:12px 16px 16px;border-top:1px solid var(--c-line)"><div style="font-size:11.5px;color:var(--c-ink3);margin-bottom:8px">Citas por semana · ejemplo</div><div style="display:flex;align-items:flex-end;gap:5px;height:48px"><span style="flex:1;height:52%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:60%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:58%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:72%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:70%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:86%;border-radius:3px;background:rgba(110,68,255,.28)"></span><span style="flex:1;height:100%;border-radius:3px;background:#5B37F0"></span></div></div>
      </div>
    </article>
  </div>
</section>

<section id="bandeja" data-screen-label="Bandeja" style="padding:clamp(64px,8vw,104px) clamp(12px,4vw,40px);background:#1B1240;color:#fff;scroll-margin-top:90px">
  <div style="max-width:1180px;margin:0 auto">
    <div data-reveal="1" style="text-align:center;max-width:1000px;margin:0 auto 52px;padding:0 4px;display:flex;flex-direction:column;align-items:center">
      <span aria-hidden="true" style="width:76px;height:76px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 18px 44px rgba(30,10,90,.22);animation:kupo-float 4s ease-in-out infinite;margin-bottom:26px"><span style="position:relative;display:block;width:58%;container-type:inline-size"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s 1.6s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span>
      <h2 style=${`font-family:${v.dFont};font-weight:700;font-size:clamp(36px,6vw,88px);line-height:.92;letter-spacing:-0.01em;text-transform:uppercase;margin:0 0 22px;text-wrap:balance;color:#fff`}>Todas tus conversaciones. <span style="display:block;color:#A68BFF">Un solo lugar.</span></h2>
      <p style="margin:0;max-width:640px;font-size:17px;color:rgba(255,255,255,.78);line-height:1.6;text-wrap:pretty">Cada mensaje llega con su canal, su historial y el estado de la atención. Tu equipo ve qué atiende la IA y qué necesita a una persona.</p>
    </div>
    <div data-reveal="1" class="au-grain" style="border-radius:24px;padding:clamp(8px,2vw,28px);background:radial-gradient(70% 90% at 14% 20%, #9A7BFF 0%, transparent 58%), radial-gradient(80% 90% at 88% 35%, #4B2BC9 0%, transparent 58%), radial-gradient(90% 100% at 55% 105%, #EEE9FF 0%, transparent 60%), linear-gradient(135deg,#6E44FF,#6E44FF);box-shadow:0 34px 90px rgba(75,43,201,.3)">
      <div style="border-radius:14px;overflow:hidden;background:var(--c-surface);box-shadow:var(--shadow-inner);color:var(--c-ink);font-size:13px">
        <div style="height:40px;display:flex;align-items:center;gap:12px;padding:0 14px;background:var(--c-bg);border-bottom:1px solid var(--c-line)"><div style="display:flex;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:#E5675C"></span><span style="width:10px;height:10px;border-radius:50%;background:#E6B34D"></span><span style="width:10px;height:10px;border-radius:50%;background:#5fa86a"></span></div><span style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10.5px;letter-spacing:.06em;color:var(--c-ink4)">KUPO · BANDEJA</span></div>
        <div style=${v.inboxWrap}>
          <div style=${v.listCol}>
            <div style="padding:14px 16px 0;display:flex;flex-direction:column;gap:10px">
              <div style="font-weight:600;font-size:16px;letter-spacing:-0.02em">Bandeja</div>
              <div role="tablist" aria-label="Filtrar conversaciones" style="display:flex;gap:2px;border-bottom:1px solid var(--c-line);margin:0 -16px;padding:0 10px;overflow-x:auto;scrollbar-width:none">
                ${v.tabs.map((t) => html`<button role="tab" aria-selected=${t.on} onClick=${t.pick} style=${t.style}>${t.label}<span style=${t.cStyle}>${t.count}</span></button>`)}
              </div>
            </div>
            <div style="flex:1;overflow-y:auto">
              ${v.inbox.map((c) => html`
                <button onClick=${c.pick} style=${c.row}>
                  <span style="position:relative;flex-shrink:0;display:flex"><span style=${c.av}>${c.ini}</span><span style="position:absolute;right:-3px;bottom:-3px;border:2px solid var(--c-surface);border-radius:6px;display:flex"><span style=${c.chBox}><span role="img" aria-label=${c.chName} style=${c.chImg}></span></span></span></span>
                  <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
                    <span style="display:flex;align-items:center;gap:6px"><span style=${c.nameStyle}>${c.name}</span><span style="font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums">${c.time}</span></span>
                    <span style="font-size:12px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.last}</span>
                    <span style="display:flex;margin-top:2px"><span style=${c.bBox}><span style=${c.bDot}></span>${c.bLabel}</span></span>
                  </span>
                </button>
              `)}
            </div>
          </div>
          <div style="flex:1;min-width:0;display:flex;flex-direction:column;background:var(--c-bg);min-height:440px">
            <div style="min-height:58px;flex-shrink:0;display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--c-line);background:var(--c-surface);flex-wrap:wrap">
              <span style=${v.cur.av}>${v.cur.ini}</span>
              <div style="flex:1;min-width:140px"><div style="display:flex;align-items:center;gap:6px;font-weight:600;font-size:14px">${v.cur.name}<span style=${v.cur.chBox}><span role="img" aria-label=${v.cur.chName} style=${v.cur.chImg}></span></span></div><div style="font-size:11.5px;color:var(--c-ink4)">${v.cur.handle} · ${v.cur.modeText}</div></div>
              ${v.cur.canTake ? html`<button onClick=${v.take} style="padding:7px 14px;border-radius:100px;border:none;background:var(--c-inverse);color:var(--c-on-inverse);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:transform .2s ease" style-hover="transform:translateY(-1px)" style-active="transform:none;background:#000">Tomar conversación</button>` : null}
              ${v.cur.isStaff ? html`<button onClick=${v.giveBack} style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:100px;border:1px solid var(--c-brand-line);background:var(--c-brand-soft);color:var(--c-brand);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap" style-hover="background:rgba(62,143,174,.2)"><img src="assets/icons/sparkles.svg" alt="" style="width:12px;height:12px;opacity:.7" />Devolver a la IA</button>` : null}
            </div>
            <div style="flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:9px">
              ${v.thread.map((m) => html`
                ${m.isSys ? html`<div style="align-self:center;font-size:11px;color:var(--c-ink4);padding:2px 0;text-align:center">${m.text}</div>` : null}
                ${m.isClient ? html`<div style="align-self:flex-start;max-width:min(82%,460px);display:flex;flex-direction:column;gap:3px"><div style="padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:13px;line-height:1.5">${m.text}</div><span style="font-size:10.5px;color:var(--c-ink4);padding-left:4px">${m.time}</span></div>` : null}
                ${m.isAi ? html`<div style="align-self:flex-end;max-width:min(82%,460px);display:flex;flex-direction:column;gap:3px;align-items:flex-end"><div style="padding:9px 13px;border-radius:16px 16px 5px 16px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);font-size:13px;line-height:1.5">${m.text}</div><span style="display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--c-ink4);padding-right:4px"><img src="assets/icons/sparkles.svg" alt="" style="width:10px;height:10px;opacity:.5" />Agente KUPO · ${m.time}</span></div>` : null}
                ${m.isStaff ? html`<div style="align-self:flex-end;max-width:min(82%,460px);display:flex;flex-direction:column;gap:3px;align-items:flex-end"><div style="padding:9px 13px;border-radius:16px 16px 5px 16px;background:var(--c-inverse);color:var(--c-on-inverse);font-size:13px;line-height:1.5">${m.text}</div><span style="font-size:10.5px;color:var(--c-ink4);padding-right:4px">Sofía · Recepción · ${m.time}</span></div>` : null}
                ${m.isNote ? html`<div style="align-self:stretch;padding:10px 13px;border-radius:12px;background:var(--c-note-bg);border:1px dashed var(--c-note-line);color:var(--c-note-ink)"><div style="font-size:11px;font-weight:600;margin-bottom:3px">Nota interna · solo visible para el equipo</div><div style="font-size:12.5px;line-height:1.5">${m.text}</div></div>` : null}
                ${m.isHandoff ? html`<div style="align-self:stretch;display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:12px;background:var(--s-pend-bg);border:1px solid rgba(230,179,77,.45)"><img src="assets/icons/hand.svg" alt="" style="width:15px;height:15px;opacity:.7;flex-shrink:0" /><div style="font-size:12.5px;line-height:1.45"><b style="font-weight:600">La IA escaló esta conversación.</b> El cliente pidió hablar con una persona · ${m.time}</div></div>` : null}
                ${m.isCard ? html`
                  <div style="align-self:center;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;background:var(--c-sunken);font-size:11px;color:var(--c-ink3);white-space:nowrap"><img src="assets/icons/calendar-check.svg" alt="" style="width:12px;height:12px;opacity:.6" />Solo visible para tu equipo · Cita registrada en calendario · Limpieza facial · Jue 15, 16:00</div>
                ` : null}
              `)}
            </div>
          </div>
          ${v.wide ? html`
            <aside aria-label="Ficha del cliente" style="width:290px;flex-shrink:0;border-left:1px solid var(--c-line);background:var(--c-surface);overflow-y:auto">
              <div style="padding:22px 18px 16px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;border-bottom:1px solid var(--c-line)"><span style=${v.cur.avLg}>${v.cur.ini}</span><div style="font-weight:600;font-size:15px;margin-top:8px">${v.cur.name}</div><div style="font-size:12px;color:var(--c-ink4)">${v.cur.handle}</div></div>
              <div style="padding:16px 18px;display:flex;flex-direction:column;gap:18px">
                <div><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4);margin-bottom:8px">CANALES VINCULADOS</div>
                  <div style="display:flex;flex-direction:column;gap:7px">${v.cur.links.map((l) => html`<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style=${l.chBox}><span role="img" aria-label=${l.chName} style=${l.chImg}></span></span><span style="flex:1;color:var(--c-ink2)">${l.handle}</span></div>`)}</div>
                </div>
                <div><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4);margin-bottom:8px">ETIQUETAS</div><div style="display:flex;flex-wrap:wrap;gap:5px">${v.cur.tags.map((t) => html`<span style="padding:3px 10px;border-radius:100px;background:var(--c-sunken);border:1px solid var(--c-line);font-size:11.5px;color:var(--c-ink2);white-space:nowrap">${t}</span>`)}</div></div>
                <div style="border-radius:14px;padding:13px;background:linear-gradient(180deg,var(--c-brand-soft),transparent);border:1px solid var(--c-brand-line)"><div style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;color:var(--c-brand);margin-bottom:5px"><img src="assets/icons/sparkles.svg" alt="" style="width:12px;height:12px;opacity:.6" />Resumen de IA</div><div style="font-size:12.5px;line-height:1.55;color:var(--c-ink2)">${v.cur.sum}</div></div>
                ${v.cur.hasNext ? html`
                  <div><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4);margin-bottom:8px">PRÓXIMA CITA</div>
                  <div style="padding:11px;border-radius:12px;border:1px solid var(--c-line);display:flex;gap:12px;align-items:center"><div style="width:40px;text-align:center;flex-shrink:0"><div style="font-size:10px;color:var(--s-canc);font-weight:600;letter-spacing:.06em">OCT</div><div style="font-size:19px;font-weight:600;line-height:1.1">15</div></div><div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:500">${v.cur.nextSvc}</div><div style="font-size:11.5px;color:var(--c-ink4)">${v.cur.nextMeta}</div></div></div></div>
                ` : null}
              </div>
            </aside>
          ` : null}
        </div>
      </div>
    </div>
    <ul data-reveal="1" style="list-style:none;margin:40px auto 0;padding:0 4px;max-width:1080px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px">
      <li><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:#A68BFF;margin-bottom:8px">CONTEXTO</div><div style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.6"><b style="font-weight:600;color:#fff">Historial y resumen de IA</b> de cada cliente, aunque escriba por canales distintos.</div></li>
      <li><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:#A68BFF;margin-bottom:8px">ORDEN</div><div style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.6"><b style="font-weight:600;color:#fff">Estados claros:</b> atendiendo IA, requiere humano, atendiendo equipo o resuelta.</div></li>
      <li><div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:12px;letter-spacing:.06em;color:#A68BFF;margin-bottom:8px">CONTROL</div><div style="font-size:15px;color:rgba(255,255,255,.75);line-height:1.6"><b style="font-weight:600;color:#fff">Toma cualquier conversación</b> y devuélvela a la IA cuando termines. Prueba arriba.</div></li>
    </ul>
  </div>
</section>

<section id="reservas" data-screen-label="Reservas" style="padding:clamp(56px,7vw,88px) clamp(16px,4vw,40px);background:#F7F5FF;border-top:1px solid var(--au-line-06);scroll-margin-top:90px">
  <div style="max-width:1140px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(40px,6vw,72px);align-items:center">
    <div data-reveal="1">
      <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.6vw,56px);line-height:1.02;letter-spacing:-0.015em;margin:0 0 16px;text-wrap:balance">De un mensaje a una reserva, sin fricción.</h2>
      <p style="margin:0 0 30px;font-size:17px;color:var(--au-ink-3);line-height:1.6;max-width:500px;text-wrap:pretty">El cliente dice lo que necesita con sus palabras. KUPO ofrece horarios libres y deja la cita en tu agenda.</p>
      <div role="tablist" aria-label="Pasos de una reserva" style="display:flex;flex-direction:column;gap:8px">
        ${v.rsteps.map((s) => html`
          <button role="tab" aria-selected=${s.on} onClick=${s.pick} style=${s.box}>
            <span style=${s.idxStyle}></span>
            <span style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="font-weight:600;font-size:16px;letter-spacing:-0.01em;color:var(--au-ink)">${s.title}</span>${s.on ? html`<span style="font-size:14px;color:var(--au-ink-3);line-height:1.55;animation:kupo-in .3s ease both">${s.desc}</span>` : null}</span>
          </button>
        `)}
      </div>
    </div>
    <div data-reveal="1" aria-label="Demostración del flujo de reserva" style="position:relative;display:flex;flex-direction:column;align-items:center;gap:0">
      <div style="width:min(100%,380px);border-radius:28px;background:var(--c-surface);border:1px solid var(--au-line-08);box-shadow:0 30px 80px rgba(10,27,61,.14);overflow:hidden;color:var(--c-ink)">
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--c-line)"><span style="width:34px;height:34px;border-radius:50%;background:#F3E0E6;color:#9B2C5A;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">EA</span><div style="flex:1"><div style="font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px">Estudio Alba<span style="width:15px;height:15px;border-radius:4.5px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/instagram.svg" alt="Instagram" style="width:9px;height:9px" /></span></div><div style="font-size:11.5px;color:var(--c-ink4)">Responde el agente KUPO</div></div></div>
        <div style="height:420px;padding:16px 16px 44px;display:flex;flex-direction:column;justify-content:flex-end;gap:9px;background:var(--c-bg);overflow:hidden">
          <div style="align-self:flex-end;max-width:84%;padding:9px 13px;border-radius:16px 16px 5px 16px;background:#5B37F0;color:#fff;font-size:13px;line-height:1.5">Hola, ¿tienen espacio mañana por la tarde para una limpieza facial?</div>
          ${v.r2 ? html`<div style="align-self:flex-start;max-width:86%;padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:13px;line-height:1.5;animation:kupo-in .35s ease both">¡Hola, Valeria! Mañana jueves 15 tenemos disponible a las 16:00 y a las 17:30 con la Dra. Mariana López. ¿Qué horario prefieres?<div style="display:flex;gap:6px;margin-top:8px"><span style=${v.rChip}>16:00</span><span style="padding:4px 12px;border-radius:100px;border:1px solid var(--c-line2);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums">17:30</span></div></div>` : null}
          ${v.r3 ? html`<div style="align-self:flex-end;max-width:84%;padding:9px 13px;border-radius:16px 16px 5px 16px;background:#5B37F0;color:#fff;font-size:13px;line-height:1.5;animation:kupo-in .35s ease both">A las 16:00, porfa.</div>` : null}
          ${v.r4 ? html`<div style="align-self:flex-start;max-width:86%;padding:9px 13px;border-radius:16px 16px 16px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:13px;line-height:1.5;animation:kupo-in .35s ease both">Listo. Tu cita quedó agendada para mañana jueves 15 a las 16:00. Te esperamos en Estudio Alba.</div>` : null}
        </div>
      </div>
      <div style=${v.rCal}>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4);flex:1">CALENDARIO · JUE 15 OCT</span><span style="width:18px;height:18px;border-radius:50%;background:#dd9a5e;color:#fff;font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">ML</span></div>
        <div style="display:flex;gap:10px;align-items:center"><span style="width:38px;font-size:11px;color:var(--c-ink4);font-variant-numeric:tabular-nums">16:00</span>
          ${v.r4 ? html`<div style="flex:1;min-width:0;padding:8px 10px;border-radius:10px;background:var(--s-comp-bg);border:1px solid var(--c-brand-line);display:flex;align-items:center;gap:8px;animation:kupo-in .4s var(--ease-pop) both"><span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:5px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:10px;height:10px;filter:invert(1)" /></span><span style="flex:1;min-width:0"><span style="display:block;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Limpieza facial profunda</span><span style="display:block;font-size:11px;color:var(--c-ink3)">Valeria Montemayor</span></span><span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:500;color:var(--s-conf);background:var(--s-conf-bg);white-space:nowrap"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-conf-dot)"></span>Confirmada</span></div>` : null}
          ${v.r4not ? html`<div style="flex:1;padding:8px 10px;border-radius:10px;border:1px dashed var(--c-line3);font-size:12px;color:var(--c-ink4)">Disponible</div>` : null}
        </div>
      </div>
    </div>
  </div>
</section>

<section id="calendario" data-screen-label="Calendario" style="padding:clamp(56px,7vw,88px) clamp(12px,4vw,40px);border-top:1px solid var(--au-line-06);scroll-margin-top:90px">
  <div style="max-width:1180px;margin:0 auto">
    <div data-reveal="1" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:clamp(20px,4vw,56px);align-items:end;margin-bottom:44px;padding:0 4px">
      <div>
        <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.6vw,58px);line-height:1.02;letter-spacing:-0.015em;margin:0;text-wrap:balance">Tu agenda, siempre bajo control.</h2>
      </div>
      <p style="margin:0;font-size:17px;color:var(--au-ink-3);line-height:1.6;max-width:500px;text-wrap:pretty">Ve el día por profesional, con el estado de cada cita y su origen. Lo que agenda la IA aparece marcado para que tu equipo lo identifique al instante.</p>
    </div>
    <div data-reveal="1" style="border-radius:20px;border:1px solid var(--au-line-08);background:var(--c-surface);box-shadow:0 30px 80px rgba(10,10,10,.08);overflow:hidden;color:var(--c-ink);font-size:13px">
      <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid var(--c-line);flex-wrap:wrap">
        <span style="height:30px;padding:0 12px;border-radius:8px;border:1px solid var(--c-line2);font-size:12px;font-weight:600;display:inline-flex;align-items:center">Hoy</span>
        <div style="flex:1;min-width:180px"><div style="font-weight:600;font-size:16px;letter-spacing:-0.02em">Jueves 15 de octubre</div><div style="font-size:11.5px;color:var(--c-ink4)">8 citas · 3 profesionales</div></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:500;color:var(--s-conf);background:var(--s-conf-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-conf-dot)"></span>Confirmada</span>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:500;color:var(--s-pend);background:var(--s-pend-bg)"><span style="width:6px;height:6px;border-radius:50%;background:var(--s-pend-dot)"></span>Pendiente</span>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:500;color:var(--c-ink3);background:var(--c-sunken)"><span style="display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;border-radius:3px;background:var(--c-ai)"><img src="assets/icons/sparkles.svg" alt="" style="width:8px;height:8px;filter:invert(1)" /></span>Agendado por IA</span>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap">
        <div style="flex:1 1 560px;min-width:0;overflow-x:auto">
          <div style="min-width:560px">
            <div style="display:grid;grid-template-columns:56px repeat(3,minmax(160px,1fr));border-bottom:1px solid var(--c-line)">
              <span></span>
              ${v.pros.map((p) => html`<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;border-left:1px solid var(--c-line)"><span style=${p.av}>${p.ini}</span><span style="font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</span></div>`)}
            </div>
            <div style="display:grid;grid-template-columns:56px repeat(3,minmax(160px,1fr))">
              <div style="position:relative;height:520px">${v.hours.map((h) => html`<span style=${h.style}>${h.l}</span>`)}</div>
              ${v.pros.map((p) => html`
                <div style="position:relative;height:520px;border-left:1px solid var(--c-line);background-image:repeating-linear-gradient(180deg,transparent 0 51px,var(--c-line) 51px 52px)">
                  ${p.blocks.map((b) => html`<div style=${b.style}><span style="font-size:11px;color:var(--c-ink4)">No disponible</span></div>`)}
                  ${p.apts.map((a) => html`
                    <button onClick=${a.pick} aria-pressed=${a.sel} style=${a.style}>
                      <span style="display:flex;align-items:center;gap:5px;min-width:0">${a.ai ? html`<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:4px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:9px;height:9px;filter:invert(1)" /></span>` : null}<span style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.svc}</span></span>
                      <span style="font-size:11px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.range} · ${a.cl}</span>
                    </button>
                  `)}
                </div>
              `)}
            </div>
          </div>
        </div>
        <aside aria-label="Detalle de la cita" style="flex:1 1 260px;max-width:100%;border-left:1px solid var(--c-line);border-top:1px solid var(--c-line);margin-top:-1px;padding:20px;display:flex;flex-direction:column;gap:16px;background:var(--c-bg)">
          <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10px;letter-spacing:.06em;color:var(--c-ink4)">DETALLE DE LA CITA</div>
          <div><div style="font-weight:600;font-size:18px;letter-spacing:-0.02em">${v.apt.svc}</div><div style="font-size:13px;color:var(--c-ink3);margin-top:4px">${v.apt.when}</div></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap"><span style=${v.apt.bBox}><span style=${v.apt.bDot}></span>${v.apt.bLabel}</span>${v.apt.ai ? html`<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px 2px 6px;border-radius:100px;background:var(--c-ai);color:#fff;font-size:11px;font-weight:600"><img src="assets/icons/sparkles.svg" alt="" style="width:10px;height:10px;filter:invert(1)" />Agendado por IA</span>` : null}</div>
          <div style="display:flex;flex-direction:column;gap:10px;font-size:13px">
            <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:var(--c-ink4)">Cliente</span><span style="font-weight:500;text-align:right">${v.apt.cl}</span></div>
            <div style="display:flex;justify-content:space-between;gap:12px"><span style="color:var(--c-ink4)">Profesional</span><span style="font-weight:500;text-align:right">${v.apt.pro}</span></div>
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><span style="color:var(--c-ink4)">Canal</span><span style="display:flex;align-items:center;gap:6px;font-weight:500"><span style=${v.apt.chBox}><span role="img" aria-label=${v.apt.chName} style=${v.apt.chImg}></span></span>${v.apt.chName}</span></div>
          </div>
          <p style="margin:auto 0 0;font-size:12px;color:var(--c-ink4);line-height:1.5">Selecciona cualquier cita del calendario para ver su detalle.</p>
        </aside>
      </div>
    </div>
  </div>
</section>

<section id="reportes" data-screen-label="Reportes" style="padding:clamp(56px,7vw,88px) clamp(12px,4vw,40px);background:#F7F5FF;border-top:1px solid var(--au-line-06);scroll-margin-top:90px">
  <div style="max-width:1180px;margin:0 auto;display:flex;flex-wrap:wrap-reverse;gap:clamp(36px,5vw,64px);align-items:center">
    <div data-reveal="1" style="flex:1.6 1 560px;min-width:0;border-radius:20px;border:1px solid var(--au-line-08);background:var(--c-surface);box-shadow:0 30px 80px rgba(10,10,10,.07);padding:clamp(16px,2.4vw,24px);color:var(--c-ink);display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="flex:1;font-size:22px;letter-spacing:-0.03em">Reportes</span><span style="font-size:12px;color:var(--c-ink4)">Últimos 30 días</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1px;background:var(--c-line);border:1px solid var(--c-line);border-radius:14px;overflow:hidden">
        ${v.kpis.map((k) => html`<div style="background:var(--c-surface);padding:14px 16px"><div style="font-size:12px;color:var(--c-ink3)">${k.l}</div><div style="font-size:26px;letter-spacing:-0.035em;margin-top:4px;font-variant-numeric:tabular-nums">${k.v}</div></div>`)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:14px">
        <div style="border:1px solid var(--c-line);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:baseline;margin-bottom:14px"><span style="flex:1;font-weight:600;font-size:13.5px">Citas por semana</span><span style="font-size:11px;color:var(--c-ink4)">12 semanas</span></div>
          <div style="display:flex;align-items:flex-end;gap:5px;height:130px">${v.weeks.map((wk) => html`<div title=${wk.tip} style=${wk.bar}></div>`)}</div>
        </div>
        <div style="border:1px solid var(--c-line);border-radius:14px;padding:16px">
          <div style="font-weight:600;font-size:13.5px;margin-bottom:14px">Por canal de origen</div>
          <div style="display:flex;align-items:center;gap:18px">
            <div style="position:relative;width:104px;height:104px;border-radius:50%;flex-shrink:0;background:conic-gradient(#25D366 0 64%,#DD2A7B 64% 92%,#0866FF 92% 100%)"><div style="position:absolute;inset:18px;border-radius:50%;background:var(--c-surface);display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-size:18px;letter-spacing:-0.03em">412</span><span style="font-size:10px;color:var(--c-ink4)">citas</span></div></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:9px;font-size:12.5px">
              <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#25D366"></span><span style="flex:1">WhatsApp</span><b style="font-weight:600">64%</b></div>
              <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#DD2A7B"></span><span style="flex:1">Instagram</span><b style="font-weight:600">28%</b></div>
              <div style="display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:50%;background:#0866FF"></span><span style="flex:1">Messenger</span><b style="font-weight:600">8%</b></div>
            </div>
          </div>
        </div>
        <div style="border:1px solid var(--c-line);border-radius:14px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="width:22px;height:22px;border-radius:7px;background:var(--c-ai);display:flex;align-items:center;justify-content:center"><img src="assets/icons/sparkles.svg" alt="" style="width:12px;height:12px;filter:invert(1)" /></span><span style="font-weight:600;font-size:13.5px">Rendimiento del agente</span></div>
          <div style="height:10px;border-radius:5px;overflow:hidden;display:flex"><span style="width:89%;background:var(--c-ai)"></span><span style="flex:1;background:#E6B34D"></span></div>
          <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--c-ink4);margin-top:7px"><span>Resueltas por IA · 89%</span><span>Escaladas · 11%</span></div>
        </div>
        <div style="border:1px solid var(--c-line);border-radius:14px;padding:16px">
          <div style="font-weight:600;font-size:13.5px;margin-bottom:10px">Motivos de escalamiento</div>
          ${v.reasons.map((r) => html`<div style="display:flex;align-items:center;gap:10px;padding:5px 0;font-size:12px"><span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.t}</span><div style="width:34%;height:6px;border-radius:3px;background:var(--c-sunken)"><div style=${r.bar}></div></div><span style="width:22px;text-align:right;font-variant-numeric:tabular-nums;color:var(--c-ink3)">${r.n}</span></div>`)}
        </div>
      </div>
    </div>
    <div data-reveal="1" style="flex:1 1 320px;min-width:0;padding:0 4px">
      <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.2vw,52px);line-height:1.02;letter-spacing:-0.015em;margin:0 0 16px;text-wrap:balance">Entiende lo que pasa en tu operación.</h2>
      <p style="margin:0 0 22px;font-size:17px;color:var(--au-ink-3);line-height:1.6;text-wrap:pretty">Consulta el volumen de citas, de qué canal llegan, cuánto resuelve el agente y por qué escala. Información para decidir horarios, personal y atención.</p>
      <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:15px;color:var(--au-ink-2)">
        <li style="display:flex;gap:10px"><span style="color:#5B37F0;font-weight:700">✓</span>Citas por periodo, servicio y profesional</li>
        <li style="display:flex;gap:10px"><span style="color:#5B37F0;font-weight:700">✓</span>Actividad por canal de origen</li>
        <li style="display:flex;gap:10px"><span style="color:#5B37F0;font-weight:700">✓</span>Conversaciones resueltas y escaladas</li>
      </ul>
    </div>
  </div>
</section>

<section id="soluciones" data-screen-label="Soluciones" style="padding:clamp(56px,7vw,88px) clamp(16px,4vw,40px);scroll-margin-top:90px">
  <div style="max-width:1180px;margin:0 auto">
    <div data-reveal="1" style="max-width:820px;margin:0 0 44px">
      <h2 style=${`font-family:${v.dFont};font-weight:700;font-size:clamp(36px,5.4vw,72px);line-height:.94;letter-spacing:-0.01em;text-transform:uppercase;margin:0 0 16px;text-wrap:balance`}>Se adapta a cómo trabaja <span style="color:#5B37F0">tu negocio.</span></h2>
      <p style="margin:0;font-size:17px;color:var(--au-ink-3);line-height:1.6">Elige un giro y mira cómo queda KUPO configurado para él.</p>
    </div>
    <div data-reveal="1" style="display:flex;flex-wrap:wrap;gap:clamp(18px,3vw,32px);align-items:flex-start">
      <div role="tablist" aria-label="Giros de negocio" style=${v.indList}>
        ${v.industries.map((n) => html`
          <button role="tab" aria-selected=${n.on} onClick=${n.pick} onMouseEnter=${n.pick} onFocus=${n.pick} style=${n.btn}>
            <span style=${n.icoBox}><span style=${n.icoImg}></span></span>
            <span style="display:flex;flex-direction:column;gap:3px;min-width:0"><span style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:17px;line-height:1.2">${n.name}</span>${n.showPain ? html`<span style="font-size:13px;color:var(--au-ink-3);line-height:1.4">${n.pain}</span>` : null}</span>
          </button>
        `)}
      </div>
      <div style="flex:3 1 560px;min-width:0">
        ${v.industries.map((d) => html`
          <div role="tabpanel" aria-label=${d.name} style=${d.panel}>
            <div class="au-grain" style="border-radius:28px;padding:clamp(8px,1.6vw,18px);background:radial-gradient(70% 90% at 14% 10%, #9A7BFF 0%, transparent 58%), radial-gradient(80% 90% at 92% 90%, #4B2BC9 0%, transparent 58%), #6E44FF;box-shadow:0 34px 90px rgba(75,43,201,.28)">
              <div style="border-radius:18px;overflow:hidden;background:var(--c-surface);color:var(--c-ink);font-size:13px">
                <div style="height:48px;display:flex;align-items:center;gap:10px;padding:0 14px;background:var(--c-bg);border-bottom:1px solid var(--c-line)">
                  <img src="assets/kupo-mark.png" alt="" style="width:20px;height:20px;object-fit:contain" />
                  <span style="flex:1;min-width:0;font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.biz} <span style="font-weight:400;color:var(--c-ink4)">· ${d.type}</span></span>
                  <span style="display:flex;align-items:center;gap:7px;height:26px;padding:0 10px;border-radius:100px;background:var(--s-conf-bg);color:var(--s-conf);font-size:11.5px;font-weight:600;white-space:nowrap"><span style="width:6px;height:6px;border-radius:50%;background:#5fa86a;animation:cupo-pulse 2s infinite"></span>Agente activo</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:14px 14px 0">
                  ${d.kpis.map((k) => html`<div style="padding:12px 14px;border-radius:14px;background:#F7F5FF"><div style="font-size:11.5px;color:var(--c-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k.l}</div><div style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:26px;line-height:1.15;color:#1B1240">${k.v}</div></div>`)}
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:14px;padding:14px">
                  <div style="flex:1.3 1 280px;min-width:0;border:1px solid var(--c-line);border-radius:16px;overflow:hidden">
                    <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--c-line)"><span style="font-weight:600;font-size:14px;flex:1">${d.agendaTitle}</span><span style="font-size:11.5px;color:var(--c-ink4);white-space:nowrap">${d.res}</span></div>
                    ${d.agenda.map((a) => html`
                      <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid var(--c-line)">
                        <span style="width:40px;flex-shrink:0;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--c-ink3)">${a.t}</span>
                        <div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.svc}</span>${a.ai ? html`<span title="Agendado por IA" style="display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border-radius:4px;background:var(--c-ai);flex-shrink:0"><img src="assets/icons/sparkles.svg" alt="Agendado por IA" style="width:9px;height:9px;filter:invert(1)" /></span>` : null}</div><div style="font-size:11.5px;color:var(--c-ink4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.cl}</div></div>
                        <span style=${a.bBox}><span style=${a.bDot}></span>${a.bLabel}</span>
                      </div>
                    `)}
                  </div>
                  <div style="flex:1 1 230px;min-width:0;display:flex;flex-direction:column;gap:12px">
                    <div style="border-radius:16px;background:var(--c-bg);border:1px solid var(--c-line);padding:12px;display:flex;flex-direction:column;gap:8px">
                      <div style="display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--c-ink4)"><span style=${d.chBox}><span style=${d.chImg}></span></span>${d.chName} · ${d.time}</div>
                      <div style="align-self:flex-start;max-width:92%;padding:9px 12px;border-radius:14px 14px 14px 5px;background:var(--c-surface);border:1px solid var(--c-line);font-size:12.5px;line-height:1.5">${d.q}</div>
                      <div style="align-self:flex-end;max-width:92%;padding:9px 12px;border-radius:14px 14px 5px 14px;background:var(--c-brand-soft);border:1px solid var(--c-brand-line);font-size:12.5px;line-height:1.5">${d.a}</div>
                      <span style="align-self:flex-end;display:flex;align-items:center;gap:4px;font-size:10.5px;color:var(--c-ink4)"><img src="assets/kupo-mark.png" alt="" style="width:11px;height:11px;object-fit:contain" />Agente KUPO</span>
                    </div>
                    <div style="border-radius:16px;border:1px solid var(--c-line);padding:12px 14px">
                      <div style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:10.5px;letter-spacing:.06em;color:var(--c-ink4);margin-bottom:9px">CONFIGURADO PARA ${d.short}</div>
                      <div style="display:flex;flex-wrap:wrap;gap:6px">${d.svcs.map((s) => html`<span style="padding:4px 11px;border-radius:100px;background:#EEE9FF;color:#4B2BC9;font-size:12px;font-weight:600">${s}</span>`)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)}
      </div>
    </div>
  </div>
</section>

<section id="como" data-screen-label="Cómo funciona" style="padding:clamp(56px,7vw,88px) clamp(16px,4vw,40px);background:#F7F5FF;border-top:1px solid var(--au-line-06);scroll-margin-top:90px">
  <div style="max-width:1140px;margin:0 auto">
    <div data-reveal="1" style="text-align:center;max-width:660px;margin:0 auto 56px">
      <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(34px,4.6vw,58px);line-height:1.02;letter-spacing:-0.015em;margin:0;text-wrap:balance">Tres pasos para empezar.</h2>
    </div>
    <ol data-reveal="1" style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:22px">
      <li style="background:#fff;border:1px solid var(--au-line-08);border-radius:20px;padding:34px 30px;display:flex;flex-direction:column;gap:16px">
        <span style="width:52px;height:52px;border-radius:16px;background:#5B37F0;display:flex;align-items:center;justify-content:center"><img src="assets/icons/plug-zap.svg" alt="" style="width:24px;height:24px;filter:invert(1)" /></span>
        <h3 style="margin:0;font-weight:600;font-size:21px;letter-spacing:-0.02em">Conecta tus canales</h3>
        <p style="margin:0;font-size:15px;color:var(--au-ink-3);line-height:1.6">Vincula los canales compatibles que ya usa tu negocio, como WhatsApp e Instagram.</p>
        <div style="display:flex;gap:6px;margin-top:auto;padding-top:6px"><span style="width:26px;height:26px;border-radius:8px;background:#25D366;display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/whatsapp.svg" alt="WhatsApp" style="width:15px;height:15px" /></span><span style="width:26px;height:26px;border-radius:8px;background:linear-gradient(45deg,#F58529,#DD2A7B 50%,#8134AF);display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/instagram.svg" alt="Instagram" style="width:15px;height:15px" /></span><span style="width:26px;height:26px;border-radius:8px;background:linear-gradient(45deg,#0866FF,#A033FF);display:inline-flex;align-items:center;justify-content:center"><img src="assets/icons/messenger.svg" alt="Messenger" style="width:15px;height:15px" /></span></div>
      </li>
      <li style="background:#fff;border:1px solid var(--au-line-08);border-radius:20px;padding:34px 30px;display:flex;flex-direction:column;gap:16px">
        <span style="width:52px;height:52px;border-radius:16px;background:#5B37F0;display:flex;align-items:center;justify-content:center"><img src="assets/icons/sliders-horizontal.svg" alt="" style="width:24px;height:24px;filter:invert(1)" /></span>
        <h3 style="margin:0;font-weight:600;font-size:21px;letter-spacing:-0.02em">Configura tu operación</h3>
        <p style="margin:0;font-size:15px;color:var(--au-ink-3);line-height:1.6">Define servicios, horarios, profesionales y cómo debe responder el agente.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px"><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Servicios</span><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Horarios</span><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Profesionales</span></div>
      </li>
      <li style="background:#fff;border:1px solid var(--au-line-08);border-radius:20px;padding:34px 30px;display:flex;flex-direction:column;gap:16px">
        <span style="width:52px;height:52px;border-radius:16px;background:#5B37F0;display:flex;align-items:center;justify-content:center"><img src="assets/icons/calendar-check.svg" alt="" style="width:24px;height:24px;filter:invert(1)" /></span>
        <h3 style="margin:0;font-weight:600;font-size:21px;letter-spacing:-0.02em">Gestiona conversaciones y reservas</h3>
        <p style="margin:0;font-size:15px;color:var(--au-ink-3);line-height:1.6">Atiende desde la bandeja, revisa tu agenda y consulta tus reportes en un mismo lugar.</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:6px"><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Bandeja</span><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Calendario</span><span style="padding:4px 11px;border-radius:100px;border:1px solid var(--au-line-10);font-size:12px;color:var(--au-ink-2)">Reportes</span></div>
      </li>
    </ol>
  </div>
</section>

<section id="faq" data-screen-label="Preguntas" style="padding:clamp(56px,7vw,88px) clamp(16px,4vw,40px);border-top:1px solid var(--au-line-06);scroll-margin-top:90px">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:clamp(32px,5vw,72px);align-items:start">
    <div data-reveal="1">
      <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(52px,7.6vw,108px);line-height:.94;letter-spacing:-0.02em;margin:0 0 22px">Preguntas frecuentes</h2>
      <p style="margin:0 0 26px;font-size:17px;color:var(--au-ink-3);line-height:1.6;max-width:420px">¿Tienes otra duda? Te la resolvemos en la demo.</p>
      <a href="#demo" onClick=${v.openDemo} style="display:inline-flex;align-items:center;gap:8px;padding:14px 26px;border-radius:100px;background:#5B37F0;color:#fff;font-weight:600;font-size:15px;transition:transform .25s var(--ease-standard),background .25s ease" style-hover="transform:translateY(-1px);background:#4B2BC9;color:#fff" style-active="transform:none">Solicitar demo<span aria-hidden="true">→</span></a>
    </div>
    <div data-reveal="1" style="display:flex;flex-direction:column;gap:10px">
      ${v.faqs.map((f) => html`
        <div style=${f.box}>
          <button onClick=${f.pick} aria-expanded=${f.on} style="width:100%;display:flex;align-items:center;gap:16px;padding:20px 22px;border:none;background:transparent;font-family:inherit;text-align:left;cursor:pointer;color:var(--au-ink)"><span style="flex:1;font-weight:600;font-size:17px;line-height:1.35">${f.q}</span><span style=${f.plus}></span></button>
          ${f.on ? html`<p style="margin:0;padding:0 22px 22px;font-size:15px;line-height:1.6;color:var(--au-ink-3);animation:kupo-in .25s ease both">${f.a}</p>` : null}
        </div>
      `)}
    </div>
  </div>
</section>

<section id="demo" data-screen-label="CTA final" style="padding:clamp(56px,8vw,96px) clamp(12px,4vw,40px);scroll-margin-top:80px">
  <div data-reveal="1" class="au-grain" style="max-width:1180px;margin:0 auto;border-radius:28px;background:radial-gradient(85% 90% at 18% 12%, #9A7BFF 0%, transparent 58%), radial-gradient(90% 100% at 88% 95%, #4B2BC9 0%, transparent 58%), linear-gradient(150deg,#6E44FF 0%,#2A1680 100%);box-shadow:0 40px 110px rgba(75,43,201,.35);padding:clamp(48px,8vw,104px) clamp(22px,6vw,80px);display:flex;flex-direction:column;align-items:center;text-align:center;color:#fff">
    <span aria-hidden="true" style="width:76px;height:76px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:26px;box-shadow:0 16px 40px rgba(30,10,90,.3)"><span style="position:relative;display:block;width:58%;container-type:inline-size;animation:kupo-pop .9s var(--ease-pop) .15s both"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s 1.6s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span>
    <h2 style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(36px,5.4vw,68px);line-height:1.02;letter-spacing:-0.015em;margin:0 0 20px;max-width:860px;text-wrap:balance">Tu próxima reserva empieza con una conversación.</h2>
    <p style="margin:0 0 36px;font-size:clamp(16px,1.6vw,18px);line-height:1.6;color:rgba(255,255,255,.88);max-width:560px;text-wrap:pretty">Descubre cómo KUPO puede ayudarte a organizar la atención de tus clientes y simplificar la gestión de reservas.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <a href="#demo" onClick=${v.openDemo} style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:15px 32px;border-radius:100px;background:#fff;color:#4B2BC9;font-weight:600;font-size:15px;line-height:1.6;white-space:nowrap;box-shadow:var(--shadow-btn);transition:transform .25s var(--ease-standard),box-shadow .25s ease" style-hover="transform:translateY(-1px);box-shadow:0 16px 40px rgba(30,10,90,.35);color:#4B2BC9" style-active="transform:none;background:#F1F1EF">Solicitar demo<span aria-hidden="true" style="font-size:16px">→</span></a>
      <a href="#producto" style="display:inline-flex;align-items:center;justify-content:center;padding:15px 30px;border-radius:100px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.4);color:#fff;font-weight:600;font-size:15px;line-height:1.6;white-space:nowrap;transition:background .25s ease,transform .25s var(--ease-standard)" style-hover="background:rgba(255,255,255,.24);transform:translateY(-1px);color:#fff" style-active="transform:none;background:rgba(255,255,255,.3)">Conocer la plataforma</a>
    </div>
  </div>
</section>
</main>

<footer style="background:#140C33;color:#fff;padding:clamp(48px,6vw,72px) clamp(20px,4vw,40px) 32px">
  <div style="max-width:1140px;margin:0 auto;display:flex;flex-direction:column;gap:48px">
    <div style="display:flex;flex-wrap:wrap;gap:40px;justify-content:space-between">
      <div style="max-width:340px;display:flex;flex-direction:column;gap:14px">
        <a href="#inicio" aria-label="KUPO, ir al inicio" style="display:flex;align-items:center;gap:4px;color:#fff"><img src="assets/kupo-word.png" alt="KUPO" style="height:26px;width:auto;filter:invert(1)" /><img src="assets/kupo-mark.png" alt="" style="height:25px;width:auto" /></a>
        <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,.6)">Bandeja multicanal, agente de IA y calendario de reservas en una sola plataforma.</p>
      </div>
      <div style="display:flex;gap:clamp(40px,7vw,96px);flex-wrap:wrap">
        <nav aria-label="Producto" style="display:flex;flex-direction:column;gap:10px">
          <span style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:11px;letter-spacing:.06em;color:rgba(255,255,255,.4);margin-bottom:4px">PRODUCTO</span>
          <a href="#bandeja" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Bandeja</a>
          <a href="#reservas" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Reservas</a>
          <a href="#calendario" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Calendario</a>
          <a href="#reportes" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Reportes</a>
        </nav>
        <nav aria-label="Ecosistema Fluid" style="display:flex;flex-direction:column;gap:10px">
          <span style="font-family:'Fredoka',var(--font-sans);font-weight:500;font-size:11px;letter-spacing:.06em;color:rgba(255,255,255,.4);margin-bottom:4px">ECOSISTEMA FLUID</span>
          <a href="https://www.auris.business/" target="_blank" rel="noopener" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Auris · agentes de voz ↗</a>
          <a href="#soluciones" style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Soluciones</a>
          <a href="#demo" onClick=${v.openDemo} style="font-size:14px;color:rgba(255,255,255,.75)" style-hover="color:#fff">Solicitar demo</a>
        </nav>
      </div>
    </div>
    <div aria-hidden="true" style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:clamp(96px,25vw,360px);line-height:.78;letter-spacing:-0.03em;color:#2A1D63;user-select:none;margin-top:-8px">kupo</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);font-size:12px;color:rgba(255,255,255,.4)">
      <span>© 2026 Fluid. KUPO es un producto de Fluid.</span>
      <span>Las conversaciones, citas y métricas mostradas son datos de ejemplo.</span>
    </div>
  </div>
</footer>
${v.demoOpen ? html`
  <div role="dialog" aria-modal="true" aria-label="Solicitar demo" onClick=${v.backdrop} style="position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,12,51,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:kupo-fade .25s ease both">
    <div style="width:100%;max-width:400px;max-height:calc(100vh - 32px);overflow-y:auto;border-radius:32px;background:#fff;box-shadow:0 40px 120px rgba(20,12,51,.45);animation:kupo-in .35s var(--ease-pop) both;display:flex;flex-direction:column;font-family:var(--font-sans);color:var(--au-ink)">
      <div class="au-grain" style="background:radial-gradient(90% 120% at 100% 0%, #9A7BFF 0%, transparent 60%), #6E44FF;color:#fff;padding:16px 16px 20px;border-radius:32px 32px 0 0;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:10px">
          ${v.dCanBack ? html`<button onClick=${v.dBack} aria-label="Volver" style="width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer" style-hover="background:rgba(255,255,255,.28)"><img src="assets/icons/arrow-left.svg" alt="" style="width:18px;height:18px;filter:invert(1)" /></button>` : null}
          ${v.dNoBack ? html`<span style="width:38px;height:38px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center"><img src="assets/kupo-mark.png" alt="" style="width:22px;height:auto" /></span>` : null}
          <div style="flex:1;min-width:0"><div style="font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:19px;line-height:1.1">Solicitar demo</div><div style="font-size:12px;opacity:.85;margin-top:2px">Toma menos de un minuto</div></div>
          <button onClick=${v.closeDemo} aria-label="Cerrar" style="width:38px;height:38px;border-radius:50%;border:none;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;cursor:pointer" style-hover="background:rgba(255,255,255,.28)"><img src="assets/icons/x.svg" alt="" style="width:18px;height:18px;filter:invert(1)" /></button>
        </div>
        <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.25);margin-top:16px;overflow:hidden"><div style=${v.dBar}></div></div>
      </div>
      <div style="padding:24px 20px 22px;display:flex;flex-direction:column;gap:16px">
        ${v.d0 ? html`
          <div style="display:flex;flex-direction:column;gap:16px;animation:kupo-in .3s ease both">
            <div><h3 style="margin:0;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:27px;line-height:1.05">¿Qué tipo de negocio tienes?</h3><p style="margin:6px 0 0;font-size:14px;color:var(--au-ink-3)">Así preparamos una demo con ejemplos de tu giro.</p></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              ${v.dBiz.map((o) => html`<button onClick=${o.pick} style=${o.style} style-hover="border-color:#6E44FF"><span style=${o.ico}></span><span style="font-size:13.5px;font-weight:600;line-height:1.25">${o.label}</span></button>`)}
            </div>
          </div>
        ` : null}
        ${v.d1 ? html`
          <div style="display:flex;flex-direction:column;gap:16px;animation:kupo-in .3s ease both">
            <div><h3 style="margin:0;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:27px;line-height:1.05">¿Por dónde te escriben tus clientes?</h3><p style="margin:6px 0 0;font-size:14px;color:var(--au-ink-3)">Elige todos los que uses.</p></div>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${v.dCh.map((o) => html`<button onClick=${o.pick} aria-pressed=${o.on} style=${o.style}><span style=${o.ico}></span><span style="flex:1;text-align:left;font-size:15px;font-weight:600">${o.label}</span><span style=${o.check}>${o.mark}</span></button>`)}
            </div>
            <button onClick=${v.dNext} disabled=${v.dNoCh} style=${v.dNextStyle}>Continuar</button>
          </div>
        ` : null}
        ${v.d2 ? html`
          <div style="display:flex;flex-direction:column;gap:14px;animation:kupo-in .3s ease both">
            <div><h3 style="margin:0;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:27px;line-height:1.05">¿Cómo te contactamos?</h3><p style="margin:6px 0 0;font-size:14px;color:var(--au-ink-3)">Te escribimos para agendar la demo.</p></div>
            <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:var(--au-ink-2)">Tu nombre<input type="text" value=${v.fName} onInput=${v.setName} placeholder="Ej. Sofía Garza" style="width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid #E4DEFF;background:#F7F5FF;font-family:inherit;font-size:15px;color:var(--au-ink);outline:none;transition:border-color .2s ease,background .2s ease" style-focus="border-color:#6E44FF;background:#fff" /></label>
            <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:var(--au-ink-2)">Nombre del negocio<input type="text" value=${v.fBiz} onInput=${v.setBizName} placeholder="Ej. Estudio Alba" style="width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid #E4DEFF;background:#F7F5FF;font-family:inherit;font-size:15px;color:var(--au-ink);outline:none;transition:border-color .2s ease,background .2s ease" style-focus="border-color:#6E44FF;background:#fff" /></label>
            <label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:var(--au-ink-2)">WhatsApp o correo<input type="text" value=${v.fContact} onInput=${v.setContact} placeholder="Ej. +52 81 1234 5678" style="width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid #E4DEFF;background:#F7F5FF;font-family:inherit;font-size:15px;color:var(--au-ink);outline:none;transition:border-color .2s ease,background .2s ease" style-focus="border-color:#6E44FF;background:#fff" /></label>
            <div aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);opacity:0"><label>Sitio web<input type="text" name="website" tabindex="-1" autocomplete="off" value=${v.fTrap} onInput=${v.setTrap} /></label></div>
            ${v.derr ? html`<p role="alert" style="margin:0;font-size:13px;color:#B23A2E">Escribe tu nombre y un medio de contacto.</p>` : null}
            ${v.dFail ? html`<p role="alert" style="margin:0;font-size:13px;color:#B23A2E">No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo.</p>` : null}
            <button onClick=${v.dSubmit} disabled=${v.dSending} style=${`width:100%;padding:15px;border-radius:100px;border:none;background:#5B37F0;color:#fff;font-family:inherit;font-weight:600;font-size:15px;cursor:${v.dSending ? 'default' : 'pointer'};opacity:${v.dSending ? 0.6 : 1};transition:background .2s ease,transform .2s ease,opacity .2s ease`} style-hover="background:#4B2BC9" style-active="transform:scale(.98)">${v.dSending ? 'Enviando…' : 'Solicitar demo'}</button>
          </div>
        ` : null}
        ${v.d3 ? html`
          <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:14px;padding:6px 0 4px;animation:kupo-in .3s ease both">
            <span style="width:120px;height:120px;border-radius:50%;background:#fff;box-shadow:0 18px 44px rgba(75,43,201,.22),0 0 0 10px #F1EDFF;display:flex;align-items:center;justify-content:center;margin-bottom:8px"><span style="position:relative;display:block;width:56%;container-type:inline-size;animation:kupo-pop .9s var(--ease-pop) .15s both"><img src="assets/kupo-mark.png" alt="" style="width:100%;height:auto;display:block" /><span aria-hidden="true" style="position:absolute;inset:0;animation:kupo-open 4.8s 1.6s infinite"><span style="position:absolute;left:56.5%;top:38%;width:24%;height:11.5%;border-radius:40%;background:#fff"></span><span style="position:absolute;left:61.9%;top:39.6%;width:13.3%;height:10.8%;border-radius:50%;background:rgb(86,51,240)"></span></span></span></span>
            <h3 style="margin:0;font-family:'Fredoka',var(--font-sans);font-weight:600;font-size:30px;line-height:1.05">¡Gracias, ${v.dFirst}!</h3>
            <p style="margin:0;font-size:15px;line-height:1.55;color:var(--au-ink-3);max-width:300px">Recibimos tu solicitud. Nuestro equipo te contactará para agendar tu demo de KUPO.</p>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${v.dSummary.map((t) => html`<span style="padding:5px 12px;border-radius:100px;background:#F1EDFF;color:#4B2BC9;font-size:12.5px;font-weight:600">${t}</span>`)}</div>
            ${v.hasDemoUrl ? html`<a href=${v.demoHref} target="_blank" rel="noopener" style="width:100%;padding:15px;border-radius:100px;border:none;background:#5B37F0;color:#fff;font-family:inherit;font-weight:600;font-size:15px;cursor:pointer;transition:background .2s ease,transform .2s ease;display:block;text-align:center;margin-top:6px" style-hover="background:#4B2BC9;color:#fff">Elegir horario ahora</a>` : null}
            <button onClick=${v.closeDemo} style="width:100%;padding:14px;border-radius:100px;border:1.5px solid #E4DEFF;background:#fff;color:var(--au-ink);font-family:inherit;font-weight:600;font-size:15px;cursor:pointer" style-hover="background:#F7F5FF">Cerrar</button>
          </div>
        ` : null}
      </div>
    </div>
  </div>
` : null}

</div>
`;
  }
}

// sheetsUrl: Google Apps Script web app URL that stores demo requests (see README).
Kupo.defaultProps = { headline: 'B', animateHero: true, displayFont: 'Unbounded', demoUrl: '', sheetsUrl: 'https://script.google.com/macros/s/AKfycbyODJ-zo7_A3ncEn44zfwMyDIL7Bseg-pqoe_Iwe2-3KNFV_rU98keoz8C2X4M6lxRrgw/exec' };

render(html`<${Kupo} />`, document.getElementById('app'));
