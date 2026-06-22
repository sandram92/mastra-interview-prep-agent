import { createTool } from "@mastra/core/tools";
import { z } from "zod";

import {
  type GitHubRepo,
  GitHubTreeResponse,
  GitHubFileResponse,
  GitHubUserRepo,
} from "../types";

const GITHUB_API_BASE = "https://api.github.com";

async function listUserRepos(username: string): Promise<GitHubUserRepo[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=20`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "mastra-interview-agent",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<GitHubUserRepo[]>;
}

export const listUserReposTool = createTool({
  id: "list-user-repos",
  description: "List public GitHub repositories for a user.",
  inputSchema: z.object({
    username: z.string(),
  }),
  outputSchema: z.object({
    repos: z.array(
      z.object({
        name: z.string(),
        fullName: z.string(),
        description: z.string().nullable(),
        language: z.string().nullable(),
        updatedAt: z.string(),
        url: z.string(),
      }),
    ),
  }),
  execute: async (input) => {
    try {
      console.log("listUserReposTool input:", input);

      const repos = await listUserRepos(input.username);

      return {
        repos: repos.map((repo) => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          updatedAt: repo.updated_at,
          url: repo.html_url,
        })),
      };
    } catch (error) {
      console.error("Error listing user repositories:", error);
      throw error;
    }
  },
});

async function getRepoDetails(
  owner: string,
  repo: string,
): Promise<GitHubRepo> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "mastra-interview-agent",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<GitHubRepo>;
}

// const repo = await getRepoDetails("sandram92", "FeBackMe");

export const getRepoDetailsTool = createTool({
  id: "get-repo-details",
  description: "Get metadata about a GitHub repository.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
  }),
  outputSchema: z.object({
    name: z.string(),
    description: z.string().nullable(),
    language: z.string().nullable(),
    stars: z.number(),
    forks: z.number(),
    openIssues: z.number(),
    defaultBranch: z.string(),
    url: z.string(),
  }),
  execute: async (input) => {
    try {
      const { owner, repo } = input;

      console.log("Fetching repository details for ===>>> ", owner, repo);
      const details = await getRepoDetails(owner, repo);

      return {
        name: details.full_name,
        description: details.description,
        language: details.language,
        stars: details.stargazers_count,
        forks: details.forks_count,
        openIssues: details.open_issues_count,
        defaultBranch: details.default_branch,
        url: details.html_url,
      };
    } catch (error) {
      console.error("Error fetching repository details:", error);
      throw error;
    }
  },
});

export async function getRepoFiles(
  owner: string,
  repo: string,
  branch: string = "main",
): Promise<string[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }
  const data = (await response.json()) as GitHubTreeResponse;

  return data.tree
    .filter((item) => item.type === "blob")
    .map((item) => item.path)
    .filter((path) =>
      [".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".tf"].some(
        (ext) => path.endsWith(ext),
      ),
    );
}

export const getRepoFilesTool = createTool({
  id: "get-repo-files",
  description:
    "Get useful source-code and documentation files from a GitHub repository.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    branch: z.string().default("main"),
  }),
  outputSchema: z.object({
    files: z.array(z.string()),
  }),
  execute: async (input) => {
    try {
      const { owner, repo, branch } = input;

      console.log("Fetching files for ===>>> ", owner, repo, branch);

      const files = await getRepoFiles(owner, repo, branch);

      return { files };
    } catch (error) {
      console.error("Error fetching repository files:", error);
      throw error;
    }
  },
});

async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string = "main",
): Promise<{ path: string; content: string }> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "mastra-interview-agent",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as GitHubFileResponse;

  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    path: data.path,
    content,
  };
}

export const getFileContentTool = createTool({
  id: "get-file-content",
  description: "Read the content of one file from a GitHub repository.",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    path: z.string(),
    branch: z.string().default("main"),
  }),
  outputSchema: z.object({
    path: z.string(),
    content: z.string(),
  }),
  execute: async (input) => {
    try {
      const { owner, repo, path, branch } = input;

      console.log(
        "Fetching file content for ===>>> ",
        owner,
        repo,
        path,
        branch,
      );
      return getFileContent(owner, repo, path, branch);
    } catch (error) {
      console.error("Error fetching file content:", error);
      throw error;
    }
  },
});
