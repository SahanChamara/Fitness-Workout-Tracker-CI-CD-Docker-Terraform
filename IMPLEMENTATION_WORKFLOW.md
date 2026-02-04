# 📋 Implementation Workflow Checklist

> **Print this or keep it visible while coding!**

---

## Before You Start Coding

- [ ] Read the task description in PRODUCTION_ROADMAP.md
- [ ] Understand the "what" and "why"
- [ ] Create a new branch: `git checkout -b [task-name]`
- [ ] Copy implementation template:
  ```bash
  cp docs/IMPLEMENTATION_LOG_TEMPLATE.md \
     docs/implementations/[number]-[task-name].md
  ```
- [ ] Fill out sections 1-2 (What & Why)

---

## While Coding

### Every 30 Minutes
- [ ] Test your changes
- [ ] Commit small, logical changes
- [ ] Update implementation doc with progress

### Document As You Go
- [ ] Update section 3: Implementation details
- [ ] Add code examples (before/after)
- [ ] Document challenges in section 6
- [ ] Record learning points in section 4

### Code Quality
- [ ] Follow naming conventions
- [ ] Add comments for complex logic
- [ ] No hardcoded values
- [ ] Proper error handling
- [ ] Clean up unused imports

---

## After Coding

### Testing
- [ ] Write unit tests
- [ ] Write integration tests (if applicable)
- [ ] Run all tests: `./mvnw test` (backend)
- [ ] Manual testing in browser
- [ ] Test error cases
- [ ] Document test results in section 5

### Documentation
- [ ] Complete section 5: Testing & Validation
- [ ] Fill section 7: Security Considerations
- [ ] Fill section 8: Performance Considerations
- [ ] Complete section 15: Reflection
- [ ] Update IMPLEMENTATION_INDEX.md

### Code Review
- [ ] Read through all changes
- [ ] Check for potential issues
- [ ] Ensure code quality checklist (section 14) is complete
- [ ] Run linter: `./mvnw checkstyle` or `npm run lint`

---

## Before Committing

- [ ] All tests passing
- [ ] No console errors
- [ ] No compiler warnings
- [ ] Implementation doc is complete
- [ ] IMPLEMENTATION_INDEX.md is updated
- [ ] Commit message is clear and descriptive:
  ```
  feat(security): implement JWT secret in environment variables
  
  - Moved hardcoded secret to .env
  - Updated JwtUtil to read from environment
  - Added validation for token expiry
  - Resolves security vulnerability #001
  
  Documented in: docs/implementations/001-jwt-security.md
  ```

---

## Final Checks

- [ ] Can you explain what you did to someone else?
- [ ] Did you learn something new?
- [ ] Is it documented in implementation log?
- [ ] Would future you understand this?
- [ ] Is the code production-ready?

---

## After Pushing

- [ ] Create pull request (if working with a team)
- [ ] Tag issue/task as completed
- [ ] Update progress in IMPLEMENTATION_INDEX.md
- [ ] Take a break! ☕

---

## Quick Commands Reference

### Backend
```bash
# Start backend
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build
./mvnw clean package

# Check style
./mvnw checkstyle:check
```

### Frontend
```bash
# Start dev server
npm run dev

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

### Git
```bash
# Create branch
git checkout -b feature/task-name

# Stage changes
git add .

# Commit
git commit -m "feat: description"

# Push
git push origin feature/task-name

# View changes
git diff
git status
```

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

---

## Common Mistakes to Avoid

❌ **Don't:** Start coding without understanding "why"  
✅ **Do:** Read the problem statement first

❌ **Don't:** Skip documentation until the end  
✅ **Do:** Document as you code

❌ **Don't:** Commit without testing  
✅ **Do:** Test before every commit

❌ **Don't:** Hardcode values  
✅ **Do:** Use configuration/constants

❌ **Don't:** Ignore errors and warnings  
✅ **Do:** Fix them immediately

❌ **Don't:** Skip the reflection section  
✅ **Do:** Think about what you learned

❌ **Don't:** Rush to finish  
✅ **Do:** Take time to do it right

---

## Learning Mindset Checklist

When stuck, ask yourself:

- [ ] What am I trying to achieve?
- [ ] Why isn't it working?
- [ ] What have I tried?
- [ ] What does the error message say?
- [ ] Can I break it into smaller steps?
- [ ] Have I checked the documentation?
- [ ] What can I learn from this?

---

## Daily Workflow

### Morning (Start of Day)
1. Review yesterday's progress
2. Check IMPLEMENTATION_INDEX.md
3. Pick next task from roadmap
4. Read task requirements
5. Create implementation doc
6. Start coding!

### Evening (End of Day)
1. Commit all work
2. Update implementation doc
3. Update IMPLEMENTATION_INDEX.md
4. Review what you learned
5. Plan tomorrow's tasks

---

## Remember

> **"Code is read more often than it's written."**

Write code that:
- Future you will understand
- Others can learn from
- Is well-documented
- Is properly tested
- Is production-ready

---

## Motivation

Each implementation makes you:
- 📈 A better developer
- 🧠 More knowledgeable
- 💪 More confident
- 🎯 Closer to production
- 🌟 More employable

**You've got this! 🚀**

---

## Emergency Contacts

- **Technical Analysis:** TECHNICAL_ANALYSIS.md
- **Roadmap:** PRODUCTION_ROADMAP.md
- **Quick Start:** QUICK_START.md
- **Environment Setup:** ENVIRONMENT_CONFIG.md
- **Implementation Guide:** docs/IMPLEMENTATION_GUIDE.md

---

**Version:** 1.0  
**Last Updated:** January 24, 2026
