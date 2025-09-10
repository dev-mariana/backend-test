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

- Node.js 18+
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

## 🏗️ Architecture

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

## 🤝 Contributing

### Code Quality

- **TypeScript**: Strict type checking
- **ESLint/Biome**: Code linting and formatting
- **Testing**: Comprehensive test coverage required
- **Documentation**: Keep README and code comments updated

### Testing Requirements

- **Unit Tests**: All helpers and services must have tests
- **Integration Tests**: API endpoints must be tested
- **Performance Tests**: K6 tests for load validation

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- **IP2Location**: For providing the IP geolocation dataset
- **Fastify**: High-performance web framework
- **Vitest**: Modern testing framework
- **K6**: Load testing tool
