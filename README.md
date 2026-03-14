# SupportFlow AI - Intelligent Customer Support Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![NATS](https://img.shields.io/badge/NATS-Event--Driven-purple)](https://nats.io/)

## 🎯 What is SupportFlow AI?

A modern customer support platform that unifies multiple communication channels (email, chat) and augments human agents with AI capabilities. Built to demonstrate production-ready backend engineering with multiple databases and event-driven architecture.

## ✨ Features

- **Multi-channel Support**: Email and web chat (extensible for WhatsApp/SMS)
- **Smart Ticket Management**: Create, assign, prioritize, and resolve tickets
- **Real-time Updates**: Live dashboard using WebSockets
- **AI Augmentation**:
  - Auto-tagging of tickets
  - Similar ticket suggestions (using pgvector)
  - Response templates based on historical solutions
- **Agent Tools**: Load balancing, status management, performance metrics
- **Customer Portal**: Track ticket status

## 🏗️ Tech Stack

| Component      | Technology            | Purpose                  |
| -------------- | --------------------- | ------------------------ |
| Runtime        | Node.js + TypeScript  | Type safety              |
| API Layer      | REST + GraphQL        | Flexible data fetching   |
| Event Bus      | NATS                  | Service communication    |
| Primary DB     | PostgreSQL + pgvector | ACID + vector search     |
| Document Store | MongoDB               | Flexible message storage |
| Cache          | Redis                 | Sessions + rate limiting |
| Container      | Docker + Kubernetes   | Deployment               |
| Monitoring     | Prometheus + Grafana  | Observability            |
| Documentation  | OpenAPI + AsyncAPI    | API specs                |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- (Optional) Kubernetes for deployment

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/supportflow-ai
cd supportflow-ai

# Install dependencies
npm install

# Start all databases
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

Visit `http://localhost:3000/health` to verify it's running.

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Technical Decisions](./docs/DECISIONS.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📈 Project Status

✅ Phase 1: Foundation (In Progress)
🔄 Phase 2: Core Domain (Planned)
⏳ Phase 3: AI Features (Planned)
⏳ Phase 4: Polish & Deploy (Planned)

## 👨‍💻 Author

**Ahsan Danish** - Backend Engineer specializing in Node.js, event-driven systems, and AI-augmented development.

## 📄 License

MIT
