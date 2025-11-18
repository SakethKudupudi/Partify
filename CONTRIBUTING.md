# Contributing to Partify

We appreciate your interest in contributing to Partify! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on the code, not the person
- Help others learn and improve

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL (via Supabase)
- Redis instance
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SakethKudupudi/Partify.git
   cd Partify
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../unified-portal
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Backend (.env.local)
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   REDIS_URL=your_redis_url
   NODE_ENV=development
   PORT=8080
   
   # Frontend (.env.local)
   VITE_API_URL=http://localhost:8080
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start
   
   # Terminal 2: Frontend
   cd unified-portal
   npm run dev
   ```

## Development Workflow

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation` - Documentation updates
- `refactor/component-name` - Code refactoring

### Commit Messages
Use clear, descriptive commit messages:
```
feature: add vendor status filtering for deactivated vendors
fix: resolve order items not displaying in customer details
docs: update API reference documentation
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commits
3. Test thoroughly (see Testing section)
4. Update documentation as needed
5. Submit PR with clear description
6. Address review feedback

## Testing

### Frontend Testing
```bash
cd unified-portal
npm run build  # Verify build succeeds
```

### Backend Testing
```bash
cd backend
npm test  # If tests exist
npm run lint  # Check code quality
```

### Manual Testing Checklist
- [ ] Feature works as described
- [ ] No console errors
- [ ] Responsive design (desktop, tablet, mobile)
- [ ] All related endpoints tested
- [ ] Database migrations applied

## Code Style

### JavaScript/React
- Use const/let instead of var
- Use arrow functions
- Add JSDoc comments for complex functions
- Follow existing code patterns

### SQL
- Use consistent formatting
- Add comments for complex queries
- Use migrations for schema changes

## Project Structure

```
Partify/
├── backend/                 # Express API server
│   ├── routes/             # API route handlers
│   ├── config/             # Configuration files
│   └── middleware/         # Custom middleware
├── unified-portal/         # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   └── store/          # State management
│   └── public/
├── database/               # Database files
│   ├── migrations/         # SQL migrations
│   ├── schema.sql          # Database schema
│   └── seed-users.sql      # Initial data
└── terraform/              # Infrastructure as Code
```

## Key Areas for Contribution

- **Frontend**: UI improvements, new features, bug fixes
- **Backend**: API enhancements, performance optimization
- **Database**: Schema improvements, migration support
- **Documentation**: README updates, API docs, guides
- **Testing**: Add unit and integration tests
- **DevOps**: CI/CD improvements, deployment optimization

## Common Issues

### Redis Connection Failed
- Verify Redis is running
- Check REDIS_URL environment variable
- Ensure Redis credentials are correct

### Database Migration Issues
- Review migration SQL syntax
- Check Supabase connectivity
- Verify service role key permissions

### API Port Already in Use
```bash
# Kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

## Performance Optimization

- Use React.memo for expensive components
- Implement pagination for large lists
- Cache API responses with Redis
- Optimize database queries with indexes

## Security Considerations

- Never commit sensitive credentials
- Validate user input on backend
- Use HTTPS in production
- Implement rate limiting
- Follow OWASP guidelines

## Questions?

- Check existing issues and documentation
- Create a new GitHub issue with detailed information
- Review similar pull requests for context

Thank you for contributing to Partify!
