import { diffDays, fromISO, inRange, sum, todayISO } from "@/lib/utils";
const netValue = (appointment) => Math.max(0, appointment.price - (appointment.discount || 0));
const appointmentServices = (appointment, services) => appointment.serviceIds.map((id) => services.find((s) => s.id === id)).filter(Boolean);
const appointmentServiceLabel = (appointment, services) => {
  const list = appointmentServices(appointment, services);
  return list.length ? list.map((s) => s.name).join(" + ") : "Serviço";
};
const clientTier = (client, appointments) => {
  const completed = appointments.filter((a) => a.clientId === client.id && a.status === "completed");
  const visits = completed.length;
  const total = sum(completed, netValue);
  const last = completed.map((a) => a.date).sort().at(-1);
  if (visits === 0) return diffDays(todayISO(), client.createdAt) > 45 ? "inactive" : "new";
  if (last && diffDays(todayISO(), last) > 70) return "inactive";
  if (total >= 750 || visits >= 7) return "vip";
  if (diffDays(todayISO(), client.createdAt) <= 30 && visits <= 1) return "new";
  return "frequent";
};
const getClientStats = (client, allAppointments, services) => {
  const mine = allAppointments.filter((a) => a.clientId === client.id);
  const completed = mine.filter((a) => a.status === "completed");
  const totalSpent = sum(completed, netValue);
  const lastVisit = completed.map((a) => a.date).sort().at(-1) ?? null;
  const nextVisit = mine.filter((a) => ["scheduled", "confirmed", "in_progress"].includes(a.status) && a.date >= todayISO()).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0] ?? null;
  const serviceCount = /* @__PURE__ */ new Map();
  completed.forEach((appointment) => {
    appointment.serviceIds.forEach((id) => {
      const svc = services.find((s) => s.id === id);
      if (svc) serviceCount.set(svc.name, (serviceCount.get(svc.name) ?? 0) + 1);
    });
  });
  const favoriteService = [...serviceCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return {
    visits: completed.length,
    totalSpent,
    lastVisit,
    nextVisit,
    ticket: completed.length ? totalSpent / completed.length : 0,
    tier: clientTier(client, allAppointments),
    favoriteService
  };
};
const periodMetrics = (appointments, clients, expenses, start, end) => {
  const inPeriod = appointments.filter((a) => inRange(a.date, start, end));
  const completed = inPeriod.filter((a) => a.status === "completed");
  const revenue = sum(completed, netValue);
  const expenseTotal = sum(
    expenses.filter((e) => inRange(e.date, start, end)),
    (e) => e.amount
  );
  return {
    revenue,
    completed: completed.length,
    scheduled: inPeriod.filter((a) => ["scheduled", "confirmed", "in_progress"].includes(a.status)).length,
    cancelled: inPeriod.filter((a) => ["cancelled", "no_show"].includes(a.status)).length,
    newClients: clients.filter((c) => inRange(c.createdAt, start, end)).length,
    ticket: completed.length ? revenue / completed.length : 0,
    expenses: expenseTotal,
    profit: revenue - expenseTotal
  };
};
const revenueSeries = (appointments, start, end, granularity = "day") => {
  const completed = appointments.filter(
    (a) => a.status === "completed" && inRange(a.date, start, end)
  );
  const buckets = /* @__PURE__ */ new Map();
  completed.forEach((appointment) => {
    const day = fromISO(appointment.date);
    let key = appointment.date;
    let label = `${`${day.getDate()}`.padStart(2, "0")}/${`${day.getMonth() + 1}`.padStart(2, "0")}`;
    if (granularity === "week") {
      const sunday = new Date(day);
      sunday.setDate(day.getDate() - day.getDay());
      key = `${sunday.getFullYear()}-${`${sunday.getMonth() + 1}`.padStart(2, "0")}-${`${sunday.getDate()}`.padStart(2, "0")}`;
      label = `sem ${`${sunday.getDate()}`.padStart(2, "0")}/${`${sunday.getMonth() + 1}`.padStart(2, "0")}`;
    } else if (granularity === "month") {
      key = appointment.date.slice(0, 7);
      label = fromISO(`${key}-02`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    }
    const current = buckets.get(key) ?? { key, label, revenue: 0, count: 0 };
    current.revenue += netValue(appointment);
    current.count += 1;
    buckets.set(key, current);
  });
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
};
const serviceRanking = (appointments, services, start, end) => {
  const counts = /* @__PURE__ */ new Map();
  appointments.filter((a) => a.status === "completed" && inRange(a.date, start, end)).forEach((appointment) => {
    appointment.serviceIds.forEach((id) => {
      const service = services.find((s) => s.id === id);
      if (!service) return;
      const current = counts.get(id) ?? { service, count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += service.price;
      counts.set(id, current);
    });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count);
};
const professionalPerformance = (professionals, appointments, start, end) => professionals.filter((p) => p.active).map((professional) => {
  const completed = appointments.filter(
    (a) => a.professionalId === professional.id && a.status === "completed" && inRange(a.date, start, end)
  );
  const revenue = sum(completed, netValue);
  return {
    professional,
    revenue,
    appointments: completed.length,
    ticket: completed.length ? revenue / completed.length : 0,
    commission: revenue * professional.commission / 100,
    goalProgress: professional.goal ? Math.min(100, revenue / professional.goal * 100) : 0
  };
}).sort((a, b) => b.revenue - a.revenue);
const occupancyToday = (appointments, professionals, hours) => {
  const today = todayISO();
  const day = fromISO(today).getDay();
  const schedule = hours[day];
  if (!schedule || schedule.closed) return { percent: 0, bookedMinutes: 0, capacityMinutes: 0 };
  const activePros = professionals.filter((p) => p.active).length || 1;
  const open = Number(schedule.open.split(":")[0]) * 60 + Number(schedule.open.split(":")[1]);
  const close = Number(schedule.close.split(":")[0]) * 60 + Number(schedule.close.split(":")[1]);
  const capacity = (close - open) * activePros;
  const booked = appointments.filter((a) => a.date === today && ["completed", "in_progress", "confirmed", "scheduled"].includes(a.status)).reduce((acc, a) => {
    const [sh, sm] = a.start.split(":").map(Number);
    const [eh, em] = a.end.split(":").map(Number);
    return acc + (eh * 60 + em - (sh * 60 + sm));
  }, 0);
  return {
    percent: Math.min(100, Math.round(booked / capacity * 100)),
    bookedMinutes: booked,
    capacityMinutes: capacity
  };
};
const upcomingAppointments = (appointments, limit = 5) => appointments.filter((a) => ["scheduled", "confirmed", "in_progress"].includes(a.status)).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`)).slice(0, limit);
export {
  appointmentServiceLabel,
  appointmentServices,
  clientTier,
  getClientStats,
  netValue,
  occupancyToday,
  periodMetrics,
  professionalPerformance,
  revenueSeries,
  serviceRanking,
  upcomingAppointments
};
