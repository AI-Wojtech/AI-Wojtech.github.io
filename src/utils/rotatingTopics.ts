export type RotatingTopicType = "optimizely" | "ai";

export interface RotatingTopic {
  label: string;
  type: RotatingTopicType;
}

const isRotatingTopic = (topic: RotatingTopic | undefined): topic is RotatingTopic => Boolean(topic);

export const OPTIMIZELY_EXPERTISE_TOPICS: RotatingTopic[] = [
  { label: "Optimizely Commerce", type: "optimizely" },
  { label: "Product Recommendations", type: "optimizely" },
  { label: "Optimizely Data Platform", type: "optimizely" },
  { label: "Optimizely Opal AI", type: "optimizely" },
  { label: "Feature Experimentation", type: "optimizely" },
  { label: "Personalization", type: "optimizely" },
];

export const AI_EXPERTISE_TOPICS: RotatingTopic[] = [
  { label: "AI Agents & Skills", type: "ai" },
  { label: "Agentic Workflows", type: "ai" },
  { label: "Multi-Agent Systems", type: "ai" },
  { label: "Model Context Protocol", type: "ai" },
  { label: "AI API & Hooks", type: "ai" },
  { label: "Claude Code", type: "ai" },
];

export const ROTATING_EXPERTISE_TOPICS: RotatingTopic[] = Array.from(
  { length: Math.max(OPTIMIZELY_EXPERTISE_TOPICS.length, AI_EXPERTISE_TOPICS.length) },
  (_, index) => [OPTIMIZELY_EXPERTISE_TOPICS[index], AI_EXPERTISE_TOPICS[index]].filter(isRotatingTopic),
).flat();
