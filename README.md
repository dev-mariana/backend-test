# IP Location API

A high-performance REST API built with TypeScript and Fastify that resolves IP addresses to geographic locations using a CSV dataset. Designed to handle 3M+ records with sub-100ms response times and support for 100+ concurrent users.

## 🚀 Features

- **Fast IP Geolocation**: Convert IPv4 addresses to geographic locations
- **High Performance**: <100ms response time, optimized for 100+ concurrent users
- **Robust Validation**: Comprehensive input validation with detailed error messages
- **Memory Optimized**: Efficient CSV parsing and in-memory caching
- **Comprehensive Testing**: Unit, integration, and performance tests
- **Production Ready**: Error handling, logging, and monitoring

## 📋 API Specification

### GET `/api/ip/location`

**Query Parameters:**

- `ip` (required): IPv4 address to lookup (e.g., "8.8.8.8")

**Success Response (200):**

```json
{
  "country": "United States of America",
  "countryCode": "US",
  "city": "Mountain View"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid IP format or missing parameter
- `404 Not Found`: IP address not found in database
- `500 Internal Server Error`: Server error

**Example Usage:**

```bash
curl "http://localhost:3000/api/ip/location?ip=8.8.8.8"
```

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify (high-performance web framework)
- **Validation**: Zod (schema validation)
- **Testing**: Vitest (unit tests) + K6 (performance tests)
- **Development**: tsx (TypeScript execution)

## 📦 Installation

### Prerequisites

- Node.js 22+
- Yarn package manager
- K6 (for performance testing): `brew install k6`

### Setup

```bash
# Clone and install dependencies
cd backend-test
yarn install

# Place the CSV dataset
# Put IP2LOCATION-LITE-DB11.CSV in src/config/database/

# Start development server
yarn dev

# Or build and run production
yarn build
yarn start
```

## 🧪 Testing

### Run All Tests

```bash
yarn test                    # All tests (54 tests total)
```

### Run Specific Test Types

```bash
yarn test:unit              # Unit tests only (44 tests)
yarn test:integration       # Integration tests (10 tests)
yarn test:performance       # K6 performance tests
yarn test:ui                # Interactive test UI
```

### Test Coverage

- **Unit Tests (44)**: Helpers and services with mocked dependencies
- **Integration Tests (10)**: Full HTTP request/response cycle
- **Performance Tests**: Concurrent load testing with K6

### Testing Architecture Choices

**🧪 Testing Strategy & Rationale:**

1. **Vitest over Jest**:

   - **Choice**: Modern testing framework with native TypeScript support
   - **Rationale**: Faster execution, better TypeScript integration, modern API
   - **Benefit**: No complex configuration needed

2. **No Controller Unit Tests**:

   - **Choice**: Skip isolated controller testing
   - **Rationale**: Controllers are thin glue code, fully covered by integration tests
   - **Implementation**: Focus testing on business logic (services/helpers)

3. **Comprehensive Mocking Strategy**:

   - **Choice**: Mock external dependencies (file system, app logging)
   - **Rationale**: Isolated unit tests, faster execution, deterministic results
   - **Implementation**: Mock at module level, test business logic in isolation

4. **Integration Tests with Real Fastify**:

   - **Choice**: Use `app.inject()` for full HTTP testing
   - **Rationale**: Tests real request/response cycle including validation
   - **Benefit**: Catches integration issues between layers

5. **K6 for Performance Testing**:
   - **Choice**: Professional load testing tool over simple scripts
   - **Rationale**: Realistic concurrent user simulation, detailed metrics
   - **Implementation**: Tests both response time and concurrency requirements

## 🏗️ Architecture

### Design Principles

**🎯 Architectural Choices & Rationale:**

1. **Layered Architecture**: Clean separation of concerns

   - Controllers → HTTP handling only
   - Services → Business logic and data management
   - Helpers → Pure utility functions
   - Models → Type definitions

2. **In-Memory Caching Strategy**:

   - **Choice**: Load entire CSV into memory at startup
   - **Rationale**: 330MB dataset fits in memory, enables <100ms responses
   - **Trade-off**: Higher memory usage for faster query performance

3. **Fastify over Express**:

   - **Choice**: Fastify web framework
   - **Rationale**: 2-3x faster than Express, built-in validation, TypeScript support
   - **Benefit**: Handles 100+ concurrent users efficiently

4. **Linear Search Algorithm**:

   - **Choice**: Array.filter() for IP range matching
   - **Rationale**: Simple, reliable, fast enough for requirements
   - **Future**: Pre-sorted data ready for binary search upgrade

5. **Functional Programming Approach**:

   - **Choice**: Pure functions in helpers, minimal classes
   - **Rationale**: Easier testing, better maintainability
   - **Implementation**: Only service uses class for state management

6. **Zod for Validation**:

   - **Choice**: Schema-based validation over manual checks
   - **Rationale**: Type-safe, comprehensive error messages, maintainable
   - **Benefit**: Automatic TypeScript integration

7. **Module-Level Caching**:
   - **Choice**: Single service instance cached in controller
   - **Rationale**: Avoid singleton pattern while preventing memory leaks
   - **Implementation**: Lazy initialization on first request

### Project Structure

```
src/
├── app.ts                  # Fastify application setup
├── server.ts               # Server bootstrap
├── controllers/            # HTTP request handlers
│   └── find-ip-location.controller.ts
├── services/               # Business logic
│   └── find-ip-location.service.ts
├── helpers/                # Utility functions
│   ├── ip-calculator.ts    # IP to ID conversion
│   ├── find-rows-for-ip.ts # Search algorithm
│   ├── parse-csv-file.ts   # CSV parsing
│   └── read-csv-file.ts    # File I/O
├── models/                 # TypeScript interfaces
│   └── ip-location-row.ts
├── routes/                 # API routes
│   └── app.routes.ts
├── errors/                 # Custom error classes
│   └── resource-not-found.ts
└── config/                 # Configuration
    ├── env/
    └── database/           # CSV dataset location

tests/
├── helpers/                # Helper function tests
├── services/               # Service layer tests
└── server.test.ts          # Integration tests
```

### Key Components

#### 1. **IP Calculator** (`helpers/ip-calculator.ts`)

Converts IPv4 addresses to numeric IDs using the formula:

```
ipId = 16777216*a + 65536*b + 256*c + d
```

#### 2. **CSV Parser** (`helpers/parse-csv-file.ts`)

- Parses 3M+ row CSV files efficiently
- Handles quoted values and malformed data
- Memory-optimized processing

#### 3. **Search Algorithm** (`helpers/find-rows-for-ip.ts`)

- Linear search through sorted IP ranges
- Finds matching ranges: `lowerIpId <= targetId <= upperIpId`
- Optimized for performance

#### 4. **Service Layer** (`services/find-ip-location.service.ts`)

- Manages CSV data loading and caching
- Implements business logic for IP lookups
- Handles data sorting and validation

#### 5. **Controller** (`controllers/find-ip-location.controller.ts`)

- HTTP request validation with Zod
- Orchestrates service calls
- Response formatting and error handling

## ⚡ Performance Optimizations

### Performance Architecture Choices

**🚀 Performance Strategy & Rationale:**

1. **Memory vs. Disk Trade-off**:

   - **Choice**: Load entire 330MB CSV into RAM
   - **Rationale**: Memory access (ns) vs disk access (ms) = 1000x faster
   - **Trade-off**: Higher memory usage for sub-100ms response times
   - **Scalability**: Acceptable for single-node deployment

2. **Startup vs. Runtime Performance**:

   - **Choice**: Accept 8-10 second startup time for fast runtime
   - **Rationale**: One-time cost for consistent <100ms responses
   - **Implementation**: Lazy loading on first request, cached thereafter

3. **Search Algorithm Choice**:

   - **Choice**: Linear search over binary search initially
   - **Rationale**: Simpler implementation, meets performance requirements
   - **Future**: Data pre-sorted for easy binary search upgrade if needed

4. **Node.js Memory Configuration**:
   - **Choice**: Increase heap size to 4GB
   - **Rationale**: Default 1.4GB insufficient for 330MB dataset + overhead
   - **Implementation**: `--max-old-space-size=4096` in startup scripts

### Memory Management

- **Single Load**: CSV loaded once at startup, cached in memory
- **Heap Optimization**: Increased Node.js heap size to 4GB
- **Efficient Parsing**: Streaming CSV reader with minimal memory footprint

### Response Time

- **In-Memory Search**: All data cached for fast lookups
- **Sorted Data**: Pre-sorted by IP ID for potential binary search upgrade
- **Minimal Processing**: Optimized search algorithms

### Concurrency

- **Fastify**: High-performance, low-overhead web framework
- **Stateless Design**: No shared state between requests
- **Efficient Caching**: Single service instance shared across requests

## 🔧 Configuration

### Environment Variables

```bash
PORT=3000                   # Server port (default: 3000)
NODE_ENV=development        # Environment mode
```

### Memory Settings

The application is configured with increased Node.js memory:

```bash
node --max-old-space-size=4096 # 4GB heap size for large CSV
```

## 📊 Performance Metrics

### Response Times

- **First Request**: ~8-10 seconds (CSV loading)
- **Subsequent Requests**: <100ms (cached data)
- **Average Response**: ~50ms for valid IPs

### Concurrency

- **Tested**: 100+ concurrent users
- **Framework**: Fastify handles high concurrency efficiently
- **Memory**: Stable memory usage with cached dataset

### Dataset

- **Records**: 2,979,950 IP ranges
- **File Size**: ~330MB CSV
- **Memory Usage**: ~400MB loaded in RAM
- **Coverage**: Global IP address ranges

## 🚦 API Examples

### Valid IP Lookup

```bash
curl "http://localhost:3000/api/ip/location?ip=8.8.8.8"
# Response: {"country":"United States of America","countryCode":"US","city":"Mountain View"}
```

### Invalid IP Format

```bash
curl "http://localhost:3000/api/ip/location?ip=invalid"
# Response: {"message":"Validation error.","issues":{...}}
```

### IP Not Found

```bash
curl "http://localhost:3000/api/ip/location?ip=192.168.1.1"
# Response: {"message":"Resource not found."}
```

## 🔍 Development

### Available Scripts

```bash
yarn dev                    # Development server with hot reload
yarn build                  # Build for production
yarn start                  # Start production server
yarn lint                   # Code linting with Biome
yarn test:unit:watch        # Watch mode for unit tests
yarn test:integration:watch # Watch mode for integration tests
```

### Development Workflow

1. **Start Development**: `yarn dev`
2. **Run Tests**: `yarn test:unit:watch`
3. **Test API**: Use curl or Postman
4. **Performance Test**: `yarn test:performance`
5. **Build**: `yarn build`

## 📈 Monitoring & Logging

### Request Logging

- **Fastify Logger**: Structured JSON logging
- **Request/Response Times**: Automatic timing
- **Error Tracking**: Detailed error information

### Performance Monitoring

- **CSV Load Time**: Tracked and logged
- **Search Performance**: Response time logging
- **Memory Usage**: Heap monitoring available

## 📝 License

MIT License
