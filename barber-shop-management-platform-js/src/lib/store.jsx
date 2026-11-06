import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearSnapshot, loadSnapshot, saveSnapshot } from "@/lib/db";
import { buildDemoDatabase } from "@/data/demo";
const StoreContext = createContext(null);
const scoped = (items, companyId) => items.filter((item) => item.companyId === companyId);
function StoreProvider({ children }) {
  const [db, setDb] = useState(() => loadSnapshot() ?? buildDemoDatabase());
  useEffect(() => {
    saveSnapshot(db);
  }, [db]);
  const activeCompany = db.companies.find((c) => c.id === db.activeCompanyId) ?? db.companies[0];
  const companyId = activeCompany?.id ?? "";
  const upsert = useCallback(
    (key, item) => {
      setDb((prev) => {
        const list = prev[key];
        const exists = list.some((entry) => entry.id === item.id);
        return {
          ...prev,
          [key]: exists ? list.map((entry) => entry.id === item.id ? item : entry) : [item, ...list]
        };
      });
    },
    []
  );
  const patch = useCallback(
    (key, id, data) => {
      setDb((prev) => {
        const list = prev[key];
        return {
          ...prev,
          [key]: list.map((entry) => entry.id === id ? { ...entry, ...data } : entry)
        };
      });
    },
    []
  );
  const remove = useCallback(
    (key, id) => {
      setDb((prev) => {
        const list = prev[key];
        return { ...prev, [key]: list.filter((entry) => entry.id !== id) };
      });
    },
    []
  );
  const value = useMemo(() => {
    const professionals = scoped(db.professionals, companyId);
    const services = scoped(db.services, companyId);
    const clients = scoped(db.clients, companyId);
    const appointments = scoped(db.appointments, companyId);
    const expenses = scoped(db.expenses, companyId);
    return {
      db,
      company: activeCompany,
      companies: db.companies,
      professionals,
      services,
      clients,
      appointments,
      expenses,
      setActiveCompany: (id) => {
        setDb((prev) => ({ ...prev, activeCompanyId: id }));
      },
      addCompany: (company) => {
        setDb((prev) => ({ ...prev, companies: [...prev.companies, company], activeCompanyId: company.id }));
      },
      updateCompany: (id, data) => {
        setDb((prev) => ({
          ...prev,
          companies: prev.companies.map((c) => c.id === id ? { ...c, ...data } : c)
        }));
      },
      deleteCompany: (id) => {
        setDb((prev) => {
          const companies = prev.companies.filter((c) => c.id !== id);
          if (!companies.length) return prev;
          return {
            ...prev,
            companies,
            activeCompanyId: prev.activeCompanyId === id ? companies[0].id : prev.activeCompanyId,
            professionals: prev.professionals.filter((p) => p.companyId !== id),
            services: prev.services.filter((s) => s.companyId !== id),
            clients: prev.clients.filter((c) => c.companyId !== id),
            appointments: prev.appointments.filter((a) => a.companyId !== id),
            expenses: prev.expenses.filter((e) => e.companyId !== id)
          };
        });
      },
      duplicateCompany: (id) => {
        const source = db.companies.find((c) => c.id === id);
        if (!source) return null;
        const newId = `co_${Date.now().toString(36)}`;
        const suffix = (oldId) => oldId ? `${newId}_${oldId.split("_").slice(-1)[0]}_${Math.random().toString(36).slice(2, 5)}` : "";
        const proMap = new Map(db.professionals.filter((p) => p.companyId === id).map((p) => [p.id, suffix(p.id)]));
        const svcMap = new Map(db.services.filter((s) => s.companyId === id).map((s) => [s.id, suffix(s.id)]));
        const cliMap = new Map(db.clients.filter((c) => c.companyId === id).map((c) => [c.id, suffix(c.id)]));
        const copy = {
          ...source,
          id: newId,
          name: `${source.name} · Cópia`,
          initials: source.initials.slice(0, 3),
          isDemo: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
        };
        setDb((prev) => ({
          ...prev,
          companies: [...prev.companies, copy],
          activeCompanyId: newId,
          professionals: [
            ...prev.professionals,
            ...prev.professionals.filter((p) => p.companyId === id).map((p) => ({ ...p, companyId: newId, id: proMap.get(p.id) }))
          ],
          services: [
            ...prev.services,
            ...prev.services.filter((s) => s.companyId === id).map((s) => ({ ...s, companyId: newId, id: svcMap.get(s.id) }))
          ],
          clients: [
            ...prev.clients,
            ...prev.clients.filter((c) => c.companyId === id).map((c) => ({
              ...c,
              companyId: newId,
              id: cliMap.get(c.id),
              preferredProfessionalId: proMap.get(c.preferredProfessionalId) ?? ""
            }))
          ],
          appointments: [
            ...prev.appointments,
            ...prev.appointments.filter((a) => a.companyId === id).map((a) => ({
              ...a,
              id: suffix(a.id),
              companyId: newId,
              clientId: cliMap.get(a.clientId) ?? a.clientId,
              professionalId: proMap.get(a.professionalId) ?? a.professionalId,
              serviceIds: a.serviceIds.map((s) => svcMap.get(s) ?? s)
            }))
          ],
          expenses: [
            ...prev.expenses,
            ...prev.expenses.filter((e) => e.companyId === id).map((e) => ({ ...e, id: suffix(e.id), companyId: newId }))
          ]
        }));
        return copy;
      },
      restoreDemo: () => {
        setDb(buildDemoDatabase());
      },
      addClient: (client) => upsert("clients", client),
      updateClient: (id, data) => patch("clients", id, data),
      deleteClient: (id) => {
        setDb((prev) => ({
          ...prev,
          clients: prev.clients.filter((c) => c.id !== id),
          appointments: prev.appointments.filter((a) => a.clientId !== id)
        }));
      },
      addAppointment: (appointment) => upsert("appointments", appointment),
      updateAppointment: (id, data) => patch("appointments", id, data),
      deleteAppointment: (id) => remove("appointments", id),
      addService: (service) => upsert("services", service),
      updateService: (id, data) => patch("services", id, data),
      deleteService: (id) => remove("services", id),
      addProfessional: (professional) => upsert("professionals", professional),
      updateProfessional: (id, data) => patch("professionals", id, data),
      deleteProfessional: (id) => remove("professionals", id),
      addExpense: (expense) => upsert("expenses", expense),
      deleteExpense: (id) => remove("expenses", id),
      resetAll: () => {
        clearSnapshot();
        setDb(buildDemoDatabase());
      }
    };
  }, [db, activeCompany, companyId, upsert, patch, remove]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
export {
  StoreProvider,
  useStore
};
