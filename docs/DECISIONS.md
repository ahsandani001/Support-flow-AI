# Technical Decisions

This document tracks key architectural and technical decisions, including context, options considered, and rationale.

## Architecture Style: Modular Monolith

**Decision**: Start with a modular monolith, extract to microservices if needed.

**Context**:

- Solo developer building MVP
- Want to demonstrate clean architecture
- Need to ship quickly

**Options Considered**:

1. **Microservices first** - Too complex for MVP
2. **Monolith** - Wouldn't show advanced skills
3. **Modular Monolith** ✅ - Best of both worlds

**Rationale**:

- Can develop features quickly
- Clear module boundaries for future extraction
- Demonstrates understanding of both approaches
- Easier testing and debugging initially

**Trade-offs**:

- (-) Need discipline to maintain module boundaries
- (+) Can deploy as monolith or split later

## Database Strategy: Polyglot Persistence

**Decision**: Use PostgreSQL, MongoDB, and Redis for different concerns.

### Why PostgreSQL for Tickets?

**Context**: Tickets need ACID compliance, relationships, and complex queries.

**Options**: MongoDB, PostgreSQL, MySQL

**Rationale**:

- ACID transactions for ticket assignments
- Rich querying for reporting
- pgvector extension for AI features
- Strong schema prevents data corruption

### Why MongoDB for Messages?

**Context**: Messages vary by channel, high write volume.

**Rationale**:

- Schema flexibility (Email vs Chat fields)
- Horizontal scaling for high volume
- Document model fits naturally
- Easy to add new channel types

### Why Redis for Presence/Availability?

**Context**: Agent status changes frequently, needs low latency.

**Rationale**:

- In-memory speed for real-time updates
- Pub/Sub for presence notifications
- Automatic expiration for stale status
- Simple key-value for sessions

## Event Bus: NATS

**Decision**: Use NATS for all service communication.

**Context**: Need reliable, fast event delivery between services.

**Options**: Kafka, RabbitMQ, NATS, Redis Pub/Sub

**Rationale**:

- **Personal experience**: Used at CEQUENS for 1M+ messages/month
- **Performance**: Lower latency than Kafka for this scale
- **Simplicity**: Easier to operate than Kafka
- **Features**: JetStream for persistence if needed
- **Service discovery**: Built-in, simplifies configuration

**Trade-offs**:

- (-) Less ecosystem than Kafka
- (-) No built-in stream processing
- (+) Much simpler to deploy and maintain

## AI Implementation: Open-Source LLMs

**Decision**: Use Ollama with Llama 3 for local AI features.

**Context**: Need embeddings and text generation without API costs.

**Options**: OpenAI API, Claude API, Ollama, Hugging Face

**Rationale**:

- **Cost**: Free for development/portfolio
- **Privacy**: All data stays local
- **Control**: Can fine-tune if needed
- **Transparency**: Employers can run it themselves

**Implementation**:

- Embeddings: `nomic-embed-text` via Ollama
- Text generation: `llama3` for suggestions
- Similarity search: pgvector

## API Design: REST + GraphQL

**Decision**: REST for simple operations, GraphQL for complex queries.

**Context**: Need flexible data fetching for frontend.

**Rationale**:

- REST: Simple, cacheable, familiar
- GraphQL: Prevent over/under-fetching
- Can implement gradually
- Demonstrates both skills

## Monitoring: Prometheus + Grafana

**Decision**: Standard open-source monitoring stack.

**Context**: Need visibility into system health.

**Rationale**:

- Industry standard
- Free and open-source
- Great Kubernetes integration
- Beautiful dashboards for portfolio

## Testing Strategy

**Decision**: Jest for unit tests, Supertest for integration.

**Context**: Learned at CEQUENS the value of TDD.

**Approach**:

- Unit tests: 80% coverage target
- Integration tests: Critical paths
- E2E tests: User journeys

## Deployment: Kubernetes

**Decision**: Deploy to K8s (minikube locally, cloud later).

**Context**: Want to demonstrate container orchestration skills.

**Rationale**:

- Industry standard
- Experience from microservices project
- Scalability demonstration
- Infrastructure as Code

## Future Considerations

### Potential Extractions

- **AI Service**: If model loading impacts performance
- **Channel Service**: If adding many integrations
- **Analytics Service**: If reporting becomes complex

### Technical Debt to Track

- [ ] No distributed tracing yet
- [ ] Need better error handling in some areas
- [ ] Add circuit breakers for external services
- [ ] Implement rate limiting properly

### Lessons Learned (To Be Updated)

_This section will grow as I build_
