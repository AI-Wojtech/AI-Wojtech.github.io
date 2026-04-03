export type PostCardAppearance = {
  primaryTag: string;
  tagSlug: string;
  labelText: string;
};

export const getPostCardAppearance = (tags: string[] = []): PostCardAppearance => {
  const primaryTag = tags[0] ?? "";
  const tagSlugs = tags.map((tag) => tag.toLowerCase());
  const hasOptimizely = tagSlugs.includes("optimizely");
  const hasAI = tagSlugs.includes("ai");
  const isOptimizelyAI = hasOptimizely && hasAI;

  return {
    primaryTag,
    tagSlug: isOptimizelyAI ? "optimizely-ai" : primaryTag.toLowerCase(),
    labelText: isOptimizelyAI ? "OPTIMIZELY \u2022 AI" : primaryTag,
  };
};
