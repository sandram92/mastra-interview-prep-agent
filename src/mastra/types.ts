export type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
};

export type GitHubTreeItem = {
  path: string;
  type: "blob" | "tree";
};

export type GitHubTreeResponse = {
  tree: GitHubTreeItem[];
};

export type GitHubFileResponse = {
  path: string;
  content: string;
  encoding: "base64";
};

export type GitHubUserRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  updated_at: string;
  private: boolean;
};