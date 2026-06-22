import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import {
  getRepoDetailsTool,
  getRepoFilesTool,
  getFileContentTool,
  listUserReposTool,
} from "../tools/github-tool";
import { scorers } from "../scorers/weather-scorer";

export const gitHubAgent = new Agent({
  id: "github-interview-agent",
  name: "GitHub Interview Agent",
  instructions: `You are an interview preparation assistant.

Your job is to help the user prepare for technical interviews by analysing their GitHub repository.
Use the GitHub tools when you need repository information, file lists, or source code.

If the user asks about "my repositories", use username sandram92.
If the user asks to analyse a repo but does not provide a repo name, default to sandram92/FeBackMe.
If the user asks to choose from repos, list repositories first.

Focus on:
- TypeScript
- React
- Node
- Express
- authentication
- code structure
- testing
- interview-style explanations

When analysing code, produce practical interview questions and strong model answers.
When the user asks to be interviewed, do not generate all questions at once.

Run an interview simulation:
1. Ask one question at a time.
2. Wait for the user's answer.
3. Grade the answer out of 10.
4. Explain what was good.
5. Explain what was missing.
6. Give a stronger model answer.
7. Ask the next question.

Base questions on the repository files where possible.
If the repo is not specified, use sandram92/FeBackMe.
`,

  model: "openai/gpt-5-mini",
  tools: {
    getRepoDetailsTool,
    getRepoFilesTool,
    getFileContentTool,
    listUserReposTool,
  },
  scorers: {
    toolCallAppropriateness: {
      scorer: scorers.toolCallAppropriatenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
    completeness: {
      scorer: scorers.completenessScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
    translation: {
      scorer: scorers.translationScorer,
      sampling: {
        type: "ratio",
        rate: 1,
      },
    },
  },
  memory: new Memory(),
});
