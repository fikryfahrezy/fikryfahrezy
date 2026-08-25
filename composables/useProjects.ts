import type { Project } from "~/types/project";

const emptyProjects = (): Project[] => [];

export function useProjects(
  options: { immediate?: boolean; server?: boolean } = {},
) {
  return useFetch<Project[]>("/api/github-projects", {
    key: "github-projects",
    default: emptyProjects,
    immediate: options.immediate ?? true,
    server: options.server ?? true,
  });
}
