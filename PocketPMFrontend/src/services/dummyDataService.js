// services/dummyDataService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if test mode is enabled
export const isTestModeEnabled = async () => {
  try {
    const testMode = await AsyncStorage.getItem('testMode');
    return testMode === 'true';
  } catch (error) {
    console.error('Error checking test mode:', error);
    return false;
  }
};

// Toggle test mode
export const setTestMode = async (enabled) => {
  try {
    await AsyncStorage.setItem('testMode', enabled ? 'true' : 'false');
    console.log(`🧪 Test mode ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error setting test mode:', error);
  }
};

// Simulate API delay for realistic testing
const simulateDelay = (min = 2000, max = 5000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Dummy data for comprehensive analysis
const getDummyComprehensiveAnalysis = (productName, productDescription) => {
  return `# ${productName} - Comprehensive Product Analysis

## 1. Idea Overview
**One-line description:** ${productName} is an innovative solution that leverages AI technology to transform how users approach ${productDescription.split(' ').slice(-3).join(' ')}.

**Target user persona:** Tech-savvy millennials and Gen Z users (ages 25-40) who value efficiency, personalization, and cutting-edge technology in their daily routines.

**Unique value proposition:** The first AI-powered platform that combines real-time data analysis with personalized recommendations, delivering 3x faster results than traditional alternatives.

## 2. Market & Competitive Landscape
**TAM/SAM/SOM:**
- Total Addressable Market (TAM): $45.2B globally
- Serviceable Addressable Market (SAM): $8.7B in target regions
- Serviceable Obtainable Market (SOM): $435M realistic 5-year potential

**Current competitors:**
1. **TechCorp Solutions** - Market leader with 35% share, focuses on enterprise
2. **InnovatePro** - Strong in mobile apps, 15% market share
3. **SmartSystems Inc** - B2B focused, 12% market share
4. **NextGen Tools** - Emerging player, 8% market share
5. **Traditional manual solutions** - Still 30% of market

**Key differentiators:** AI-first approach, superior user experience, 40% cost reduction, real-time analytics, and seamless integration capabilities.

## 3. Why Now
**Trends enabling success:**
- AI/ML adoption has reached 67% among target demographics
- Remote work has increased demand for digital solutions by 300%
- Mobile-first mentality drives 85% of user interactions
- Data privacy regulations favor transparent, user-controlled platforms

**Market timing:** Perfect storm of technological maturity, changed user behavior post-2020, and regulatory environment favoring innovation.

## 4. Pain Points Solved
**Primary frustrations addressed:**
- Time-consuming manual processes (saves 2-3 hours daily)
- Lack of personalization in existing solutions
- Poor integration between tools and platforms
- High costs of current alternatives (60% cost reduction)
- Inconsistent results and unreliable outcomes

## 5. A.C.P. Framework
**Audience:** Tech professionals, entrepreneurs, and digital natives who prioritize efficiency and innovation
**Channel:** Mobile app stores, LinkedIn marketing, tech conferences, and partner integrations
**Problem:** Fragmented, expensive, and time-intensive traditional approaches that don't leverage modern AI capabilities

## 6. Execution & Product Feasibility

**Execution Difficulty:** Medium-High complexity
- Technical: Advanced AI/ML implementation required
- Time to MVP: 6-8 months with dedicated team
- Team/skills: 8-10 developers, AI specialists, UX designers

**AI Suitability:** Highly suitable
- **Recommended models:** GPT-4 for natural language, Claude for analysis
- **APIs to integrate:** OpenAI API, Google Cloud AI, custom ML models
- **AI tools:** TensorFlow, PyTorch for custom models, Hugging Face transformers

**Methodology Fit:** Agile with Scrum framework
- 2-week sprints ideal for iterative development
- Continuous integration essential for AI model updates

**Prioritization Framework:** RICE methodology recommended
- **High Priority:** Core AI engine, user authentication, basic dashboard
- **Medium Priority:** Advanced analytics, integrations, mobile optimization
- **Low Priority:** Premium features, enterprise tools, advanced customization

**Sprint Plan:**
- **Weeks 1-2:** User research and technical architecture
- **Weeks 3-4:** Core AI integration and basic UI
- **Weeks 5-6:** User testing and feedback incorporation
- **Weeks 7-8:** Polish, bug fixes, and MVP finalization

**A/B Testing:** Test AI response variations, UI layouts, onboarding flows
**Success metrics:** User engagement (+40%), task completion rate (+60%), user satisfaction (4.5+ stars)

## 7. User & Customer Development

**Interview Type:** Validation-focused interviews to confirm product-market fit
**Where to find interviewees:** LinkedIn professional groups, Reddit communities, industry Slack channels, tech meetups

**Customer Development Stage:** Discovery to Validation transition
**User Personas:**
1. **Alex the Efficiency Expert** (Primary) - 28-35, values time-saving tools
2. **Sam the Small Business Owner** (Secondary) - 35-45, needs cost-effective solutions  
3. **Casey the Tech Enthusiast** (Early Adopter) - 25-32, loves trying new AI tools

## 8. Product Evaluation & Strategy

**Product Evaluation:**
- **Feasibility:** High - leverages existing AI technologies
- **Desirability:** Very High - addresses real pain points
- **Viability:** High - clear monetization path and strong market demand

**Best software type:** SaaS platform with mobile-first approach
**Go-To-Market Strategy:**
- **Early users:** Beta program with 100 power users
- **Distribution:** App stores, direct sales, partnership integrations
- **Monetization:** Freemium model with premium AI features ($19/month)

## 9. Launch Roadmap
**Phase 1:** Validation & MVP (Months 1-6)
**Phase 2:** Beta launch & iteration (Months 7-9)
**Phase 3:** Public launch & growth (Months 10-12)
**Phase 4:** Scale & expand features (Year 2)

**OKRs and KPIs:**
- **OKR 1:** Achieve 1,000 active users by month 6
- **OKR 2:** Reach $50K MRR by month 12
- **OKR 3:** Maintain 4.5+ app store rating
- **KPIs:** Daily active users, customer acquisition cost, lifetime value

## 10. Product Requirements Document (PRD)

**Problem Statement:** Current solutions are slow, expensive, and don't leverage AI effectively
**Target Audience:** Tech professionals seeking AI-powered efficiency tools
**Goals:** 
- **User Goals:** Save time, increase productivity, access AI insights
- **Business Goals:** $1M ARR by year 2, 10,000+ users, market leadership

**User Stories:**
- As a user, I want instant AI analysis so I can make faster decisions
- As a user, I want personalized recommendations so I get relevant insights
- As a user, I want seamless integrations so I don't switch between tools

**Success Metrics:** User retention >70%, NPS >50, CAC <$50

## 11. AI-Specific Design Requirements

**Data Strategy:** User data encrypted, GDPR compliant, minimal data collection
**Bias & Privacy:** Regular AI bias audits, transparent algorithms, user data control
**Model Performance:** <2 second response times, 95%+ accuracy targets
**UX for AI:** Clear AI explanations, confidence indicators, human oversight options
**Ethical Considerations:** Transparent AI usage, user consent, bias monitoring
**Cold Start:** Pre-trained models, example data, guided onboarding
**MLOps & Scaling:** Automated model retraining, A/B testing for AI improvements

## 12. Enablement & Internal Readiness

**Sales Enablement:** Product demo scripts, ROI calculators, competitive battle cards
**Customer Success:** Onboarding checklists, success metrics tracking, health scores
**Support Documentation:** AI feature explanations, troubleshooting guides, FAQs

---

**Executive Summary:** ${productName} represents a significant market opportunity with strong technical feasibility and clear user demand. The AI-first approach provides sustainable competitive advantages, while the freemium model enables rapid user acquisition. With proper execution, this could achieve $1M+ ARR within 18 months.

*This analysis was generated in Test Mode - No OpenAI API calls were made.*`;
};

// Dummy data for specialized deep dive analyses
const getDummySpecializedAnalysis = (productName, analysisType) => {
  const analyses = {
    market: `# Market Analysis: ${productName}

## MARKET SIZING & OPPORTUNITY

**Total Addressable Market (TAM): $45.2 Billion**
- Global market for AI-powered productivity tools
- Growing at 23% CAGR over next 5 years
- Driven by remote work trends and AI adoption

**Serviceable Addressable Market (SAM): $8.7 Billion**
- English-speaking markets (US, UK, Canada, Australia)
- Mid-market and enterprise segments
- Tech-forward industries and professionals

**Serviceable Obtainable Market (SOM): $435 Million**
- Realistic 5-year capture potential (5% of SAM)
- Based on team size and go-to-market strategy
- Conservative estimate with strong execution

**Market Growth Drivers:**
- 300% increase in remote work adoption
- $12B invested in AI startups in 2024
- 67% of professionals use AI tools weekly
- Government initiatives supporting AI innovation

## CUSTOMER SEGMENTATION

**Primary Segment: Tech Professionals (60% of market)**
- Demographics: Ages 25-40, $75K+ income, urban
- Pain points: Time management, tool fragmentation
- Willingness to pay: $20-50/month for productivity gains
- CAC: $35-45 through LinkedIn and content marketing

**Secondary Segment: Small Business Owners (25% of market)**
- Demographics: Ages 30-50, managing 5-50 employees
- Pain points: Cost efficiency, process automation
- Willingness to pay: $50-200/month for team tools
- CAC: $120-180 through partnership channels

**Tertiary Segment: Enterprise Teams (15% of market)**
- Demographics: 100+ employee companies, IT decision makers
- Pain points: Scalability, security, integration
- Willingness to pay: $500-2000/month for enterprise features
- CAC: $800-1500 through direct sales

## MARKET DYNAMICS

**Industry Growth Drivers:**
- AI technology maturation and accessibility
- Shift towards subscription software models
- Increasing data literacy among users
- Mobile-first workplace preferences

**Regulatory Environment:**
- GDPR compliance required for EU expansion
- AI governance frameworks emerging
- Data privacy regulations favor transparent platforms
- Industry standards developing for AI ethics

**Seasonal Trends:**
- Q1: Budget allocation season, high enterprise sales
- Q2-Q3: Steady growth, focus on product development
- Q4: End-of-year procurement, promotional campaigns

**Geographic Opportunities:**
- Phase 1: US market entry (largest opportunity)
- Phase 2: EU expansion (regulatory complexity)
- Phase 3: APAC markets (localization required)

## MARKET ENTRY STRATEGY

**Go-to-Market Timeline:**
- **Months 1-3:** Beta launch with 100 power users
- **Months 4-6:** Public launch in US market
- **Months 7-12:** Scale and optimize
- **Year 2:** International expansion

**Pricing Strategy:**
- **Freemium tier:** Basic features, 10 analyses/month
- **Professional:** $19/month, unlimited analyses + advanced features
- **Team:** $49/month per 5 users, collaboration tools
- **Enterprise:** Custom pricing, white-label options

**Distribution Channels:**
- **Direct (40%):** App stores, website, organic search
- **Partnerships (35%):** Integration with existing tools
- **Content Marketing (20%):** Blog, LinkedIn, podcasts
- **Paid Advertising (5%):** Targeted LinkedIn, Google ads

## VALIDATION FRAMEWORK

**Market Research Methods:**
- 200+ customer interviews across segments
- Competitive analysis and pricing benchmarking
- Survey deployment to 1,000+ target users
- Beta testing with cohort tracking

**Key Validation Metrics:**
- Product-market fit score >40% (must-have threshold)
- Net Promoter Score >50
- Monthly retention rate >70%
- Customer acquisition cost <$50 for freemium

**Pilot Market Recommendations:**
- **Primary:** San Francisco Bay Area (tech density)
- **Secondary:** Austin, TX (growing tech scene)
- **Tertiary:** Remote-first companies (distributed validation)

**Risk Mitigation:**
- Competitive response planning
- Economic downturn scenario planning
- Technology adoption delay contingencies
- Regulatory change adaptation strategies

*This specialized market analysis was generated in Test Mode.*`,

    competitive: `# Competitive Analysis: ${productName}

## COMPETITIVE LANDSCAPE MAPPING

**Direct Competitors (Head-to-Head)**

**1. TechCorp Solutions** - Market Leader
- Market share: 35% ($3.8B revenue)
- Pricing: $25-75/month per user
- Strengths: Enterprise relationships, robust features
- Weaknesses: Legacy UI, slow innovation, high pricing
- Customer base: 2.1M enterprise users
- Recent funding: $150M Series D in 2023

**2. InnovatePro** - Mobile-First Challenger  
- Market share: 15% ($1.6B revenue)
- Pricing: $15-45/month per user
- Strengths: Modern UI/UX, mobile optimization
- Weaknesses: Limited enterprise features, scaling issues
- Customer base: 850K SMB users
- Recent funding: $75M Series C in 2024

**3. SmartSystems Inc** - B2B Specialist
- Market share: 12% ($1.3B revenue)
- Pricing: $50-150/month per user
- Strengths: Deep integrations, industry expertise
- Weaknesses: Complex onboarding, narrow focus
- Customer base: 400K enterprise users

## INDIRECT COMPETITORS

**4. Manual/Traditional Solutions** - 30% market share
- Spreadsheets, basic tools, manual processes
- Opportunity: Education and migration strategy
- Threat level: Low (declining rapidly)

**5. Adjacent AI Tools** - Emerging threats
- ChatGPT plugins, Notion AI, Microsoft Copilot
- Growing rapidly but different use cases
- Threat level: Medium (watch for feature overlap)

## COMPETITOR DEEP-DIVE

**TechCorp Solutions Analysis:**
- **Financial Health:** Strong - $400M cash, profitable
- **Product Strategy:** Conservative, enterprise-focused
- **Technology Stack:** Legacy .NET, migrating to cloud
- **Team:** 1,200+ employees, stable leadership
- **Customer Reviews:** 3.8/5 stars - powerful but complex
- **Vulnerabilities:** Slow innovation, poor mobile experience

**InnovatePro Detailed Review:**
- **Financial Health:** Growing - $50M runway, break-even target 2025
- **Product Strategy:** Mobile-first, rapid iteration
- **Technology Stack:** Modern React Native, cloud-native
- **Team:** 150 employees, high growth mode
- **Customer Reviews:** 4.2/5 stars - loved UI, wants more features
- **Vulnerabilities:** Limited enterprise capabilities, resource constraints

## COMPETITIVE ADVANTAGE ANALYSIS

**Blue Ocean Opportunities:**
- **AI-First Architecture:** Most competitors retrofitting AI
- **Real-Time Collaboration:** Gap in current market
- **Industry-Specific Models:** Untapped specialization opportunity
- **Privacy-First Approach:** Competitive differentiator

**Unique Value Propositions:**
1. **Speed:** 5x faster analysis than competitors
2. **Accuracy:** AI models trained on industry data
3. **Integration:** Native connections to 50+ tools
4. **Cost:** 40% more affordable than enterprise solutions

**Defensible Moats:**
- **Data Network Effects:** More users = better AI models
- **Integration Ecosystem:** Hard to replicate partnerships
- **Brand Recognition:** First-mover in AI-native approach
- **Switching Costs:** Custom workflows and training

## POSITIONING STRATEGY

**Market Positioning Matrix:**
- **X-Axis:** Simple ↔ Advanced Features
- **Y-Axis:** Individual ↔ Enterprise Focus
- **Our Position:** Advanced features, Individual + SMB focus
- **White Space:** Advanced individual tools market

**Messaging Differentiation:**
- **vs. TechCorp:** "Modern AI vs. Legacy Technology"
- **vs. InnovatePro:** "Enterprise-Ready vs. Limited Scale"
- **vs. SmartSystems:** "User-Friendly vs. Complex Setup"
- **vs. Manual:** "AI-Powered vs. Time-Consuming"

**Feature Comparison Matrix:**
| Feature | Us | TechCorp | InnovatePro | SmartSystems |
|---------|----|---------|-----------| -------------|
| AI Analysis | ✅ Advanced | ❌ Basic | ❌ None | ❌ None |
| Mobile App | ✅ Native | ❌ Poor | ✅ Great | ❌ None |
| Enterprise SSO | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Real-time Collab | ✅ Yes | ❌ Limited | ✅ Basic | ❌ No |
| Custom Integrations | ✅ 50+ | ✅ 30+ | ❌ 15+ | ✅ 40+ |
| Pricing (per user) | $19-49 | $25-75 | $15-45 | $50-150 |

## COMPETITIVE RESPONSE SCENARIOS

**Scenario 1: TechCorp Adds AI Features**
- **Probability:** High (6-12 months)
- **Our Response:** Emphasize speed and modern UX
- **Preparation:** Accelerate feature development, patent key innovations

**Scenario 2: InnovatePro Raises Large Round**
- **Probability:** Medium (next 6 months)
- **Our Response:** Focus on enterprise features they lack
- **Preparation:** Build enterprise sales team early

**Scenario 3: New AI-Native Competitor Emerges**
- **Probability:** High (startup ecosystem)
- **Our Response:** Leverage first-mover advantage and user data
- **Preparation:** Strong IP strategy, rapid iteration

## COMPETITIVE INTELLIGENCE

**Monitoring Strategies:**
- **Product Changes:** Weekly competitor app reviews
- **Pricing Updates:** Monthly pricing page monitoring
- **Job Postings:** Quarterly hiring pattern analysis
- **Patent Filings:** Bi-annual IP landscape review
- **Customer Reviews:** Continuous sentiment analysis

**Early Warning Indicators:**
- Competitor hiring AI talent (threat level increase)
- Major funding announcements (aggressive expansion likely)
- Partnership announcements (market consolidation)
- Pricing changes (market positioning shifts)

**Tools for Intelligence Gathering:**
- **Competitors' Apps:** Regular feature audits
- **SimilarWeb:** Traffic and engagement metrics
- **LinkedIn:** Team growth and hiring patterns
- **Crunchbase:** Funding and investor tracking
- **App Store:** Review monitoring and rating analysis

*This specialized competitive analysis was generated in Test Mode.*`,

    technical: `# Technical Feasibility Analysis: ${productName}

## TECHNICAL ARCHITECTURE

**Recommended Tech Stack:**

**Frontend:**
- **Mobile:** React Native with TypeScript
- **Web:** Next.js with React 18
- **State Management:** Redux Toolkit + RTK Query
- **UI Components:** React Native Elements + custom design system

**Backend:**
- **API:** Node.js with Express/Fastify
- **Database:** PostgreSQL (primary) + Redis (caching)
- **Authentication:** Supabase Auth + JWT
- **File Storage:** AWS S3 with CloudFront CDN

**AI/ML Infrastructure:**
- **Primary AI:** OpenAI GPT-4 API
- **Secondary:** Anthropic Claude API (backup/comparison)
- **Custom Models:** PyTorch for specialized analysis
- **Vector Database:** Pinecone for semantic search
- **ML Pipeline:** MLflow for model management

**Cloud Infrastructure:**
- **Primary:** AWS (us-east-1, us-west-2)
- **Container Orchestration:** AWS ECS with Fargate
- **API Gateway:** AWS API Gateway + Lambda functions
- **Monitoring:** DataDog + AWS CloudWatch

## SYSTEM ARCHITECTURE DESIGN

**Microservices Architecture:**
\`\`\`
Mobile App ↔ API Gateway ↔ Core Services
                           ├── User Service
                           ├── Analysis Service  
                           ├── AI Processing Service
                           ├── Notification Service
                           └── Analytics Service
\`\`\`

**Data Flow:**
1. User submits product idea through mobile app
2. API Gateway routes request to Analysis Service
3. Analysis Service queues request in Redis
4. AI Processing Service handles OpenAI API calls
5. Results stored in PostgreSQL + cached in Redis
6. Real-time updates pushed via WebSocket

**Security Architecture:**
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Authentication:** OAuth 2.0 + PKCE flow
- **Authorization:** RBAC with JWT tokens
- **API Security:** Rate limiting, request validation
- **Data Privacy:** GDPR-compliant data handling

## DEVELOPMENT ROADMAP

**Phase 1: MVP Foundation (Months 1-2)**
- Core API development (user auth, basic analysis)
- React Native app setup and authentication
- OpenAI API integration
- Basic data models and database schema

**Phase 2: Core Features (Months 3-4)**
- Product analysis workflow
- AI prompt engineering and optimization
- User dashboard and history
- Basic error handling and logging

**Phase 3: Advanced Features (Months 5-6)**
- Deep dive analysis types
- Real-time collaboration features
- Advanced caching and performance optimization
- Comprehensive testing and QA

**Phase 4: Production Ready (Months 7-8)**
- Production infrastructure setup
- Security audit and penetration testing
- Performance optimization and load testing
- App store submission and approval

**Technical Milestones:**
- **Week 4:** Basic API endpoints functional
- **Week 8:** Mobile app MVP complete
- **Week 12:** AI analysis pipeline operational
- **Week 16:** Beta version ready for testing
- **Week 24:** Production launch ready

## INFRASTRUCTURE & OPERATIONS

**Cloud Infrastructure (AWS):**
- **Compute:** ECS Fargate (auto-scaling)
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis cluster
- **Storage:** S3 buckets with lifecycle policies
- **CDN:** CloudFront for global content delivery

**DevOps Pipeline:**
- **Version Control:** Git with GitHub
- **CI/CD:** GitHub Actions + AWS CodeDeploy
- **Testing:** Jest (unit), Cypress (e2e), Artillery (load)
- **Deployment:** Blue-green deployment strategy
- **Infrastructure as Code:** AWS CDK with TypeScript

**Monitoring & Observability:**
- **Application Monitoring:** DataDog APM
- **Log Management:** AWS CloudWatch Logs
- **Error Tracking:** Sentry for real-time error monitoring
- **Performance:** New Relic for application performance
- **Uptime Monitoring:** Pingdom for service availability

**Backup & Disaster Recovery:**
- **Database Backups:** Automated daily backups with 30-day retention
- **Code Backups:** Git repositories with multiple remotes
- **Infrastructure:** Multi-region deployment capability
- **Recovery Time Objective (RTO):** 2 hours
- **Recovery Point Objective (RPO):** 1 hour

## TEAM & RESOURCE PLANNING

**Technical Team Composition (8-10 people):**

**Core Development Team:**
- **1x Technical Lead/Architect** - Overall technical strategy
- **2x Full-Stack Developers** - API and web development
- **2x Mobile Developers** - React Native specialists
- **1x AI/ML Engineer** - AI integration and optimization
- **1x DevOps Engineer** - Infrastructure and deployment
- **1x QA Engineer** - Testing and quality assurance

**Additional Specialists:**
- **1x Security Engineer** (part-time/consultant)
- **1x Data Engineer** (for analytics pipeline)

**Skill Requirements:**
- **Must Have:** JavaScript/TypeScript, React Native, Node.js
- **AI Skills:** OpenAI API, prompt engineering, ML concepts
- **Cloud Skills:** AWS services, containerization, CI/CD
- **Mobile Skills:** App store deployment, mobile security

**Development Methodology:**
- **Framework:** Agile with Scrum
- **Sprint Length:** 2 weeks
- **Ceremonies:** Daily standups, sprint planning, retrospectives
- **Tools:** Jira for project management, Slack for communication

## RISK ASSESSMENT

**Technical Risks & Mitigation:**

**High Risk: OpenAI API Dependency**
- **Impact:** Service disruption if API fails
- **Mitigation:** Multiple AI provider integration (Claude, local models)
- **Probability:** Medium

**Medium Risk: Scaling Performance**
- **Impact:** Slow response times under high load
- **Mitigation:** Horizontal scaling, caching strategies, load balancing
- **Probability:** Medium

**Medium Risk: Mobile App Store Approval**
- **Impact:** Delayed launch if rejected
- **Mitigation:** Early app store guideline review, pre-submission testing
- **Probability:** Low

**Low Risk: Database Performance**
- **Impact:** Slow queries affecting user experience
- **Mitigation:** Database optimization, read replicas, query monitoring
- **Probability:** Low

**Integration Challenges:**
- **Third-party APIs:** Rate limiting, API changes, downtime
- **Mobile Platforms:** iOS/Android version compatibility
- **Cloud Services:** Service outages, configuration complexity

## COST ANALYSIS

**Development Costs (6-month MVP):**
- **Team Salaries:** $480,000 (8 people × $10K/month × 6 months)
- **Infrastructure/Tools:** $18,000 (AWS, monitoring, development tools)
- **Third-party Services:** $12,000 (OpenAI API, other APIs)
- **Total Development:** $510,000

**Infrastructure Costs (Monthly):**
- **AWS Services:** $2,500/month (compute, storage, networking)
- **Third-party APIs:** $1,200/month (OpenAI, monitoring, analytics)
- **SaaS Tools:** $800/month (development and productivity tools)
- **Total Monthly:** $4,500

**Scaling Cost Projections:**
- **1,000 users:** $4,500/month
- **10,000 users:** $12,000/month
- **100,000 users:** $35,000/month
- **Cost per user decreases with scale due to infrastructure efficiency**

**Performance Targets:**
- **API Response Time:** <500ms for 95% of requests
- **Mobile App Launch:** <3 seconds cold start
- **AI Analysis:** <30 seconds for comprehensive analysis
- **Uptime:** 99.9% availability (8.76 hours downtime/year)

*This specialized technical analysis was generated in Test Mode.*`,

    business: `# Business Model Analysis: ${productName}

## REVENUE STREAM PRIORITIZATION

**Primary Revenue (85% of total):**
- **Subscription Revenue:** SaaS model with monthly/annual plans
- **Professional Plan:** $19/month (individual users)
- **Team Plan:** $49/month per 5 users (small businesses)
- **Enterprise Plan:** Custom pricing $500-2000/month (large organizations)

**Secondary Revenue (10% of total):**
- **API Access:** $0.05 per analysis for developers
- **White-label Solutions:** $5,000 setup + 20% revenue share
- **Premium Add-ons:** Advanced analytics, custom integrations

**Tertiary Revenue (5% of total):**
- **Consulting Services:** Implementation and training
- **Data Insights:** Anonymized market research reports
- **Partnership Commissions:** Referral fees from integrated tools

**Pricing Strategy Deep Dive:**
- **Freemium Tier:** 10 analyses/month, basic features (user acquisition)
- **Professional:** $19/month, unlimited analyses, advanced features
- **Team:** $49/month per 5 users, collaboration tools, admin features
- **Enterprise:** Custom pricing, white-label, dedicated support, SLA

## FINANCIAL PROJECTIONS (5-Year)

**Year 1: Foundation & Growth**
- **Revenue:** $120,000 (monthly growth from $2K to $25K)
- **Users:** 2,500 total (150 paid subscribers by end of year)
- **COGS:** $36,000 (30% - mainly AI API costs)
- **Gross Margin:** 70% ($84,000)
- **Operating Expenses:** $650,000 (team, infrastructure, marketing)
- **Net Income:** -$566,000 (investment phase)

**Year 2: Scale & Optimization**
- **Revenue:** $850,000 (growing to $100K MRR)
- **Users:** 12,000 total (1,200 paid subscribers)
- **COGS:** $255,000 (30% maintained through efficiency gains)
- **Gross Margin:** 70% ($595,000)
- **Operating Expenses:** $1,200,000 (expanded team, aggressive growth)
- **Net Income:** -$605,000 (continued investment)

**Year 3: Profitability**
- **Revenue:** $2,400,000 (reaching $250K MRR)
- **Users:** 28,000 total (3,500 paid subscribers)
- **COGS:** $720,000 (30% with some enterprise efficiency)
- **Gross Margin:** 70% ($1,680,000)
- **Operating Expenses:** $1,450,000 (optimized operations)
- **Net Income:** $230,000 (first profitable year)

**Year 4: Expansion**
- **Revenue:** $5,200,000 (international expansion, $480K MRR)
- **Users:** 65,000 total (8,500 paid subscribers)
- **COGS:** $1,560,000 (economies of scale improving margins)
- **Gross Margin:** 70% ($3,640,000)
- **Operating Expenses:** $2,800,000 (international team, marketing)
- **Net Income:** $840,000

**Year 5: Market Leadership**
- **Revenue:** $9,800,000 (mature growth, $850K MRR)
- **Users:** 120,000 total (18,000 paid subscribers)
- **COGS:** $2,940,000 (30% maintained)
- **Gross Margin:** 70% ($6,860,000)
- **Operating Expenses:** $4,200,000 (R&D, global operations)
- **Net Income:** $2,660,000

## UNIT ECONOMICS

**Customer Lifetime Value (CLV) by Segment:**

**Professional Users:**
- **Monthly Revenue:** $19
- **Average Lifespan:** 24 months
- **Churn Rate:** 4% monthly
- **CLV:** $456 per customer

**Team Users:**
- **Monthly Revenue:** $49 (per 5-user team)
- **Average Lifespan:** 36 months
- **Churn Rate:** 2.5% monthly
- **CLV:** $1,764 per team

**Enterprise Users:**
- **Monthly Revenue:** $1,200 average
- **Average Lifespan:** 48 months
- **Churn Rate:** 1.5% monthly
- **CLV:** $57,600 per enterprise

**Customer Acquisition Cost (CAC) by Channel:**
- **Organic/SEO:** $15 per customer
- **Content Marketing:** $25 per customer
- **Paid Social (LinkedIn):** $45 per customer
- **Partnership Referrals:** $35 per customer
- **Direct Sales (Enterprise):** $800 per customer

**LTV:CAC Ratios:**
- **Professional:** 30:1 (organic), 10:1 (paid) - Excellent
- **Team:** 50:1 (organic), 39:1 (paid) - Outstanding
- **Enterprise:** 72:1 - Exceptional

## FUNDING REQUIREMENTS

**Total Capital Requirements by Stage:**

**Seed Round: $750,000** (Current need)
- **Use:** MVP development, initial team (6 months)
- **Runway:** 12 months to Series A metrics
- **Milestones:** 1,000 users, $25K MRR, product-market fit

**Series A: $3,000,000** (Month 12)
- **Use:** Scale team, growth marketing, international prep
- **Runway:** 24 months to profitability/Series B
- **Milestones:** $200K MRR, strong unit economics, market expansion

**Series B: $8,000,000** (Month 30 - Optional)
- **Use:** International expansion, enterprise features, acquisitions
- **Runway:** Path to IPO or acquisition
- **Milestones:** $1M+ MRR, market leadership position

**Use of Funds Breakdown (Seed Round):**
- **Product Development:** 40% ($300K) - Engineering team, infrastructure
- **Marketing & Sales:** 30% ($225K) - Customer acquisition, content marketing
- **Operations:** 20% ($150K) - Legal, accounting, office, tools
- **Working Capital:** 10% ($75K) - Buffer for unexpected expenses

**Investor Return Projections:**
- **Seed Investors:** 15-25x return potential (exit at $150M+ valuation)
- **Series A Investors:** 8-15x return potential
- **Exit Timeline:** 5-7 years via acquisition or IPO

## KEY FINANCIAL METRICS

**SaaS Metrics to Track:**

**Monthly Recurring Revenue (MRR) Growth:**
- **Year 1:** $2K → $25K MRR (1150% growth)
- **Year 2:** $25K → $100K MRR (300% growth)
- **Year 3:** $100K → $250K MRR (150% growth)
- **Target:** 15-20% month-over-month growth

**Annual Recurring Revenue (ARR):**
- **Year 1:** $300K ARR
- **Year 2:** $1.2M ARR
- **Year 3:** $3M ARR
- **Year 5:** $10M+ ARR

**Customer Acquisition Metrics:**
- **CAC Payback Period:** 6-12 months (target: <6 months)
- **Magic Number:** >1.0 (sales efficiency metric)
- **Net Revenue Retention:** >110% (expansion revenue)

**Profitability Metrics:**
- **Gross Margin:** 70% (industry benchmark: 75-85%)
- **Operating Margin:** Target 20%+ by Year 4
- **Rule of 40:** Growth rate + profit margin >40%

## SCENARIO PLANNING

**Best Case Scenario (+50% growth):**
- **Year 3 Revenue:** $3.6M (vs. $2.4M base case)
- **Path to profitability:** 6 months earlier
- **Valuation impact:** 2x higher exit valuation
- **Triggers:** Viral growth, major enterprise wins, competitor acquisition

**Base Case Scenario (as modeled):**
- **Steady growth following SaaS benchmarks**
- **Profitability in Year 3**
- **Strong unit economics maintained**

**Worst Case Scenario (-30% growth):**
- **Year 3 Revenue:** $1.7M (vs. $2.4M base case)
- **Extended runway needed:** Additional 6-12 months funding
- **Profitability delayed:** Year 4 instead of Year 3
- **Triggers:** Economic downturn, increased competition, execution challenges

**Sensitivity Analysis:**
- **10% increase in churn:** -$500K revenue impact by Year 3
- **20% increase in CAC:** Additional $300K funding needed
- **50% AI cost reduction:** +$360K profit impact by Year 3

## INVESTMENT THESIS

**Value Creation Drivers:**
1. **Large Market Opportunity:** $45B+ TAM with 23% growth
2. **Defensible Technology:** AI-first approach with data moats
3. **Strong Unit Economics:** 30:1+ LTV:CAC ratios
4. **Scalable Business Model:** Software margins with network effects
5. **Experienced Team:** Domain expertise and execution capability

**Scalability Factors:**
- **Technology:** Cloud-native architecture scales automatically
- **Team:** Remote-first culture enables global talent access
- **Market:** Multiple expansion vectors (geographic, vertical, product)
- **Capital Efficiency:** High gross margins fund growth internally

**Exit Strategy & Valuation:**
- **Strategic Acquirers:** Microsoft, Google, Salesforce, Adobe
- **Financial Buyers:** SaaS-focused growth equity and PE firms
- **Valuation Multiples:** 8-15x revenue (SaaS industry standard)
- **Exit Timeline:** 5-7 years, targeting $150M+ valuation

**Comparable Company Analysis:**
- **Notion:** $10B valuation, 20x revenue multiple
- **Airtable:** $11B valuation, 25x revenue multiple
- **Figma:** $20B acquisition, 40x revenue multiple
- **Our Target:** $150M-500M exit, 15-25x revenue multiple

*This specialized financial analysis was generated in Test Mode.*`
  };

  return analyses[analysisType] || analyses.market;
};

// Main function to get dummy analysis
export const getDummyAnalysis = async (productName, productDescription, analysisType = 'comprehensive') => {
  console.log('🧪 Using dummy data for testing - no OpenAI API calls made');
  
  // Simulate realistic API delay
  await simulateDelay(3000, 8000);
  
  let content;
  if (analysisType === 'comprehensive') {
    content = getDummyComprehensiveAnalysis(productName, productDescription);
  } else {
    content = getDummySpecializedAnalysis(productName, analysisType);
  }
  
  return {
    success: true,
    data: {
      analysis: content,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
        cost: 0
      }
    }
  };
};

// Export all functions
export default {
  isTestModeEnabled,
  setTestMode,
  getDummyAnalysis
}; 