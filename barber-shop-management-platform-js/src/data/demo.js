import { addDays, addMinutes, fromISO, todayISO, toISO } from "@/lib/utils";
const PALETTE = [
  { name: "Lima elétrica", primary: "#C9F158", secondary: "#1B2A17" },
  { name: "Ouro escovado", primary: "#DFC07C", secondary: "#2A2118" },
  { name: "Azul cobalto", primary: "#9DBBFF", secondary: "#1B2440" },
  { name: "Coral", primary: "#FFAD95", secondary: "#331D16" },
  { name: "Menta", primary: "#9FE3C4", secondary: "#14291F" },
  { name: "Lilás", primary: "#C9B6F6", secondary: "#221B33" }
];
const DEFAULT_HOURS = {
  0: { open: "09:00", close: "14:00", closed: false },
  1: { open: "09:00", close: "20:00", closed: false },
  2: { open: "09:00", close: "20:00", closed: false },
  3: { open: "09:00", close: "20:00", closed: false },
  4: { open: "09:00", close: "20:00", closed: false },
  5: { open: "09:00", close: "21:00", closed: false },
  6: { open: "08:00", close: "19:00", closed: false }
};
const AVATARS = {
  owner: "https://images.pexels.com/photos/5188606/pexels-photo-5188606.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=480",
  diego: "https://images.pexels.com/photos/18483772/pexels-photo-18483772.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=480",
  caio: "https://images.pexels.com/photos/8552627/pexels-photo-8552627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=480"
};
const COVER = "https://images.pexels.com/photos/2174113/pexels-photo-2174113.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1200";
const seedRandom = (seed) => {
  let a = seed;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const FIRST = [
  "Gabriel",
  "Lucas",
  "Matheus",
  "Rafael",
  "Bruno",
  "Thiago",
  "Felipe",
  "Rodrigo",
  "Diego",
  "André",
  "Vinícius",
  "Leonardo",
  "Gustavo",
  "Henrique",
  "Marcelo",
  "Pedro",
  "João",
  "Caio",
  "Eduardo",
  "Fábio",
  "Murilo",
  "Otávio",
  "Renan",
  "Samuel",
  "Danilo",
  "Igor",
  "Kauã",
  "Leandro",
  "Miguel",
  "Nicolas",
  "Arthur",
  "Benício",
  "César",
  "Davi",
  "Enzo",
  "Fernando",
  "Guilherme",
  "Heitor",
  "Ivan",
  "Júlio",
  "Lorenzo",
  "Manuel",
  "Noah",
  "Osvaldo",
  "Paulo",
  "Ricardo",
  "Sérgio",
  "Tomás",
  "Vitor",
  "Yuri"
];
const LAST = [
  "Almeida",
  "Andrade",
  "Barbosa",
  "Barros",
  "Batista",
  "Bezerra",
  "Cardoso",
  "Carvalho",
  "Castro",
  "Costa",
  "Cunha",
  "Dias",
  "Duarte",
  "Farias",
  "Fernandes",
  "Ferreira",
  "Fonseca",
  "Freitas",
  "Gomes",
  "Gonçalves",
  "Lima",
  "Lopes",
  "Machado",
  "Marques",
  "Martins",
  "Melo",
  "Mendes",
  "Monteiro",
  "Moraes",
  "Moreira",
  "Nascimento",
  "Neves",
  "Nogueira",
  "Oliveira",
  "Pacheco",
  "Pereira",
  "Pinto",
  "Ramos",
  "Reis",
  "Ribeiro",
  "Rocha",
  "Rodrigues",
  "Sales",
  "Santana",
  "Santos",
  "Silva",
  "Siqueira",
  "Souza",
  "Teixeira",
  "Vieira"
];
const PREFS = [
  "Gosta de degradê baixo e finalização com pomada matte.",
  "Prefere atendimento silencioso, sem conversa durante o corte.",
  "Sempre pede toalha quente na barba.",
  "Alergia a produtos com álcool — usar linha sensível.",
  "Prefere manter o comprimento no topo, só alinhar.",
  "Gosta de café expresso ao chegar.",
  "Costuma trazer o filho para corte infantil.",
  "Cabelo crespo — especialista em curvatura.",
  "Prefere navalha apenas na finalização.",
  "Agenda sempre no fim do dia, após o trabalho."
];
const NOTES = [
  "Cliente pontual. Indicação de programa de fidelidade.",
  "Pagamento sempre via Pix.",
  "Pediu para avisar sobre novas coleções de produtos.",
  "Tem interesse em pacote mensal de barba.",
  "Excelente relacionamento, cliente desde a inauguração.",
  "",
  ""
];
const PAYMENTS = ["pix", "credit", "pix", "debit", "cash", "credit", "pix", "transfer"];
const phone = (rng) => `(11) 9${Math.floor(rng() * 9e3 + 1e3)}-${Math.floor(rng() * 9e3 + 1e3)}`;
const COMPANY_CONFIGS = [
  {
    id: "co_aurum",
    name: "Aurum Barber Club",
    slogan: "Tradição em cada detalhe. Precisão em cada corte.",
    owner: "Rafael Menezes",
    phone: "(11) 3061-8842",
    email: "contato@aurumbarber.com.br",
    address: "Rua Harmonia, 245 — Vila Madalena",
    city: "São Paulo",
    state: "SP",
    initials: "AU",
    plan: "Future",
    colors: { primary: "#C9F158", secondary: "#1B2A17" },
    theme: "noir",
    seed: 41,
    clientCount: 68,
    cover: COVER,
    pros: [
      {
        name: "Rafael Menezes",
        role: "Master Barber · Fundador",
        phone: "(11) 99812-4400",
        email: "rafael@aurumbarber.com.br",
        avatar: AVATARS.owner,
        color: "#C9F158",
        commission: 45,
        active: true,
        specialties: ["Degradê", "Barba clássica", "Consultoria de estilo"],
        rating: 4.9,
        goal: 14e3
      },
      {
        name: "Diego Farias",
        role: "Barbeiro sênior",
        phone: "(11) 99677-2112",
        email: "diego@aurumbarber.com.br",
        avatar: AVATARS.diego,
        color: "#9DBBFF",
        commission: 40,
        active: true,
        specialties: ["Detalhes na navalha", "Platinado"],
        rating: 4.8,
        goal: 11e3
      },
      {
        name: "Caio Vidal",
        role: "Barbeiro · Especialista em barba",
        phone: "(11) 99345-7890",
        email: "caio@aurumbarber.com.br",
        avatar: AVATARS.caio,
        color: "#E6B980",
        commission: 40,
        active: true,
        specialties: ["Toalha quente", "Pigmentação", "Barba longa"],
        rating: 4.9,
        goal: 1e4
      },
      {
        name: "Lucas Prado",
        role: "Barbeiro júnior",
        phone: "(11) 99120-3345",
        email: "lucas@aurumbarber.com.br",
        color: "#D6A6E8",
        commission: 35,
        active: true,
        specialties: ["Corte infantojuvenil", "Social"],
        rating: 4.7,
        goal: 7e3
      }
    ],
    services: [
      { name: "Corte Signature", description: "Consulta de estilo, corte personalizado e finalização.", category: "Cabelo", duration: 45, price: 75, cost: 8 },
      { name: "Corte + Barba", description: "O clássico da casa: corte completo e barba desenhada.", category: "Combos", duration: 75, price: 120, cost: 14 },
      { name: "Barba Premium", description: "Ritual de toalha quente, óleos e navalha.", category: "Barba", duration: 30, price: 55, cost: 9 },
      { name: "Degradê Navalhado", description: "Fade preciso com acabamento na navalha.", category: "Cabelo", duration: 45, price: 85, cost: 8 },
      { name: "Platinado / Descoloração", description: "Descoloração global com matização e tratamento.", category: "Coloração", duration: 120, price: 220, cost: 62 },
      { name: "Hidratação Capilar", description: "Reconstrução com massagem e aromaterapia.", category: "Tratamentos", duration: 30, price: 60, cost: 18 },
      { name: "Sobrancelha na Navalha", description: "Design discreto e correção de contornos.", category: "Detalhes", duration: 15, price: 25, cost: 3 },
      { name: "Pigmentação de Barba", description: "Preenchimento natural de falhas.", category: "Barba", duration: 30, price: 45, cost: 12 },
      { name: "Corte Infantil", description: "Corte para crianças até 12 anos, com paciência de sobra.", category: "Cabelo", duration: 30, price: 60, cost: 6 },
      { name: "Combo VIP", description: "Corte, barba, sobrancelha e hidratação. Uma experiência completa.", category: "Combos", duration: 105, price: 185, cost: 24 }
    ]
  },
  {
    id: "co_navalha",
    name: "Navalha & Bronze",
    slogan: "Onde o clássico encontra o contemporâneo.",
    owner: "Camila Duarte",
    phone: "(21) 3512-9080",
    email: "ola@navalhaebronze.com.br",
    address: "Rua Garcia d'Ávila, 88 — Ipanema",
    city: "Rio de Janeiro",
    state: "RJ",
    initials: "NB",
    plan: "Pro",
    colors: { primary: "#DFC07C", secondary: "#2A2118" },
    theme: "classic",
    seed: 87,
    clientCount: 44,
    pros: [
      { name: "Camila Duarte", role: "Barbeira · Fundadora", phone: "(21) 99812-4400", email: "camila@navalhaebronze.com.br", color: "#DFC07C", commission: 50, active: true, specialties: ["Barba", "Corte clássico"], rating: 5, goal: 9e3 },
      { name: "Marcelo Paiva", role: "Barbeiro sênior", phone: "(21) 99677-2112", email: "marcelo@navalhaebronze.com.br", color: "#9DBBFF", commission: 40, active: true, specialties: ["Navalha", "Pompadour"], rating: 4.8, goal: 8e3 },
      { name: "Igor Salles", role: "Barbeiro", phone: "(21) 99345-7890", email: "igor@navalhaebronze.com.br", color: "#E6B980", commission: 35, active: true, specialties: ["Fade", "Design"], rating: 4.7, goal: 7e3 }
    ],
    services: [
      { name: "Corte Bronze", description: "Corte autoral com acabamento em navalha.", category: "Cabelo", duration: 50, price: 90, cost: 9 },
      { name: "Barba Terapia", description: "Ritual completo com toalha quente e óleo de argão.", category: "Barba", duration: 40, price: 70, cost: 12 },
      { name: "Combo Carioca", description: "Corte e barba com dose de café especial.", category: "Combos", duration: 80, price: 140, cost: 16 },
      { name: "Navalhado Premium", description: "Barba tradicional na navalha com navalha de ouro.", category: "Barba", duration: 35, price: 80, cost: 11 },
      { name: "Corte Social", description: "Clássico alinhado para o dia a dia corporativo.", category: "Cabelo", duration: 40, price: 70, cost: 7 },
      { name: "Hidratação", description: "Tratamento capilar relaxante.", category: "Tratamentos", duration: 25, price: 50, cost: 14 },
      { name: "Sobrancelha", description: "Acabamento discreto na navalha.", category: "Detalhes", duration: 15, price: 30, cost: 3 },
      { name: "Combo Pai & Filho", description: "Dois cortes, duas gerações.", category: "Combos", duration: 80, price: 150, cost: 15 }
    ]
  },
  {
    id: "co_rua12",
    name: "Rua 12 Studio",
    slogan: "Seu estilo, sem roteiro.",
    owner: "Thiago Lemos",
    phone: "(41) 3324-7710",
    email: "hey@rua12.studio",
    address: "Alameda Prudente de Moraes, 120 — Centro",
    city: "Curitiba",
    state: "PR",
    initials: "R12",
    plan: "Essential",
    colors: { primary: "#9DBBFF", secondary: "#1B2440" },
    theme: "minimal",
    seed: 133,
    clientCount: 32,
    pros: [
      { name: "Thiago Lemos", role: "Barbeiro & fundador", phone: "(41) 99812-4400", email: "thiago@rua12.studio", color: "#9DBBFF", commission: 45, active: true, specialties: ["Textura", "Crespo"], rating: 4.9, goal: 8e3 },
      { name: "Yuri Campos", role: "Barbeiro", phone: "(41) 99677-2112", email: "yuri@rua12.studio", color: "#C9F158", commission: 40, active: true, specialties: ["Mullet", "Coloração"], rating: 4.8, goal: 6500 },
      { name: "Nina Aguiar", role: "Barbeira", phone: "(41) 99345-7890", email: "nina@rua12.studio", color: "#E6B980", commission: 40, active: true, specialties: ["Shag", "Curvatura"], rating: 5, goal: 6500 }
    ],
    services: [
      { name: "Corte Rua 12", description: "Consulta, corte e finalização autoral.", category: "Cabelo", duration: 50, price: 80, cost: 8 },
      { name: "Barba Express", description: "Alinhamento rápido com navalha.", category: "Barba", duration: 25, price: 45, cost: 6 },
      { name: "Combo Studio", description: "Corte e barba com styling incluso.", category: "Combos", duration: 80, price: 115, cost: 13 },
      { name: "Curvatura", description: "Corte especializado para cabelos crespos e ondulados.", category: "Tratamentos", duration: 60, price: 95, cost: 16 },
      { name: "Coloração Criativa", description: "Cores autorais e descoloração.", category: "Coloração", duration: 110, price: 210, cost: 70 },
      { name: "Sobrancelha", description: "Design rápido na navalha.", category: "Detalhes", duration: 15, price: 25, cost: 3 }
    ]
  }
];
const makeHours = () => Object.fromEntries(Object.entries(DEFAULT_HOURS).map(([k, v]) => [Number(k), { ...v }]));
const buildCompany = (config) => ({
  id: config.id,
  name: config.name,
  slogan: config.slogan,
  owner: config.owner,
  document: "42.318.907/0001-24",
  phone: config.phone,
  whatsapp: config.phone,
  email: config.email,
  address: config.address,
  city: config.city,
  state: config.state,
  initials: config.initials,
  plan: config.plan,
  brand: { primary: config.colors.primary, secondary: config.colors.secondary, theme: config.theme },
  hours: makeHours(),
  settings: {
    onlineBooking: true,
    loyaltyProgram: true,
    reminderHours: 24,
    defaultCommission: 40,
    requireDeposit: false,
    showPrices: true
  },
  createdAt: toISO(addDays(/* @__PURE__ */ new Date(), -Math.floor(config.seed * 3.4))),
  isDemo: true,
  cover: config.cover
});
const buildProfessionals = (config) => config.pros.map((pro, i) => ({
  ...pro,
  id: `${config.id}_pro_${i + 1}`,
  companyId: config.id,
  hiredAt: toISO(addDays(/* @__PURE__ */ new Date(), -(120 + i * 190)))
}));
const buildServices = (config) => config.services.map((service, i) => ({
  ...service,
  id: `${config.id}_svc_${i + 1}`,
  companyId: config.id,
  active: true
}));
const buildClients = (config) => {
  const rng = seedRandom(config.seed * 17);
  const used = /* @__PURE__ */ new Set();
  const clients = [];
  for (let i = 0; i < config.clientCount; i++) {
    let name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
    let guard = 0;
    while (used.has(name) && guard < 40) {
      name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
      guard++;
    }
    used.add(name);
    const firstName = name.split(" ")[0].toLowerCase();
    const last = name.split(" ")[1].toLowerCase();
    const createdDaysAgo = Math.floor(rng() * 400) + 1;
    clients.push({
      id: `${config.id}_cli_${i + 1}`,
      companyId: config.id,
      name,
      phone: phone(rng),
      whatsapp: phone(rng),
      email: `${firstName}.${last}${rng() > 0.7 ? Math.floor(rng() * 90) : ""}@email.com`,
      birthDate: `${1980 + Math.floor(rng() * 24)}-${`${Math.floor(rng() * 12) + 1}`.padStart(2, "0")}-${`${Math.floor(rng() * 27) + 1}`.padStart(2, "0")}`,
      cpf: rng() > 0.6 ? `${Math.floor(rng() * 900 + 100)}.${Math.floor(rng() * 900 + 100)}.${Math.floor(rng() * 900 + 100)}-${Math.floor(rng() * 90 + 10)}` : "",
      address: rng() > 0.45 ? `Rua ${pick(rng, LAST)}, ${Math.floor(rng() * 900) + 10} — ${config.city}` : "",
      notes: pick(rng, NOTES),
      preferences: pick(rng, PREFS),
      preferredProfessionalId: rng() > 0.35 ? `${config.id}_pro_${Math.floor(rng() * config.pros.length) + 1}` : "",
      createdAt: toISO(addDays(/* @__PURE__ */ new Date(), -createdDaysAgo))
    });
  }
  return clients;
};
const buildAppointments = (config, professionals, services, clients) => {
  const rng = seedRandom(config.seed * 53);
  const appointments = [];
  const today = /* @__PURE__ */ new Date();
  const activePros = professionals.filter((p) => p.active);
  const servicePool = services.map((s, i) => ({ service: s, weight: i < 3 ? 4 : i === services.length - 1 ? 0.6 : 1.6 }));
  const weightedService = () => {
    const total = servicePool.reduce((acc, s) => acc + s.weight, 0);
    let r = rng() * total;
    for (const entry of servicePool) {
      r -= entry.weight;
      if (r <= 0) return entry.service;
    }
    return servicePool[0].service;
  };
  for (let offset = -119; offset <= 12; offset++) {
    const date = addDays(today, offset);
    const iso = toISO(date);
    const hours = DEFAULT_HOURS[date.getDay()];
    if (hours.closed) continue;
    const openMinutes = Number(hours.open.split(":")[0]) * 60;
    const closeMinutes = Number(hours.close.split(":")[0]) * 60;
    const dayFactor = [0, 2, 3, 3, 4, 5, 5, 4][date.getDay()];
    const isToday = offset === 0;
    activePros.forEach((pro, proIndex) => {
      let cursor = openMinutes + Math.floor(rng() * 3) * 30;
      const density = isToday ? 3 : Math.max(1, Math.round(dayFactor / 2) + (rng() > 0.45 ? 1 : 0));
      const count = Math.max(1, density + (proIndex === 0 && rng() > 0.5 ? 1 : 0));
      for (let i = 0; i < count; i++) {
        const client = pick(rng, clients);
        const service = weightedService();
        const serviceIds = [service.id];
        let totalDuration = service.duration;
        let totalPrice = service.price;
        if (rng() > 0.72) {
          const extra = pick(rng, services.filter((s) => s.id !== service.id && s.category !== "Combos"));
          serviceIds.push(extra.id);
          totalDuration += extra.duration;
          totalPrice += extra.price;
        }
        if (totalPrice > 170) totalPrice = Math.round(totalPrice * 0.92);
        const discount = rng() > 0.85 ? 10 : 0;
        const startMinutes = cursor;
        if (startMinutes + totalDuration > closeMinutes) break;
        let status;
        if (offset < 0) {
          const roll = rng();
          status = roll > 0.94 ? "cancelled" : roll > 0.9 ? "no_show" : "completed";
        } else if (offset === 0) {
          status = "scheduled";
        } else {
          status = rng() > 0.32 ? "confirmed" : "scheduled";
        }
        appointments.push({
          id: `${config.id}_apt_${appointments.length + 1}`,
          companyId: config.id,
          clientId: client.id,
          professionalId: pro.id,
          serviceIds,
          date: iso,
          start: `${`${Math.floor(startMinutes / 60)}`.padStart(2, "0")}:${`${startMinutes % 60}`.padStart(2, "0")}`,
          end: addMinutes(
            `${`${Math.floor(startMinutes / 60)}`.padStart(2, "0")}:${`${startMinutes % 60}`.padStart(2, "0")}`,
            totalDuration
          ),
          status,
          price: totalPrice,
          discount,
          paymentMethod: status === "completed" ? pick(rng, PAYMENTS) : "",
          notes: rng() > 0.9 ? "Cliente pediu pontualidade no horário." : "",
          createdAt: toISO(addDays(fromISO(iso), -Math.floor(rng() * 8 + 1)))
        });
        cursor += totalDuration + (rng() > 0.5 ? 30 : 15);
      }
    });
  }
  const todays = appointments.filter((a) => a.date === todayISO()).sort((a, b) => a.start.localeCompare(b.start));
  todays.forEach((appointment, index) => {
    if (index < 5) {
      appointment.status = "completed";
      appointment.paymentMethod = PAYMENTS[index % PAYMENTS.length];
    } else if (index === 5) {
      appointment.status = "in_progress";
      appointment.paymentMethod = "";
    } else if (index < 9) {
      appointment.status = "confirmed";
      appointment.paymentMethod = "";
    } else {
      appointment.status = "scheduled";
      appointment.paymentMethod = "";
    }
  });
  return appointments;
};
const buildExpenses = (config) => {
  const rng = seedRandom(config.seed * 91);
  const expenses = [];
  const today = /* @__PURE__ */ new Date();
  const scale = config.plan === "Future" ? 1 : config.plan === "Pro" ? 0.72 : 0.52;
  for (let m = 0; m < 4; m++) {
    const base = new Date(today.getFullYear(), today.getMonth() - m, 5);
    if (m === 0 && base > today) continue;
    const monthISO = (day) => toISO(new Date(base.getFullYear(), base.getMonth(), day));
    const add = (description, category, amount, day, method) => {
      if (monthISO(day) > todayISO()) return;
      expenses.push({
        id: `${config.id}_exp_${expenses.length + 1}`,
        companyId: config.id,
        description,
        category,
        amount: Math.round(amount * scale),
        date: monthISO(day),
        paymentMethod: method,
        recurring: true
      });
    };
    add("Aluguel do espaço", "Estrutura", 4200, 5, "transfer");
    add("Produtos e cosméticos", "Produtos", 1150 + Math.floor(rng() * 350), 8, "credit");
    add("Energia e internet", "Estrutura", 480, 12, "debit");
    add("Marketing e mídia paga", "Marketing", 620, 15, "credit");
    add("Pró-labore equipe", "Pessoal", 3800, 20, "transfer");
    if (config.plan === "Future") add("Assinatura Barber Pro Future", "Software", 249, 10, "credit");
  }
  return expenses;
};
const buildDemoDatabase = () => {
  const companies = [];
  const professionals = [];
  const services = [];
  const clients = [];
  const appointments = [];
  const expenses = [];
  COMPANY_CONFIGS.forEach((config) => {
    const company = buildCompany(config);
    const pros = buildProfessionals(config);
    const svcs = buildServices(config);
    const cls = buildClients(config);
    companies.push(company);
    professionals.push(...pros);
    services.push(...svcs);
    clients.push(...cls);
    appointments.push(...buildAppointments(config, pros, svcs, cls));
    expenses.push(...buildExpenses(config));
  });
  return {
    version: 1,
    activeCompanyId: companies[0].id,
    companies,
    professionals,
    services,
    clients,
    appointments,
    expenses,
    demoRestoredAt: (/* @__PURE__ */ new Date()).toISOString()
  };
};
const makeCompany = (input) => ({
  id: `co_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
  name: input.name,
  slogan: input.slogan ?? "Sua barbearia, sua identidade.",
  owner: input.owner,
  document: input.document ?? "",
  phone: input.phone ?? "",
  whatsapp: input.whatsapp ?? input.phone ?? "",
  email: input.email ?? "",
  address: input.address ?? "",
  city: input.city ?? "",
  state: input.state ?? "",
  initials: input.initials || input.name.slice(0, 2).toUpperCase(),
  plan: input.plan ?? "Essential",
  brand: input.brand ?? { primary: PALETTE[0].primary, secondary: PALETTE[0].secondary, theme: "minimal" },
  hours: input.hours ?? makeHours(),
  settings: input.settings ?? {
    onlineBooking: true,
    loyaltyProgram: true,
    reminderHours: 24,
    defaultCommission: 40,
    requireDeposit: false,
    showPrices: true
  },
  createdAt: todayISO(),
  isDemo: false,
  cover: input.cover
});
const makeStarterRecords = (company) => {
  const professional = {
    id: uidFor(company.id, "pro"),
    companyId: company.id,
    name: company.owner,
    role: "Barbeiro · Fundador",
    phone: company.phone,
    email: company.email,
    color: company.brand.primary,
    commission: company.settings.defaultCommission,
    active: true,
    specialties: ["Corte", "Barba"],
    hiredAt: todayISO(),
    rating: 5,
    goal: 8e3
  };
  const service = {
    id: uidFor(company.id, "svc"),
    companyId: company.id,
    name: "Corte Signature",
    description: "Consulta de estilo, corte e finalização.",
    category: "Cabelo",
    duration: 45,
    price: 70,
    cost: 8,
    active: true
  };
  const beard = {
    id: uidFor(company.id, "svc"),
    companyId: company.id,
    name: "Barba completa",
    description: "Toalha quente, modelagem e navalha.",
    category: "Barba",
    duration: 30,
    price: 50,
    cost: 6,
    active: true
  };
  return { professionals: [professional], services: [service, beard] };
};
const uidFor = (companyId, prefix) => `${companyId}_${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
export {
  AVATARS,
  COVER,
  DEFAULT_HOURS,
  PALETTE,
  buildDemoDatabase,
  makeCompany,
  makeHours,
  makeStarterRecords
};
