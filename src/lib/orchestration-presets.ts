
import type { OrchestrationPreset, PresetAgent } from './types';

export const ORCHESTRATION_PRESETS: OrchestrationPreset[] = [
  // Marketing
  {
    id: 'preset-mktg-1',
    name: 'Social Media Campaign Architect',
    description: 'Generate a complete social media campaign for a new product launch.',
    industry: 'Marketing',
    agents: [
      { name: 'Trend Researcher', role: 'Market Analyst', objectives: 'Identify current market trends, competitor activities, and relevant hashtags.' },
      { name: 'Audience Profiler', role: 'Demographics Expert', objectives: 'Define the primary and secondary target audience personas for the campaign.' },
      { name: 'Creative Writer', role: 'Copywriting Specialist', objectives: 'Craft compelling and platform-specific copy (e.g., for Twitter, Instagram, LinkedIn).' },
      { name: 'Offer Strategist', role: 'Promotions Planner', objectives: 'Design a launch offer or promotion to drive initial engagement and sales.' },
      { name: 'Channel Planner', role: 'Media Strategist', objectives: 'Select the best social media channels and content formats for the target audience.' },
      { name: 'Scheduler', role: 'Community Manager', objectives: 'Create a detailed content calendar and outline a community engagement strategy.' },
      { name: 'QA Editor', role: 'Proofreader', objectives: 'Review all content for tone, grammar, and brand alignment.' },
    ],
    task: 'Develop a comprehensive social media launch plan for a new brand of eco-friendly, direct-to-consumer bottled water called "AquaPure". The output should be a full go-to-market strategy, a one-week content calendar, and messaging frameworks.',
  },
  {
    id: 'preset-mktg-2',
    name: 'SEO Blog Post Generator',
    description: 'Create a long-form, SEO-optimized article to attract organic traffic.',
    industry: 'Marketing',
    agents: [
      { name: 'SEO Specialist', role: 'Keyword Researcher', objectives: 'Identify a primary keyword and several secondary keywords. Analyze SERP for user intent.' },
      { name: 'Outliner', role: 'Content Architect', objectives: 'Create a detailed, SEO-friendly outline with H1, H2s, and H3s based on the target keywords.' },
      { name: 'Article Writer', role: 'Content Author', objectives: 'Write an engaging, in-depth article based on the provided outline.' },
      { name: 'Editor', role: 'Proofreader & Fact-Checker', objectives: 'Review the article for grammar, spelling, clarity, and factual accuracy.' },
    ],
    task: 'Write a 1500-word blog post on the topic "The Ultimate Guide to Financial Planning for Freelancers".',
  },
    {
    id: 'preset-mktg-3',
    name: 'Email Nurture Sequence',
    description: 'Design a multi-part email sequence to nurture new leads.',
    industry: 'Marketing',
    agents: [
      { name: 'Strategist', role: 'Funnel Designer', objectives: 'Outline a 5-part email sequence with a clear goal for each email (e.g., welcome, problem-agitate, solution, social proof, call-to-action).' },
      { name: 'Copywriter', role: 'Email Scripter', objectives: 'Write the subject lines and body copy for all 5 emails in the sequence.' },
      { name: 'Personalization Expert', role: 'Dynamic Content Planner', objectives: 'Suggest opportunities for personalization using subscriber data (e.g., name, company, interest).' },
    ],
    task: 'Create a 5-part email nurture sequence for new subscribers who downloaded an ebook titled "Introduction to AI".',
  },
  {
    id: 'preset-mktg-4',
    name: 'PPC Ad Campaign Builder',
    description: 'Structure a Google Ads campaign with ad groups and ad copy.',
    industry: 'Marketing',
    agents: [
      { name: 'Keyword Analyst', role: 'Search Term Specialist', objectives: 'Research and group relevant keywords into 3-5 tightly-themed ad groups.' },
      { name: 'Ad Copywriter', role: 'Ad Creator', objectives: 'Write two compelling headlines and one description for each ad group.' },
      { name: 'Landing Page Advisor', role: 'Conversion Optimizer', objectives: 'Provide recommendations for the landing page to ensure message match and high conversion rate.' },
    ],
    task: 'Build a Google Ads campaign structure for a company selling online coding bootcamps.',
  },

  // Software Engineering
  {
    id: 'preset-eng-1',
    name: 'Technical Specification Writer',
    description: 'Translate product requirements into a detailed technical spec for a new feature.',
    industry: 'Software Engineering',
    agents: [
      { name: 'Requirements Refiner', role: 'Product Liaison', objectives: 'Clarify user stories and break them down into functional requirements.' },
      { name: 'System Architect', role: 'High-Level Designer', objectives: 'Define the high-level architecture, data models, and system interactions.' },
      { name: 'API Blueprint Writer', role: 'API Designer', objectives: 'Design the necessary API endpoints, including request/response schemas.' },
      { name: 'QA Reviewer', role: 'Test Planner', objectives: 'Outline potential edge cases and formulate a preliminary testing strategy.' },
    ],
    task: 'Create a detailed technical specification for adding a "user profile picture upload" feature to a web application. Assume the backend is Node.js and the frontend is React.',
  },
  {
    id: 'preset-eng-2',
    name: 'Code Review Assistant',
    description: 'Perform a simulated code review on a block of code.',
    industry: 'Software Engineering',
    agents: [
      { name: 'Logic Checker', role: 'Algorithm Analyst', objectives: 'Analyze the code for logical errors, efficiency, and adherence to requirements.' },
      { name: 'Style Guide Enforcer', role: 'Linter', objectives: 'Check the code against standard style guides (e.g., PEP 8 for Python, Prettier for JS) for readability and consistency.' },
      { name: 'Security Analyst', role: 'Vulnerability Scanner', objectives: 'Scan the code for common security vulnerabilities (e.g., injection attacks, improper error handling).' },
    ],
    task: 'Perform a code review on a provided Python function that takes a user ID and fetches their data from a database. Identify potential bugs, style issues, and security concerns.',
  },
  {
    id: 'preset-eng-3',
    name: 'Test Case Generator',
    description: 'Generate a suite of test cases based on feature requirements.',
    industry: 'Software Engineering',
    agents: [
      { name: 'Requirement Parser', role: 'Spec Reader', objectives: 'Break down the feature specification into individual testable units.' },
      { name: 'Unit Test Writer', role: 'Unit Tester', objectives: 'Write unit test descriptions for each function or component.' },
      { name: 'Integration Test Designer', role: 'System Tester', objectives: 'Design integration tests that verify interactions between different parts of the feature.' },
      { name: 'Edge Case Specialist', role: 'Chaos Engineer', objectives: 'Brainstorm and document edge cases, boundary conditions, and potential failure modes.' },
    ],
    task: 'Generate a comprehensive suite of test cases (unit, integration, and edge cases) for a user login form with "email" and "password" fields.',
  },
  {
    id: 'preset-eng-4',
    name: 'Database Schema Designer',
    description: 'Design a relational database schema from a high-level description.',
    industry: 'Software Engineering',
    agents: [
        { name: 'Entity Identifier', role: 'Data Modeler', objectives: 'Identify the main entities, their attributes, and primary keys from the description.' },
        { name: 'Relationship Mapper', role: 'Database Architect', objectives: 'Define the relationships between entities (one-to-one, one-to-many, many-to-many) and establish foreign keys.' },
        { name: 'Normalization Expert', role: 'DBA', objectives: 'Ensure the schema is normalized to at least 3rd Normal Form (3NF) to reduce data redundancy.' },
    ],
    task: 'Design a SQL database schema for a simple blog application with users, posts, and comments. Provide the CREATE TABLE statements.',
  },

  // Product Management
  {
    id: 'preset-pm-1',
    name: 'User Story & PRD Creator',
    description: 'Generate user stories and a concise Product Requirements Document (PRD).',
    industry: 'Product Management',
    agents: [
      { name: 'User Persona Analyst', role: 'Empathy Mapper', objectives: 'Analyze the target user and articulate their needs and pain points.' },
      { name: 'Feature Ideator', role: 'Brainstormer', objectives: 'Generate a set of user stories with clear "As a user, I want to..." formats.' },
      { name: 'Acceptance Criteria Definer', role: 'QA Liaison', objectives: 'Write clear, testable acceptance criteria for each user story.' },
      { name: 'PRD Compiler', role: 'Documentarian', objectives: 'Assemble the user stories and criteria into a one-page PRD, including success metrics.' },
    ],
    task: 'Create a set of user stories and a one-page PRD for an MVP feature that allows users of a project management tool to attach files to tasks.',
  },
  {
    id: 'preset-pm-2',
    name: 'Competitive Analysis Report',
    description: 'Create a report analyzing a competitor\'s product.',
    industry: 'Product Management',
    agents: [
      { name: 'Feature Auditor', role: 'Product Explorer', objectives: 'Identify and list the key features of the competitor\'s product.' },
      { name: 'SWOT Analyst', role: 'Strategist', objectives: 'Perform a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) on the competitor.' },
      { name: 'UX Reviewer', role: 'User Advocate', objectives: 'Provide a qualitative review of the competitor\'s user experience and design.' },
    ],
    task: 'Perform a competitive analysis of the project management tool "Asana". The output should be a report detailing its key features, a SWOT analysis, and a UX review.',
  },
  {
    id: 'preset-pm-3',
    name: 'Product Roadmap Draft',
    description: 'Draft a quarterly product roadmap based on strategic themes.',
    industry: 'Product Management',
    agents: [
      { name: 'Theme Interpreter', role: 'Strategy Analyst', objectives: 'Break down high-level strategic themes (e.g., "Improve User Engagement") into potential feature areas.' },
      { name: 'Prioritization Expert', role: 'RICE/ICE Scorer', objectives: 'Score and rank the potential features based on a prioritization framework like RICE or ICE.' },
      { name: 'Roadmap Visualizer', role: 'Planner', objectives: 'Organize the prioritized features into a visual, theme-based quarterly roadmap (e.g., Now, Next, Later).' },
    ],
    task: 'Draft a quarterly product roadmap for a mobile banking app. The strategic themes are: 1) Enhance Security, 2) Improve User Engagement, and 3) Streamline Payments.',
  },
  {
    id: 'preset-pm-4',
    name: 'User Interview Script Writer',
    description: 'Generate a script for conducting user discovery interviews.',
    industry: 'Product Management',
    agents: [
      { name: 'Goal Setter', role: 'Research Planner', objectives: 'Define the key learning objectives for the user interview.' },
      { name: 'Question Drafter', role: 'Interviewer', objectives: 'Draft a mix of open-ended, non-leading questions to uncover user behaviors, pain points, and motivations.' },
      { name: 'Script Finalizer', role: 'Moderator', objectives: 'Organize the questions into a logical flow, including an introduction, warm-up questions, main questions, and a wrap-up.' },
    ],
    task: 'Create a user interview script to understand how small business owners currently handle their invoicing and billing.',
  },

  // Finance
  {
    id: 'preset-fin-1',
    name: 'Quarterly Financial Summary',
    description: 'Analyze financial data and generate a summary report for stakeholders.',
    industry: 'Finance',
    agents: [
      { name: 'Data Analyst', role: 'Data Cruncher', objectives: 'Analyze raw financial data (revenue, expenses, profit) to identify key trends and calculate percentage changes.' },
      { name: 'KPI Tracker', role: 'Metrics Specialist', objectives: 'Highlight Key Performance Indicators (KPIs) like Gross Margin, Net Profit Margin, and Customer Acquisition Cost.' },
      { name: 'Financial Storyteller', role: 'Report Writer', objectives: 'Translate data insights into a clear and concise narrative for an executive summary.' },
      { name: 'Risk Assessor', role: 'Future Outlook Analyst', objectives: 'Identify potential financial risks and opportunities for the upcoming quarter based on the data.' },
    ],
    task: 'Generate a quarterly financial report summary based on a set of mock financial data. Provide an executive summary, KPI analysis, and a brief risk/opportunity assessment.',
  },
  {
    id: 'preset-fin-2',
    name: 'Investment Memo Builder',
    description: 'Draft an investment memo for a potential startup investment.',
    industry: 'Finance',
    agents: [
      { name: 'Company Profiler', role: 'Due Diligence Analyst', objectives: 'Summarize the startup\'s business model, product, and target market.' },
      { name: 'Market Analyst', role: 'Industry Researcher', objectives: 'Analyze the market size, growth potential, and competitive landscape.' },
      { name: 'Deal Evaluator', role: 'VC Associate', objectives: 'Outline the investment thesis, potential risks, and proposed deal terms.' },
    ],
    task: 'Draft a standard venture capital investment memo for a fictional AI-powered SaaS startup called "SynthAI" that automates customer support.',
  },
  {
    id: 'preset-fin-3',
    name: 'Personal Budget Planner',
    description: 'Create a personalized monthly budget based on income and expenses.',
    industry: 'Finance',
    agents: [
      { name: 'Income Calculator', role: 'Revenue Analyst', objectives: 'Calculate total monthly after-tax income.' },
      { name: 'Expense Categorizer', role: 'Spending Tracker', objectives: 'Categorize a list of expenses into fixed (rent, utilities) and variable (groceries, entertainment) buckets.' },
      { name: 'Budget Allocator', role: 'Financial Planner', objectives: 'Allocate income according to a 50/30/20 budget rule (50% needs, 30% wants, 20% savings) and provide recommendations.' },
    ],
    task: 'Create a personalized monthly budget plan for a user with a monthly after-tax income of $5,000 and a provided list of expenses.',
  },
  {
    id: 'preset-fin-4',
    name: 'Stock Performance Analysis',
    description: 'Provide a summary of a public company\'s recent stock performance.',
    industry: 'Finance',
    agents: [
        { name: 'News Analyst', role: 'Information Gatherer', objectives: 'Summarize recent news and events related to the company.' },
        { name: 'Financials Reviewer', role: 'SEC Filing Reader', objectives: 'Extract key metrics from the latest quarterly report (revenue, EPS, guidance).' },
        { name: 'Analyst Consensus Aggregator', role: 'Market Sentiment Analyst', objectives: 'Summarize the general analyst consensus on the stock (e.g., Buy, Hold, Sell).' },
    ],
    task: 'Provide a stock performance analysis for a major public tech company (e.g., Apple Inc. - AAPL). Include a summary of recent news, key financial metrics, and analyst ratings.',
  },
  
  // Healthcare/Wellness
  {
    id: 'preset-hc-1',
    name: 'Patient Wellness Plan Generator',
    description: 'Create a personalized 7-day wellness plan for a patient.',
    industry: 'Healthcare',
    agents: [
      { name: 'Dietitian', role: 'Nutrition Planner', objectives: 'Develop a balanced 7-day meal plan based on patient dietary needs and goals (e.g., weight loss, more energy).' },
      { name: 'Fitness Coach', role: 'Exercise Specialist', objectives: 'Create a suitable 7-day exercise regimen, including a mix of cardio, strength, and flexibility.' },
      { name: 'Mindfulness Guru', role: 'Mental Wellness Advisor', objectives: 'Suggest daily techniques for stress reduction and mental clarity, such as meditation or journaling prompts.' },
    ],
    task: 'Create a holistic 7-day wellness plan for a 35-year-old office worker whose goals are to lose 5 pounds and reduce work-related stress.',
  },
  {
    id: 'preset-hc-2',
    name: 'Medical Symptom Initial Triage',
    description: 'Provide a general, non-diagnostic triage based on symptoms.',
    industry: 'Healthcare',
    agents: [
      { name: 'Symptom Collector', role: 'Intake Specialist', objectives: 'Ask clarifying questions about the presented symptoms (e.g., duration, severity, location).' },
      { name: 'Information Provider', role: 'Medical Librarian', objectives: 'Provide general information about conditions commonly associated with the symptoms, with a strong disclaimer that this is not medical advice.' },
      { name: 'Next Steps Advisor', role: 'Care Navigator', objectives: 'Suggest appropriate next steps, such as contacting a healthcare professional, visiting an urgent care clinic, or monitoring symptoms at home.' },
    ],
    task: 'A user reports symptoms of a "sore throat and mild fever for 2 days". Perform an initial informational triage and suggest possible next steps. Must include prominent disclaimers to consult a doctor.',
  },
    {
    id: 'preset-hc-3',
    name: 'Fitness Goal Setter',
    description: 'Help a user define a SMART fitness goal.',
    industry: 'Healthcare',
    agents: [
      { name: 'Goal Clarifier', role: 'Motivator', objectives: 'Translate a vague goal (e.g., "get fit") into a specific objective (e.g., "run a 5k").' },
      { name: 'SMART Framework Applier', role: 'Goal Analyst', objectives: 'Break the specific objective down into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound).' },
      { name: 'First Steps Planner', role: 'Onboarding Coach', objectives: 'Outline the first 3-5 concrete steps the user can take to start working towards their new SMART goal.' },
    ],
    task: 'A user states their goal is to "get stronger". Help them formulate a SMART goal and outline the first few steps to get started.',
  },
  {
    id: 'preset-hc-4',
    name: 'Medication Information Explainer',
    description: 'Explain a medication in simple, easy-to-understand terms.',
    industry: 'Healthcare',
    agents: [
      { name: 'Purpose Explainer', role: 'Pharmacology Educator', objectives: 'Explain what the medication is used for and its mechanism of action in simple terms.' },
      { name: 'Dosage & Administration Guide', role: 'Nurse Practitioner', objectives: 'Clearly state how and when the medication should be taken.' },
      { name: 'Side Effect Lister', role: 'Patient Safety Advocate', objectives: 'List common and serious side effects, and what to do if they occur. Include disclaimers.' },
    ],
    task: 'Explain the common medication "Ibuprofen" to a patient in plain language, covering its purpose, how to take it, and common side effects. Must include a disclaimer to consult a doctor or pharmacist.',
  },
];

    