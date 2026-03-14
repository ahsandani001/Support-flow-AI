# System Architecture

## High-Level Overview

SupportFlow AI uses a **modular monolith** architecture that communicates via NATS, allowing future extraction into microservices.

```mermaid
graph TB
    subgraph "Clients"
        Email[Email Channel]
        Chat[Web Chat]
        API[REST/GraphQL API]
    end

    subgraph "Core Platform"
        Gateway[API Gateway]

        subgraph "Services"
            Ticket[Ticket Service]
            Agent[Agent Service]
            AI[AI Service]
            Channel[Channel Service]
        end

        NATS[NATS Event Bus]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL\n+ pgvector)]
        Mongo[(MongoDB)]
        Redis[(Redis)]
    end

    subgraph "Monitoring"
        Prometheus[Prometheus]
        Grafana[Grafana]
    end

    %% Connections
    Email --> NATS
    Chat --> NATS
    API --> Gateway

    Gateway --> Ticket
    Gateway --> Agent

    Ticket <--> NATS
    Agent <--> NATS
    AI <--> NATS
    Channel <--> NATS

    Ticket --> Postgres
    Ticket --> Mongo
    Agent --> Redis

    AI --> Postgres

    Prometheus --> Gateway
    Prometheus --> Services
    Grafana --> Prometheus
```

## Data Flow Examples

### 1. Ticket Creation Flow

```mermaid
sequenceDiagram
    participant C as Client (Email)
    participant N as NATS
    participant T as Ticket Service
    participant A as AI Service
    participant P as PostgreSQL
    participant M as MongoDB

    C->>N: ticket.received (email)
    N->>T: consume ticket.received
    T->>P: save ticket metadata
    T->>M: save message content
    T->>N: ticket.created

    N->>A: ticket.created
    A->>P: generate embedding
    A->>P: find similar tickets
    A->>N: ticket.analyzed (with tags)

    N->>T: update with tags
    T->>P: update ticket
```

## Service Responsibilities

### Ticket Service

- **Models**: Ticket, Message, Status
- **Database**: PostgreSQL (tickets), MongoDB (messages)
- **Events Published**: `ticket.created`, `ticket.assigned`, `ticket.resolved`
- **Events Consumed**: `agent.assigned`, `ticket.analyzed`

### Agent Service

- **Models**: Agent, Availability, Skills
- **Database**: PostgreSQL (agents), Redis (presence)
- **Events Published**: `agent.status.changed`, `agent.assigned`
- **Events Consumed**: `ticket.created`

### AI Service

- **Models**: Embedding, Suggestion, Tag
- **Database**: PostgreSQL with pgvector
- **Events Published**: `ticket.analyzed`, `ticket.suggested`
- **Events Consumed**: `ticket.created`

## Database Schema

### PostgreSQL (Primary)

```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    settings JSONB,
    created_at TIMESTAMP
);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    org_id UUID REFERENCES organizations,
    status TEXT,
    priority TEXT,
    assigned_to UUID,
    metadata JSONB,
    created_at TIMESTAMP
);

-- Embeddings (pgvector)
CREATE TABLE ticket_embeddings (
    ticket_id UUID REFERENCES tickets,
    embedding vector(384),
    model TEXT
);
```

### MongoDB (Messages)

```javascript
// messages collection
{
  "_id": ObjectId,
  "ticketId": UUID,
  "channel": "email" | "chat",
  "content": String,
  "attachments": [{
    "url": String,
    "type": String
  }],
  "metadata": {}, // Channel-specific fields
  "createdAt": ISODate
}
```

## Infrastructure

### Docker Compose (Development)

```yaml
services:
  postgres: # with pgvector
  mongodb:
  redis:
  nats:
  app: # Node.js app
```

### Kubernetes (Production)

- Deployments for each service
- StatefulSets for databases
- ConfigMaps for configuration
- Secrets for credentials

## Monitoring & Observability

- **Metrics**: Prometheus (request rate, latency, errors)
- **Visualization**: Grafana dashboards
- **Logging**: Structured JSON logs
- **Tracing**: OpenTelemetry (future)

## Scaling Considerations

- **Horizontal Scaling**: Services are stateless, scale via K8s
- **Database Scaling**:
  - PostgreSQL: Read replicas for queries
  - MongoDB: Sharding for messages
  - Redis: Cluster mode
- **NATS**: JetStream for persistence and queue groups

## Security

- **API Authentication**: JWT tokens
- **Service-to-Service**: NATS authentication
- **Data Encryption**: TLS in transit, encrypted at rest
- **Secrets**: HashiCorp Vault (inspired by your CEQUENS experience)
