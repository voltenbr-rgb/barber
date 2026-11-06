import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { StoreProvider } from "@/lib/store";
import { UIProvider } from "@/lib/ui";
import { AppShell } from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import Agenda from "@/pages/Agenda";
import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import Team from "@/pages/Team";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Companies from "@/pages/Companies";
import Settings from "@/pages/Settings";
function App() {
  return <StoreProvider>
      <UIProvider>
        <HashRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/servicos" element={<Services />} />
              <Route path="/equipe" element={<Team />} />
              <Route path="/financeiro" element={<Finance />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/empresas" element={<Companies />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </UIProvider>
    </StoreProvider>;
}
export {
  App as default
};
