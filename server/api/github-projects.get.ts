interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  pushed_at: string | null;
}

const REQUIRED_TOPIC = "personal-project";
const GROUP_TOPIC = /^project-(.+)$/i;

const getGitHubProjects = defineCachedFunction(
  async (username: string, token: string) => {
    const repositories: GitHubRepository[] = [];
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    if (token) headers.Authorization = `Bearer ${token}`;

    // GitHub caps this endpoint at 100 repositories per page. Keep paging so
    // adding more public repositories never silently drops a project.
    for (let page = 1; ; page += 1) {
      const batch = await $fetch<GitHubRepository[]>(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos`,
        {
          headers,
          query: {
            page,
            per_page: 100,
            sort: "updated",
            type: "public",
          },
        },
      );

      repositories.push(...batch);
      if (batch.length < 100) break;
    }

    return repositories
      .filter((repository) => repository.topics.includes(REQUIRED_TOPIC))
      .map((repository) => {
        const groupTopic = repository.topics.find((topic) =>
          GROUP_TOPIC.test(topic),
        );

        return {
          id: repository.id,
          name: repository.name,
          fullName: repository.full_name,
          description: repository.description,
          url: repository.html_url,
          homepage: repository.homepage || null,
          language: repository.language,
          stars: repository.stargazers_count,
          forks: repository.forks_count,
          topics: repository.topics.filter(
            (topic) => topic !== REQUIRED_TOPIC && !GROUP_TOPIC.test(topic),
          ),
          pushedAt: repository.pushed_at,
          group: groupTopic?.match(GROUP_TOPIC)?.[1] || null,
        };
      });
  },
  {
    // Cache only the GitHub request, not the HTTP response sent to browsers.
    maxAge: 5 * 60,
    name: "github-personal-projects-v4",
    getKey: (username) => username,
    shouldBypassCache: () => Boolean(import.meta.dev),
  },
);

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const username =
    typeof config.githubUsername === "string"
      ? config.githubUsername.trim()
      : "";
  const token =
    typeof config.githubToken === "string" ? config.githubToken : "";

  if (!username) {
    throw createError({
      statusCode: 500,
      statusMessage: "GitHub username is not configured",
      message: "Set the NUXT_GITHUB_USERNAME environment variable.",
    });
  }

  // The server function above owns freshness. Prevent browsers and CDNs from
  // retaining an older empty API response independently.
  setResponseHeader(event, "Cache-Control", "private, no-store");

  return {
    profileUrl: `https://github.com/${encodeURIComponent(username)}`,
    entries: await getGitHubProjects(username, token),
  };
});
