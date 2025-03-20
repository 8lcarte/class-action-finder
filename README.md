# Class Action Lawsuit Finder

A web application for finding and managing class action lawsuits.

## Features

- Enhanced Lawsuit Search Engine
- Interactive User Onboarding
- Intelligent Claim Management
- Advanced Data Acquisition
- Comprehensive Notifications
- Advanced Analytics

## Installation

```bash
npm install class-action-finder
# or
yarn add class-action-finder
# or
pnpm add class-action-finder
```

## Environment Setup

1. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=your_redis_url
ELASTICSEARCH_URL=your_elasticsearch_url
```

2. Configure your database by running migrations:

```bash
npm run db:migrate
npm run db:seed  # Optional: Add sample data
```

## Usage

```typescript
import { LawsuitFinder } from 'class-action-finder';

// Initialize the finder
const finder = new LawsuitFinder({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
});

// Search for lawsuits
const results = await finder.search({
  query: 'consumer protection',
  location: 'California',
  category: 'Product Liability'
});
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Docker Support

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:migrate
```

## Documentation

- [Admin Guide](docs/admin-guide.md)
- [API Documentation](docs/api-documentation.yaml)
- [Architecture](docs/architecture_diagram.md)
- [Database Schema](docs/database-schema.md)
- [Deployment Guide](docs/deployment-maintenance-guide.md)
- [Project Handover](docs/project-handover.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@classactionfinder.com or open an issue on GitHub.
