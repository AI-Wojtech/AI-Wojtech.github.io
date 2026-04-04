export type RotatingTopicType = "optimizely" | "ai";

export interface RotatingTopic {
  label: string;
  type: RotatingTopicType;
}

const isRotatingTopic = (topic: RotatingTopic | undefined): topic is RotatingTopic => Boolean(topic);

export const OPTIMIZELY_EXPERTISE_TOPICS: RotatingTopic[] = [
  { label: "Search & Navigation", type: "optimizely" },
  { label: "Optimizely CMS", type: "optimizely" },
  { label: "Optimizely Commerce", type: "optimizely" },
  { label: "Personalization", type: "optimizely" },
  { label: "Experimentation", type: "optimizely" },
  { label: "ODP Audiences", type: "optimizely" },
  { label: "Product Recommendations", type: "optimizely" },
  { label: "Feature Flags", type: "optimizely" },
  { label: "Opal AI", type: "optimizely" },
  { label: "Visitor Groups", type: "optimizely" },
  { label: "Commerce Connect", type: "optimizely" },
  { label: "Catalog Integrations", type: "optimizely" },
  { label: "Multi-site Platforms", type: "optimizely" },
  { label: "Optimizely Graph", type: "optimizely" },
];

export const AI_EXPERTISE_TOPICS: RotatingTopic[] = [
  { label: "AI Skills", type: "ai" },
  { label: "AI Agents", type: "ai" },
  { label: "MCP Servers", type: "ai" },
  { label: "Claude Code", type: "ai" },
  { label: "Context Engineering", type: "ai" },
  { label: "Prompt Engineering", type: "ai" },
  { label: "Agentic Workflows", type: "ai" },
  { label: "LLM Integrations", type: "ai" },
  { label: "AI-Assisted Delivery", type: "ai" },
  { label: "OpenAI APIs", type: "ai" },
  { label: "RAG Patterns", type: "ai" },
  { label: "Multi-Agent Systems", type: "ai" },
  { label: "Workflow Automation", type: "ai" },
  { label: "AI Code Review", type: "ai" },
];

export const ROTATING_EXPERTISE_TOPICS: RotatingTopic[] = Array.from(
  { length: Math.max(OPTIMIZELY_EXPERTISE_TOPICS.length, AI_EXPERTISE_TOPICS.length) },
  (_, index) => [OPTIMIZELY_EXPERTISE_TOPICS[index], AI_EXPERTISE_TOPICS[index]].filter(isRotatingTopic),
).flat();
