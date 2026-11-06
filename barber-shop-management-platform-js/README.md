# BARBER PRO FUTURE

Plataforma profissional, multiempresa e offline-first para gerenciamento de barbearias.
Funciona 100% no navegador, sem backend obrigatório, e está pronta para publicação estática no Cloudflare Pages.

## Stack

- **React 19 + Vite + JavaScript (JSX)**
- **Tailwind CSS 4** com design tokens por empresa
- **Recharts** para gráficos interativos
- **Lucide Icons** para iconografia
- **React Router (HashRouter)** para navegação estática
- **LocalStorage + IndexedDB** para persistência offline
- **PWA** com `manifest.webmanifest` e service worker próprio

## Módulos

| Rota | Módulo |
| --- | --- |
| `/` | Dashboard com KPIs, faturamento, ocupação, próximos agendamentos, equipe e serviços |
| `/agenda` | Agenda por dia, semana e lista, com timeline por profissional |
| `/clientes` | CRM completo com ficha individual, histórico, pagamentos e anotações |
| `/servicos` | Catálogo com preço, duração, custo, margem e vendas |
| `/equipe` | Profissionais, metas, comissões e performance |
| `/financeiro` | Fluxo de caixa, despesas, meios de pagamento e comissões |
| `/relatorios` | Análises estratégicas, mapa de calor e rankings |
| `/empresas` | Gerenciador multiempresa (criar, editar, duplicar, excluir, alternar, restaurar demo) |
| `/configuracoes` | Identidade visual, horários, preferências, backup e PWA |

## Isolamento multi-tenant

Todos os registros das listas `professionals`, `services`, `clients`, `appointments` e
`expenses` carregam `companyId`. O `StoreProvider` entrega apenas os registros da
empresa ativa e toda mutação é gravada com o `companyId` corrente. A troca de empresa
não expõe dados de outra operação.

## Dados e persistência

- `localStorage` mantém o snapshot principal (boot síncrono e rápido).
- `IndexedDB` recebe um espelho do snapshot para volumes maiores e futura migração.
- A camada está pronta para ser substituída por uma API REST/Supabase: basta trocar
  `src/lib/db.js` e os métodos de mutação do store.
- Os dados de demonstração são gerados deterministicamente em `src/data/demo.js`,
  sempre relativos à data atual.

## Demonstração

Três barbearias acompanham a aplicação: **Aurum Barber Club** (futurista, lima),
**Navalha & Bronze** (clássica, dourada) e **Rua 12 Studio** (minimalista, azul).
Cada uma tem identidade, equipe, catálogo, clientes, agenda e financeiro independentes.

Em **Empresas → Restaurar demo** é possível recriar todo o dataset a qualquer momento.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build e deploy no Cloudflare Pages

```bash
npm run build
```

- Diretório de saída: `dist`
- Build command: `npm run build`
- Framework preset: Vite
- O app usa HashRouter, portanto não exige regras de fallback complexas. Um
  `_redirects` (`/* /index.html 200`) é incluído por segurança.

## PWA

- Instalável em desktop e mobile.
- Service worker com cache do app shell e navegação network-first.
- Dados persistem após fechar o navegador.
- Para validar o service worker localmente use `npm run build && npm run preview`.

## Acessibilidade e performance

- Componentes com foco visível, `aria-label`, suporte a teclado e `prefers-reduced-motion`.
- Atalho global **⌘K / Ctrl+K** abre a busca de clientes, serviços e páginas.
- Gráficos responsivos e tabelas com scroll controlado em telas menores.
