
import type { Agent } from './types';

export type OrchestrationPreset = {
  id: string;
  name: string;
  description: string;
  industry: string;
  agents: Pick<Agent, 'name' | 'role' | 'objectives'>[];
  task: string;
};

// Core agents for the new daily workflow
export const CORE_AGENTS: Pick<Agent, 'name' | 'role' | 'objectives' | 'id'>[] = [
  {
    id: 'agent-jack',
    name: 'Jack of All Trades',
    role: 'Your configurable, on-the-fly conversational assistant.',
    objectives: 'Assumes any persona or expertise defined by the user to answer questions and perform conversational tasks.'
  },
  {
    id: 'agent-ceo',
    name: 'CEO & Strategy Agent',
    role: 'Your strategic thought partner for high-level planning and decision-making.',
    objectives: 'Analyze projects, prioritize tasks based on ROI, and generate daily and long-term strategic plans.'
  },
  {
    id: 'agent-ops',
    name: 'Ops & Task Manager Agent',
    role: 'Your operational assistant to manage, track, and break down tasks.',
    objectives: 'Track task status (pending, blocked, done), break down large tasks into actionable steps with checklists, and manage deadlines.'
  },
  {
    id: 'agent-dev',
    name: 'Dev/Tech Agent',
    role: 'Your dedicated developer for all technical tasks.',
    objectives: 'Handle coding, debugging, system architecture, technical research, and API design.'
  },
  {
    id: 'agent-bd',
    name: 'BD & Marketing Agent',
    role: 'Your growth engine for business development and marketing.',
    objectives: 'Write proposals, SOPs, marketing emails, generate growth plans, and create pitch decks.'
  },
  {
    id: 'agent-creative',
    name: 'Creative & Design Agent',
    role: 'Your creative partner for content, branding, and design.',
    objectives: 'Write engaging content, brainstorm branding ideas, craft UX copy, and design pitch deck slides.'
  },
  {
    id: 'agent-lq',
    name: 'Lead Qualification Bot',
    role: 'Generates a chatbot persona for qualifying leads.',
    objectives: 'Create a persona and script for a lead qualification chatbot based on a business description.'
  },
    {
    id: 'agent-ts',
    name: 'Technical Support Bot',
    role: 'Generates a chatbot persona for technical support.',
    objectives: 'Create a persona and script for a technical support chatbot based on a product description.'
  },
  {
    id: 'agent-sam-writer',
    name: 'SAM Content Writer',
    role: 'Generates expert blog content following strict editorial guidelines.',
    objectives: 'Produce authoritative, consultant-grade blog posts for a full-service digital marketing agency.'
  }
];


export const ORCHESTRATION_PRESETS: OrchestrationPreset[] = [
    {
        id: 'preset-debug-1',
        name: 'Simple Greeting',
        description: 'A single agent says hello. Used for debugging orchestration flow.',
        industry: 'Testing',
        agents: [
          { name: 'Greeter', role: 'A friendly agent', objectives: 'Say hello to the world.' },
        ],
        task: 'Generate a simple "Hello, World!" message.',
    },
    {
        id: 'preset-1',
        name: 'Social Media Campaign',
        description: 'Generate a social media campaign for a new product.',
        industry: 'Marketing',
        agents: [
            { name: 'Marketing Strategist', role: 'Develops campaign strategy', objectives: 'Define target audience, key messaging, and campaign goals.'},
            { name: 'Content Creator', role: 'Creates social media posts', objectives: 'Write engaging copy and suggest imagery for Twitter, Instagram, and Facebook.'},
            { name: 'Social Media Manager', role: 'Schedules and manages posts', objectives: 'Create a content calendar and engagement strategy.'},
        ],
        task: 'Develop a comprehensive social media campaign plan for the launch of a new AI-powered productivity app called "Cognify". The plan should include a strategy, sample posts for three platforms, and a content calendar for the first week.'
    },
    {
        id: 'preset-digital-marketing-team',
        name: 'Digital Marketing Team',
        description: 'A versatile team for creating and executing a digital marketing strategy from scratch.',
        industry: 'Marketing',
        agents: [
            { name: 'SEO Specialist', role: 'Analyzes and improves search engine rankings.', objectives: 'Perform keyword research, analyze competitors, and suggest on-page and off-page SEO improvements.' },
            { name: 'Content Strategist', role: 'Plans and oversees all content creation.', objectives: 'Develop a content calendar, define topics, and ensure content aligns with brand voice and marketing goals.' },
            { name: 'Social Media Manager', role: 'Manages all social media channels.', objectives: 'Create engaging posts, interact with the community, and track performance metrics across platforms.' },
        ],
        task: 'Create a 3-month digital marketing strategy for a new online fitness coaching service. The strategy should focus on organic growth through SEO and social media engagement.'
    },
    {
        id: 'preset-2',
        name: 'Product Launch Plan',
        description: 'Create a detailed plan for launching a new tech product.',
        industry: 'Business',
        agents: [
            { name: 'Product Manager', role: 'Oversees the product strategy', objectives: 'Define product positioning, features, and roadmap.'},
            { name: 'Marketing Lead', role: 'Manages marketing efforts', objectives: 'Plan pre-launch, launch, and post-launch marketing activities.'},
            { name: 'PR Specialist', role: 'Handles public relations', objectives: 'Draft a press release and identify target media outlets.'},
        ],
        task: 'Create a go-to-market plan for a new smart home device that automates lighting and temperature. The plan should cover product positioning, marketing strategy, and a press release.'
    },
    {
        id: 'preset-3',
        name: 'Scientific Paper Summary',
        description: 'Research and summarize a complex scientific topic.',
        industry: 'Academia',
        agents: [
            { name: 'Lead Researcher', role: 'Gathers information from scientific databases', objectives: 'Find and analyze relevant papers on quantum computing advancements in the last year.'},
            { name: 'Science Writer', role: 'Summarizes findings for a general audience', objectives: 'Write a 500-word summary explaining the key breakthroughs in simple terms.'},
        ],
        task: 'Provide a summary of the latest advancements in quantum computing from the past year, accessible to a non-expert audience.'
    },
    {
        id: 'preset-4',
        name: 'Video Game Concept',
        description: 'Brainstorm a concept for a new video game.',
        industry: 'Gaming',
        agents: [
            { name: 'Game Designer', role: 'Designs the core gameplay mechanics', objectives: 'Outline the game genre, core loop, and unique selling points.'},
            { name: 'Narrative Writer', role: 'Creates the story and characters', objectives: 'Develop a compelling backstory, main characters, and plot outline.'},
            { name: 'Art Director', role: 'Defines the visual style', objectives: 'Describe the artistic direction, color palette, and overall mood.'},
        ],
        task: 'Brainstorm and outline a concept for a new open-world RPG set in a post-apocalyptic world where nature has reclaimed ancient cities. The concept should include gameplay mechanics, a story synopsis, and the visual style.'
    },
    {
        id: 'preset-5',
        name: 'Blog Post Generation',
        description: 'A team to research a topic and write an engaging blog post.',
        industry: 'Content Creation',
        agents: [
            { name: 'Topic Researcher', role: 'Gathers information, facts, and sources on a topic.', objectives: 'Compile a research brief with key points, statistics, and relevant links.' },
            { name: 'Blog Post Writer', role: 'Writes an engaging, SEO-friendly blog post.', objectives: 'Transform the research brief into a well-structured and readable article for a target audience.' }
        ],
        task: 'Write a 500-word blog post about the benefits of remote work for small business owners. The tone should be informative and encouraging.'
    },
    {
        id: 'preset-6',
        name: 'Financial Analysis Report',
        description: 'Analyze a fictional company\'s quarterly performance.',
        industry: 'Finance',
        agents: [
            { name: 'Financial Analyst', role: 'Analyzes financial data and market trends.', objectives: 'Review quarterly earnings reports, balance sheets, and cash flow statements to identify key performance indicators.' },
            { name: 'Report Writer', role: 'Writes a concise summary of the financial analysis.', objectives: 'Draft an executive summary outlining the key findings, including revenue growth, profitability, and potential risks.' }
        ],
        task: 'Generate a financial analysis report for "Innovate Corp" based on their latest quarterly earnings call transcript. Summarize the key financial highlights and provide a brief outlook for the next quarter.'
    },
    {
        id: 'preset-7',
        name: 'E-commerce Product Descriptions',
        description: 'Create compelling product descriptions for an online store.',
        industry: 'E-commerce',
        agents: [
            { name: 'SEO Specialist', role: 'Identifies relevant keywords and market positioning.', objectives: 'Research top keywords for "wireless earbuds" and analyze competitor product descriptions.' },
            { name: 'E-commerce Copywriter', role: 'Writes persuasive and descriptive product copy.', objectives: 'Write a 150-word product description for new noise-cancelling wireless earbuds, highlighting battery life, sound quality, and comfort. Include a bulleted list of key features.' }
        ],
        task: 'Create three unique product descriptions for a new line of high-end wireless earbuds named "Aura Buds". The descriptions should be tailored for a tech-savvy audience and highlight the product\'s premium features.'
    },
    {
        id: 'preset-8',
        name: 'Lesson Plan Creator',
        description: 'Generate a detailed lesson plan for a specific subject and grade level.',
        industry: 'Education',
        agents: [
            { name: 'Curriculum Specialist', role: 'Aligns the lesson with educational standards.', objectives: 'Identify the key learning objectives for a 5th-grade science lesson on the solar system.' },
            { name: 'Teacher\'s Aide', role: 'Creates engaging activities and assessments.', objectives: 'Design a hands-on activity where students build a model of the solar system, and create a 5-question quiz to assess their understanding.' }
        ],
        task: 'Create a 45-minute lesson plan for a 5th-grade science class about the planets in our solar system. The plan should include learning objectives, a list of materials, an engaging introductory activity, a main teaching section, and a short quiz.'
    }
];
