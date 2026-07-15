export type JourneyStop = {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  tags: string[];
  clients?: string[];
};

export const profile = {
  name: "Fikry Fahrezy Ramadhan",
  role: "Software Developer",
  location: "Kuningan, Indonesia",
  tagline:
    "Full-stack developer drifting between frontends that feel alive and backends that hold steady — five years of remote orbits across React, Vue, Go, and friends.",
  email: "fahrezyfikry@gmail.com",
  github: "https://github.com/fikryfahrezy",
  linkedin: "https://linkedin.com/in/fikryfahrezy",
};

export const now = {
  company: "Taiwan Mobile",
  role: "Software Developer · Contract",
  period: "Mar 2026 — Present",
  location: "Taipei, Taiwan · Remote",
  points: [
    "Built a CLI tool for bidirectional PostgreSQL ↔ MSSQL database migrations in .NET.",
    "Rewriting a core web app from legacy Java full-stack into React, TypeScript, Tailwind CSS, and Spring Boot.",
    "Shipped an internal operations web app with Vue and Spring Boot.",
    "Accelerating implementation, prototyping, and debugging with GitHub Copilot and Claude Code.",
  ],
  tags: [".NET", "React", "TypeScript", "Vue", "Spring Boot", "Tailwind CSS"],
};

export const journey: JourneyStop[] = [
  {
    id: "celerates",
    company: "Celerates",
    role: "Full-stack Developer",
    period: "May — Jul 2022",
    location: "Indonesia · Remote",
    summary:
      "Internal management apps with Next.js, Hono, and PostgreSQL — RFC-documented APIs, CI/CD on GitHub Actions, deployments with Docker and Caddy.",
    tags: ["Next.js", "Hono", "PostgreSQL", "Docker"],
  },
  {
    id: "efishery",
    company: "eFishery",
    role: "Frontend Developer",
    period: "Jul 2022 — Feb 2025",
    location: "Indonesia · Remote",
    summary:
      "Internal dashboards for harvest data and logistics in React — initiated unit testing with Vitest at ~85% coverage and kept SonarQube code smells consistently low.",
    tags: ["React", "TypeScript", "Vitest", "SonarQube"],
  },
  {
    id: "bythen",
    company: "bythen.ai",
    role: "Full-stack Developer",
    period: "Mar — May 2025",
    location: "Indonesia · Remote",
    summary:
      "Prototype platform in Nest.js and MySQL that shaped a real product decision, plus an LLM playground wiring OpenAI and Grok into RAG workflows.",
    tags: ["Nest.js", "MySQL", "OpenAI", "RAG"],
  },
  {
    id: "freelance",
    company: "Freelance",
    role: "Software Developer",
    period: "Jun 2025 — Feb 2026",
    location: "Remote",
    summary:
      "Four client orbits in nine months — a marketing questionnaire frontend, a driver app with a Go/Kafka API, a React Native homepage redesign, and a quiz microsite.",
    tags: ["React Native", "Go", "Kafka", "Next.js"],
    clients: [
      "FIFGROUP by Astra",
      "Darter.ai",
      "PT HM Sampoerna",
      "Wardah Beauty",
    ],
  },
  {
    id: "taiwan-mobile",
    company: "Taiwan Mobile",
    role: "Software Developer",
    period: "Mar 2026 — Present",
    location: "Taipei · Remote",
    summary:
      "Rewriting legacy Java into React and Spring Boot, building a .NET migration CLI, and shipping internal tools with Vue.",
    tags: [".NET", "React", "Spring Boot", "Vue"],
  },
];

export const skills = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Go", "SQL", "Swift", "Python", "Java"],
  },
  {
    group: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Vue.js",
      "Tailwind CSS",
      "TanStack Query",
      "Zustand",
      "SwiftUI",
    ],
  },
  {
    group: "Backend & Data",
    items: ["Node.js", "Hono", "PostgreSQL", "MySQL", "Kafka"],
  },
  {
    group: "Testing & Tooling",
    items: [
      "Vitest",
      "React Testing Library",
      "Git",
      "Docker",
      "GitHub Actions",
    ],
  },
  {
    group: "Spoken",
    items: ["Bahasa Indonesia — native", "English — intermediate"],
  },
];

export const education = {
  school: "Telkom University",
  degree: "Associate's Degree, Application Software Engineering",
  period: "Aug 2019 — Sep 2022",
};
