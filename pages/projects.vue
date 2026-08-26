<script setup lang="ts">
import type { Project } from "~/types/project";

const { t } = useI18n();

const { data: projectListResponse, error, status } = await useProjects();

const projects = computed(() => projectListResponse.value.entries);
const githubProfileUrl = computed(() => projectListResponse.value.profileUrl);

const formatGroup = (group: string) =>
  group
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const projectGroups = computed(() => {
  const grouped = new Map<string, Project[]>();
  const uncategorizedKey = "uncategorized";

  for (const project of projects.value) {
    const key = project.group || uncategorizedKey;
    const group = grouped.get(key) || [];
    group.push(project);
    grouped.set(key, group);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => {
      if (a === uncategorizedKey) return 1;
      if (b === uncategorizedKey) return -1;
      return a.localeCompare(b);
    })
    .map(([key, items]) => ({
      key,
      label:
        key === uncategorizedKey
          ? t("projects.uncategorized")
          : formatGroup(key),
      projects: [...items].sort(
        (a, b) =>
          (Date.parse(b.pushedAt || "") || 0) -
          (Date.parse(a.pushedAt || "") || 0),
      ),
    }));
});

useHead({
  title: () => t("projects.seoTitle"),
});

useSeoMeta({
  description: () => t("projects.description"),
  ogTitle: () => t("projects.seoTitle"),
  ogDescription: () => t("projects.description"),
});
</script>

<template>
  <div class="showcase-page section-wrap">
    <section class="project-page-header">
      <p class="project-page-index" aria-hidden="true">02</p>
      <div class="project-page-title">
        <p class="section-kicker">{{ t("projects.eyebrow") }}</p>
        <h1>{{ t("projects.title") }}</h1>
      </div>
      <div class="project-page-summary">
        <p>{{ t("projects.description") }}</p>
        <p>
          <a
            v-if="githubProfileUrl"
            :href="githubProfileUrl"
            target="_blank"
            rel="noreferrer"
          >
            {{ t("projects.source") }} <span aria-hidden="true">↗</span>
          </a>
          <span v-else>{{ t("projects.source") }}</span>
        </p>
      </div>
    </section>

    <section
      v-if="status === 'pending' && projectGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('projects.loading')"
      aria-live="polite"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">·· / ··</p>
      <div>
        <p class="meta-label">{{ t("projects.loading") }}</p>
        <h2>{{ t("projects.loadingTitle") }}</h2>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="error && projectGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('projects.errorLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">ERR / GH</p>
      <div>
        <p class="meta-label">{{ t("projects.errorLabel") }}</p>
        <h2>{{ t("projects.errorTitle") }}</h2>
        <p>{{ t("projects.errorCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <section
      v-else-if="projectGroups.length === 0"
      class="showcase-placeholder"
      :aria-label="t('projects.emptyLabel')"
    >
      <p class="showcase-placeholder-index" aria-hidden="true">00 / 00</p>
      <div>
        <p class="meta-label">{{ t("projects.emptyLabel") }}</p>
        <h2>{{ t("projects.emptyTitle") }}</h2>
        <p>{{ t("projects.emptyCopy") }}</p>
      </div>
      <span class="showcase-placeholder-mark" aria-hidden="true">↘</span>
    </section>

    <div v-else class="project-groups">
      <section
        v-for="(group, groupIndex) in projectGroups"
        :key="group.key"
        class="project-group"
        :aria-labelledby="`project-group-${group.key}`"
      >
        <header class="project-group-heading">
          <p class="project-group-index" aria-hidden="true">
            {{ String(groupIndex + 1).padStart(2, "0") }} /
            {{ String(projectGroups.length).padStart(2, "0") }}
          </p>
          <div>
            <p class="meta-label">{{ t("projects.groupLabel") }}</p>
            <h2 :id="`project-group-${group.key}`">{{ group.label }}</h2>
          </div>
          <p class="project-group-count">
            {{ t("projects.repositoryCount", group.projects.length) }}
          </p>
        </header>

        <div class="project-grid">
          <article
            v-for="project in group.projects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-card-topline">
              <p class="meta-label">{{ project.fullName }}</p>
              <span aria-hidden="true">↗</span>
            </div>
            <h3>
              <a :href="project.url" target="_blank" rel="noreferrer">
                {{ project.name }}
              </a>
            </h3>
            <p class="project-description">
              {{ project.description || t("projects.noDescription") }}
            </p>

            <ul v-if="project.topics.length" class="project-topics">
              <li v-for="topic in project.topics" :key="topic">{{ topic }}</li>
            </ul>

            <footer class="project-card-footer">
              <div class="project-stats">
                <span v-if="project.language">{{ project.language }}</span>
                <span>★ {{ project.stars }}</span>
                <span>⑂ {{ project.forks }}</span>
              </div>
              <a
                v-if="project.homepage"
                :href="project.homepage"
                target="_blank"
                rel="noreferrer"
              >
                {{ t("projects.liveSite") }} ↗
              </a>
            </footer>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
