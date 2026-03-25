import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type BlogPost = {
  id: string;
  filePath?: string;
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    draft: boolean;
  };
};

function getPostSourcePath(post: BlogPost) {
  if (post.filePath) {
    return path.join(process.cwd(), post.filePath);
  }

  return path.join(process.cwd(), "src", "content", "blog", `${post.id}.md`);
}

function getPostGitPath(post: BlogPost) {
  return (post.filePath ?? path.join("src", "content", "blog", `${post.id}.md`)).replaceAll("\\", "/");
}

export async function getPostRssDate(post: BlogPost) {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["log", "--diff-filter=A", "--follow", "--format=%cI", "--", getPostGitPath(post)],
      { cwd: process.cwd() }
    );

    const firstCommitDate = stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);

    if (firstCommitDate) {
      return new Date(firstCommitDate);
    }
  } catch {
    // Fall back to the stable frontmatter date if git metadata is unavailable.
  }

  return post.data.pubDate;
}

export async function enrichPostsForRss(posts: BlogPost[]) {
  const enriched = await Promise.all(
    posts.map(async (post) => ({
      post,
      rssDate: await getPostRssDate(post)
    }))
  );

  return enriched.sort((a, b) => b.rssDate.valueOf() - a.rssDate.valueOf());
}
