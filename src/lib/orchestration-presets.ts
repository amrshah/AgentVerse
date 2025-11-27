import type { OrchestrationPreset, PresetAgent } from './types';

const generateAgentAvatars = (agents: Omit<PresetAgent, 'avatar' | 'avatarHint' | 'id' | 'constraints' | 'tools'>[]): Agent[] => {
    return agents.map((agent, index) => ({
        ...agent,
        id: `preset-agent-${Date.now()}-${index}`,
        constraints: '',
        tools: [],
        avatar: `https://picsum.photos/seed/${Math.random()}/200/200`,
        avatarHint: 'robot face',
    }));
}


export const ORCHESTRATION_PRESETS: OrchestrationPreset[] = [
  {
    id: 'preset-1',
    name: 'Social Media Campaign',
    description: 'Generate a complete social media campaign for a new product launch.',
    industry: 'Marketing',
    agents: [
      { name: 'Campaign Strategist', role: 'Team Lead', objectives: 'Define campaign goals, target audience, and key messaging.' },
      { name: 'Content Creator', role: 'Copywriter & Designer', objectives: 'Create engaging copy and visuals for posts across platforms.' },
      { name: 'Scheduler', role: 'Platform Manager', objectives: 'Develop a posting schedule and manage community engagement.' },
    ],
    task: 'Create a social media campaign plan for a new eco-friendly sneaker. Include 3 sample posts for Instagram and Twitter.',
  },
  {
    id: 'preset-2',
    name: 'Software Feature MVP Plan',
    description: 'Outline the plan for a new Minimum Viable Product (MVP) feature.',
    industry: 'Software Development',
    agents: [
      { name: 'Product Manager', role: 'Feature Definition', objectives: 'Write user stories and define acceptance criteria.' },
      { name: 'Lead Engineer', role: 'Technical Design', objectives: 'Create a high-level technical implementation plan and identify potential risks.' },
      { name: 'QA Analyst', role: 'Testing Strategy', objectives: 'Outline a test plan to ensure feature quality.' },
    ],
    task: 'Develop an MVP plan for adding a "dark mode" feature to a web application.',
  },
  {
    id: 'preset-3',
    name: 'Quarterly Financial Report',
    description: 'Analyze financial data and generate a summary report for stakeholders.',
    industry: 'Finance',
    agents: [
      { name: 'Data Analyst', role: 'Data Cruncher', objectives: 'Analyze raw financial data to identify key trends and anomalies.' },
      { name: 'Financial Storyteller', role: 'Report Writer', objectives: 'Translate data insights into a clear and concise narrative for the report.' },
      { name: 'Risk Assessor', role: 'Future Outlook', objectives: 'Identify potential financial risks and opportunities for the next quarter.' },
    ],
    task: 'Generate a quarterly financial report summary based on a set of mock financial data. Highlight key performance indicators.',
  },
  {
    id: 'preset-4',
    name: 'Patient Wellness Plan',
    description: 'Create a personalized wellness plan for a patient.',
    industry: 'Healthcare',
    agents: [
      { name: 'Dietitian', role: 'Nutrition Planner', objectives: 'Develop a balanced meal plan based on patient dietary needs.' },
      { name: 'Fitness Coach', role: 'Exercise Specialist', objectives: 'Create a suitable exercise regimen to improve physical health.' },
      { name: 'Mindfulness Guru', role: 'Mental Wellness Advisor', objectives: 'Suggest techniques for stress reduction and mental clarity.' },
    ],
    task: 'Create a 7-day wellness plan for a patient looking to improve energy levels and reduce stress.',
  },
  {
    id: 'preset-5',
    name: 'Blog Post Creation',
    description: 'Research and write a blog post on a specific topic.',
    industry: 'Content Creation',
    agents: [
      { name: 'SEO Specialist', role: 'Keyword Researcher', objectives: 'Identify primary and secondary keywords for the topic to improve search ranking.' },
      { name: 'Article Writer', role: 'Content Author', objectives: 'Write a well-structured, informative, and engaging blog post.' },
      { name: 'Editor', role: 'Proofreader', objectives: 'Review the article for grammar, spelling, and clarity.' },
    ],
    task: 'Write a 500-word blog post on the topic "The Benefits of Remote Work for Employee Well-being".',
  },
  {
    id: 'preset-6',
    name: 'E-commerce Product Launch',
    description: 'Plan the launch of a new product on an e-commerce platform.',
    industry: 'E-commerce',
    agents: [
      { name: 'Market Analyst', role: 'Competitor Research', objectives: 'Analyze competitor pricing and marketing strategies.' },
      { name: 'Listing Optimizer', role: 'Product Lister', objectives: 'Write a compelling product title, description, and bullet points.' },
      { name: 'Ad Campaign Manager', role: 'Promotions Lead', objectives: 'Outline a PPC ad campaign strategy to drive initial sales.' },
    ],
    task: 'Plan the e-commerce launch for a new artisanal coffee blend.',
  },
  {
    id: 'preset-7',
    name: 'Recruitment Funnel Strategy',
    description: 'Design a strategy to attract and hire a new employee.',
    industry: 'Human Resources',
    agents: [
      { name: 'Job Description Writer', role: 'Role Definer', objectives: 'Create a clear and appealing job description for the open role.' },
      { name: 'Sourcing Specialist', role: 'Talent Scout', objectives: 'Identify the best channels and methods to find qualified candidates.' },
      { name: 'Interviewer', role: 'Candidate Assessor', objectives: 'Develop a set of key interview questions to evaluate candidates.' },
    ],
    task: 'Design a recruitment strategy for hiring a "Senior Frontend Developer".',
  },
  {
    id: 'preset-8',
    name: 'Video Script for Explainer',
    description: 'Create a script for a short animated explainer video.',
    industry: 'Media',
    agents: [
      { name: 'Concept Artist', role: 'Storyteller', objectives: 'Outline the core message and narrative arc of the video.' },
      { name:
'Scriptwriter', role: 'Dialogue Writer', objectives: 'Write the voiceover script, keeping it concise and engaging.' },
      { name: 'Scene Director', role: 'Visual Planner', objectives: 'Describe the key visuals and animations for each part of the script.' },
    ],
    task: 'Create a 60-second video script explaining how blockchain technology works in simple terms.',
  },
];