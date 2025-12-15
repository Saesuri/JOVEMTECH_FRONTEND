# 🏢 CajuHub - Sistema de Gerenciamento de Locação de Espaços

Sistema completo para gerenciamento de reservas de espaços para eventos, salas de reunião, auditórios e laboratórios de tecnologia, inspirado em ambientes de inovação como o CAJUHUB.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)

---
 **[Acesse a aplicação ao vivo](https://jovemtech-frontend.vercel.app/)**
---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando o Projeto](#-executando-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades por Módulo](#-funcionalidades-por-módulo)
- [API Endpoints](#-api-endpoints)

---

## 🎯 Visão Geral

O CajuHub é uma plataforma web completa para gerenciamento de espaços compartilhados, permitindo que usuários visualizem a disponibilidade de salas em tempo real, façam reservas e gerenciem suas agendas. Administradores têm acesso a um painel completo com dashboards, relatórios e ferramentas de gestão.

### Principais Características

- **Mapa Interativo**: Visualização gráfica dos espaços disponíveis por andar
- **Calendário Visual**: Agenda semanal com visualização de ocupação
- **Prevenção de Conflitos**: Sistema automático que impede reservas sobrepostas
- **Dashboard Administrativo**: Estatísticas, gráficos e relatórios de ocupação
- **Multi-idioma**: Suporte para Português e Inglês
- **Tema Claro/Escuro**: Interface adaptável às preferências do usuário

---

## ✨ Funcionalidades

### 👤 Para Usuários

| Funcionalidade        | Descrição                                                          |
| --------------------- | ------------------------------------------------------------------ |
| **Reservar Espaços**  | Visualize e reserve salas através do mapa interativo ou calendário |
| **Filtros Avançados** | Filtre por tipo de sala, capacidade e amenidades                   |
| **Minhas Reservas**   | Gerencie e cancele suas reservas facilmente                        |
| **Perfil de Usuário** | Atualize suas informações pessoais                                 |

### 🔧 Para Administradores

| Funcionalidade         | Descrição                                                     |
| ---------------------- | ------------------------------------------------------------- |
| **Editor de Layout**   | Crie e configure espaços visualmente (retângulos e polígonos) |
| **Gerenciar Andares**  | Adicione, renomeie ou remova andares do edifício              |
| **Dashboard**          | Visualize estatísticas de ocupação em tempo real              |
| **Gráficos**           | Análise de reservas por período e tipo de sala                |
| **Exportar Dados**     | Exporte relatórios em formato CSV                             |
| **Gerenciar Usuários** | Atribua papéis (admin/usuário) aos membros                    |
| **Feed de Atividades** | Acompanhe ações recentes no sistema                           |

---

## 🛠 Tecnologias

### Frontend

- **React 18.3** - Biblioteca para construção de interfaces
- **TypeScript 5.6** - Tipagem estática para JavaScript
- **Vite 6.0** - Build tool e dev server
- **React Router 7** - Navegação SPA
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI acessíveis
- **Recharts** - Biblioteca de gráficos
- **react-i18next** - Internacionalização
- **Sonner** - Notificações toast
- **Lucide React** - Ícones

### Backend (Repositório Separado)

- **Node.js + Express** - Servidor API REST
- **Supabase** - Banco de dados PostgreSQL e autenticação
- **Zod** - Validação de schemas

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18.x ou superior)
- **npm** ou **yarn**
- **Git**

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/JOVEMTECH_FRONTEND.git
cd JOVEMTECH_FRONTEND
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do seu ambiente (veja seção abaixo).

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# URL da API Backend
VITE_API_URL=http://localhost:3001/api

# Supabase (para autenticação direta no frontend)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

| Variável                 | Descrição                                                 |
| ------------------------ | --------------------------------------------------------- |
| `VITE_API_URL`           | URL base da API backend (ex: `http://localhost:3001/api`) |
| `VITE_SUPABASE_URL`      | URL do seu projeto Supabase                               |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase                          |

---

## ▶️ Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em: **http://localhost:5173**

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

### Pré-visualizar Build

```bash
npm run preview
```

---

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Imagens e arquivos estáticos
├── components/      # Componentes reutilizáveis
│   ├── MapEditor/   # Editor de mapa interativo
│   ├── Modals/      # Modais (reserva, edição, etc.)
│   ├── Settings/    # Configurações do sistema
│   └── ui/          # Componentes shadcn/ui
├── config/          # Configurações (Supabase client)
├── context/         # Contextos React (Auth)
├── locales/         # Arquivos de tradução (pt-BR, en)
├── pages/           # Páginas da aplicação
│   ├── AdminBookings.tsx   # Painel admin de reservas
│   ├── AdminEditor.tsx     # Editor de layout
│   ├── AdminSettings.tsx   # Configurações admin
│   ├── Login.tsx           # Página de login
│   ├── MyBookings.tsx      # Reservas do usuário
│   ├── Profile.tsx         # Perfil do usuário
│   └── UserBooking.tsx     # Página principal de reservas
├── services/        # Camada de serviços (API calls)
├── types/           # Definições TypeScript
└── utils/           # Funções utilitárias
```

---

## 📖 Funcionalidades por Módulo

### 🗺️ Reservar Espaço (`/book`)

Interface principal para usuários fazerem reservas:

1. **Selecione o Andar** - Escolha entre os andares disponíveis
2. **Defina Data/Hora** - Selecione o período desejado
3. **Aplique Filtros** - Filtre por tipo de sala ou capacidade mínima
4. **Visualize Disponibilidade** - Cores indicam status:
   - 🟢 Verde: Disponível
   - 🔴 Vermelho: Ocupado
   - ⚪ Cinza: Filtrado/Manutenção
5. **Faça a Reserva** - Clique no espaço e confirme

### 📅 Visualização por Calendário

Alterne para o modo calendário para ver a agenda semanal de um espaço específico. Clique em slots vazios para reservar diretamente.

### 🛠️ Editor de Layout (`/admin/editor`)

Ferramenta visual para administradores configurarem os espaços:

- **Ferramenta Retângulo**: Desenhe salas quadradas/retangulares
- **Ferramenta Polígono**: Desenhe espaços com formas customizadas
- **Edição de Propriedades**: Nome, tipo, capacidade e amenidades
- **Gerenciar Andares**: Crie, renomeie ou delete andares

### 📊 Dashboard Admin (`/admin/bookings`)

Painel completo com:

- **Estatísticas**: Total de reservas, ocupação atual, usuários únicos
- **Gráficos**: Tendência de reservas (7 dias), tipos de sala mais populares
- **Lista de Reservas**: Tabela com busca e filtros
- **Agenda por Sala**: Visualização da ocupação de cada espaço
- **Feed de Atividades**: Log de ações recentes
- **Exportar CSV**: Download dos dados filtrados

---

## 🔌 API Endpoints

### Públicos (sem autenticação)

| Método | Endpoint             | Descrição                   |
| ------ | -------------------- | --------------------------- |
| GET    | `/floors`            | Lista todos os andares      |
| GET    | `/spaces`            | Lista espaços de um andar   |
| GET    | `/bookings`          | Lista reservas de um espaço |
| GET    | `/bookings/occupied` | Verifica disponibilidade    |
| GET    | `/config/room-types` | Lista tipos de sala         |

### Protegidos (requer login)

| Método  | Endpoint             | Descrição           |
| ------- | -------------------- | ------------------- |
| POST    | `/bookings`          | Criar nova reserva  |
| DELETE  | `/bookings/:id`      | Cancelar reserva    |
| GET     | `/bookings/user/:id` | Reservas do usuário |
| GET/PUT | `/profiles/:id`      | Perfil do usuário   |

### Admin Only

| Método          | Endpoint                 | Descrição                |
| --------------- | ------------------------ | ------------------------ |
| POST/PUT/DELETE | `/floors/:id`            | CRUD de andares          |
| POST/PUT/DELETE | `/spaces/:id`            | CRUD de espaços          |
| GET             | `/admin/bookings`        | Todas as reservas        |
| GET             | `/admin/logs`            | Logs de atividade        |
| PUT             | `/config/users/:id/role` | Alterar papel do usuário |

---

## 👨‍💻 Autor

Desenvolvido para o desafio JOVEMTECH.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
