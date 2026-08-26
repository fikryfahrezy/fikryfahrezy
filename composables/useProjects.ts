import type { ProjectListResponse } from "~/types/project";

const emptyProjects = (): ProjectListResponse => ({
  profileUrl: "",
  entries: [],
});

export function useProjects(
  options: { immediate?: boolean; server?: boolean } = {},
) {
  return useFetch<ProjectListResponse>("/api/github-projects", {
    key: "github-projects",
    default: emptyProjects,
    immediate: options.immediate ?? true,
    server: options.server ?? true,
  });
}
