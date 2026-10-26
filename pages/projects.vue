<script setup lang="ts">
import { useFeaturedProducts } from "~/composables/useResume";
import type { Project } from "~/types/project";

const { t } = useI18n();

const { data: featuredProducts } = await useFeaturedProducts();
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
    <PageHeader
      index="02"
      :kicker="t('projects.eyebrow')"
      :title="t('projects.title')"
      glyph="作品"
    >
      <p>{{ t("projects.description") }}</p>
      <p>{{ t("projects.curatedSource") }}</p>
    </PageHeader>

    <section
      v-if="featuredProducts.length"
      class="featured-products"
      aria-labelledby="featured-products-title"
    >
      <header v-reveal class="featured-products-heading">
        <h2 id="featured-products-title">
          {{ t("projects.featuredTitle") }}
        </h2>
        <p>
          {{ t("projects.featuredCount", featuredProducts.length) }}
        </p>
      </header>

      <div class="featured-product-grid">
        <article
          v-for="(product, productIndex) in featuredProducts"
          :key="product.slug"
          v-reveal="productIndex * 80"
          v-tilt="{ max: 3 }"
          class="featured-product-card"
        >
          <div class="featured-product-topline">
            <p class="meta-label">
              {{ String(productIndex + 1).padStart(2, "0") }} /
              {{ String(featuredProducts.length).padStart(2, "0") }}
            </p>
            <p>{{ product.status }}</p>
          </div>

          <div v-if="product.image" class="featured-project-preview">
            <NuxtImg
              :src="product.image"
              :alt="product.imageAlt || ''"
              width="1440"
              height="900"
              sizes="100vw md:50vw"
              format="webp"
              loading="lazy"
            />
          </div>

          <div class="featured-product-body">
            <p class="featured-product-category">{{ product.category }}</p>
            <h3>
              <a :href="product.url" target="_blank" rel="noreferrer">
                {{ product.name }}
              </a>
            </h3>
            <ContentRenderer
              :value="product"
              class="featured-product-summary"
            />
          </div>

          <ul
            v-if="product.technologies.length"
            class="project-topics"
            :aria-label="t('projects.technologies')"
          >
            <li v-for="technology in product.technologies" :key="technology">
              {{ technology }}
            </li>
          </ul>

          <footer class="featured-product-footer">
            <a :href="product.url" target="_blank" rel="noreferrer">
              {{ t("projects.openProject") }} <span aria-hidden="true">↗</span>
            </a>
            <a
              v-if="product.sourceUrl"
              :href="product.sourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              {{ t("projects.sourceCode") }} <span aria-hidden="true">↗</span>
            </a>
          </footer>
        </article>
      </div>
    </section>

    <header v-reveal class="repository-archive-heading">
      <h2>{{ t("projects.archiveTitle") }}</h2>
      <a
        v-if="githubProfileUrl"
        :href="githubProfileUrl"
        target="_blank"
        rel="noreferrer"
      >
        {{ t("projects.source") }} <span aria-hidden="true">↗</span>
      </a>
    </header>

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
        <header v-reveal class="project-group-heading">
          <p class="project-group-index" aria-hidden="true">
            {{ String(groupIndex + 1).padStart(2, "0") }} /
            {{ String(projectGroups.length).padStart(2, "0") }}
          </p>
          <h2 :id="`project-group-${group.key}`">{{ group.label }}</h2>
          <p class="project-group-count">
            {{ t("projects.repositoryCount", group.projects.length) }}
          </p>
        </header>

        <div class="project-grid">
          <article
            v-for="(project, projectIndex) in group.projects"
            :key="project.id"
            v-reveal="(projectIndex % 3) * 70"
            v-tilt
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
              {{ project.description }}
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

<style scoped>
.featured-products,
.project-groups {
  display: grid;
  gap: clamp(64px, 8vw, 110px);
}

.featured-products {
  margin-bottom: clamp(64px, 8vw, 110px);
}

.featured-products-heading,
.repository-archive-heading,
.project-group-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line-strong);
}

.featured-products-heading {
  margin-bottom: -40px;
}

.featured-products-heading h2,
.repository-archive-heading h2,
.project-group-heading h2 {
  font-family: var(--display);
  font-size: clamp(34px, 4.6vw, 64px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.95;
}

.featured-products-heading p,
.project-group-count {
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.repository-archive-heading {
  margin-bottom: 48px;
}

.repository-archive-heading a {
  padding: 10px 16px;
  border: 1px solid var(--line-strong);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.repository-archive-heading a:hover {
  border-color: var(--cobalt);
  background: var(--cobalt);
  color: var(--on-cobalt);
}

.project-group-heading {
  margin-bottom: 28px;
}

.project-group-index {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
}

.project-group-heading h2 {
  margin-right: auto;
}

.featured-product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(16px, 2.4vw, 32px);
}

.featured-product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: clamp(18px, 2vw, 26px);
  overflow: hidden;
  background: var(--cobalt);
  color: var(--on-cobalt);
  box-shadow: var(--shadow);
}

.featured-product-card:nth-child(3n + 2) {
  translate: 0 48px;
}

.featured-product-topline {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.featured-product-topline .meta-label {
  color: var(--panel-muted);
}

.featured-product-topline > p:last-child {
  padding: 3px 8px;
  background: var(--comet);
  color: var(--on-comet);
}

.featured-project-preview {
  overflow: hidden;
  aspect-ratio: 16 / 10;
  background: var(--abyss);
}

.featured-project-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 900ms var(--ease-out);
}

.featured-product-card:hover .featured-project-preview img {
  transform: scale(1.05);
}

.featured-product-body {
  display: grid;
  gap: 10px;
}

.featured-product-category {
  color: var(--comet);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.featured-product-body h3 {
  font-family: var(--display);
  font-size: clamp(34px, 3.8vw, 56px);
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 0.95;
}

.featured-product-summary {
  display: grid;
  gap: 10px;
  color: var(--panel-muted);
  line-height: 1.6;
}

.featured-product-summary > :deep(*) {
  margin: 0;
}

.featured-product-summary :deep(a) {
  border-bottom: 1px solid var(--accent);
  transition: color 200ms ease;
}

.featured-product-summary :deep(a:hover) {
  color: var(--accent);
}

.project-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-topics li {
  padding: 4px 9px;
  border: 1px solid var(--line-strong);
  color: var(--muted);
  font-family: var(--mono);
  font-size: 11px;
}

.featured-product-card .project-topics li {
  border-color: var(--panel-line);
  color: var(--on-cobalt);
}

.featured-product-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.featured-product-footer a {
  padding: 10px 14px;
  border: 1px solid var(--panel-line);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    background-color 200ms ease,
    color 200ms ease;
}

.featured-product-footer a:first-child,
.featured-product-footer a:hover {
  border-color: var(--comet);
  background: var(--comet);
  color: var(--on-comet);
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(12px, 1.6vw, 20px);
}

.project-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 240px;
  padding: 22px;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  background: var(--paper-raised);
  transition: border-color 250ms ease;
}

.project-card:hover {
  border-color: var(--cobalt);
}

.project-card-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.project-card-topline .meta-label {
  overflow: hidden;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-card-topline > span {
  color: var(--accent);
  transition: transform 400ms var(--ease-spring);
}

.project-card:hover .project-card-topline > span {
  transform: translate(3px, -3px) rotate(12deg);
}

.project-card h3 {
  font-family: var(--display);
  font-size: clamp(22px, 2vw, 28px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

/* Stretch the title link over the whole card. */
.project-card h3 a::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  content: "";
}

.project-description {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.project-card-footer {
  position: relative;
  z-index: 3;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  font-family: var(--mono);
  font-size: 11px;
}

.project-stats {
  display: flex;
  gap: 12px;
  color: var(--muted);
}

.project-card-footer a {
  color: var(--accent);
}

@media (max-width: 1080px) {
  .featured-product-grid,
  .project-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .featured-product-grid,
  .project-grid {
    grid-template-columns: 1fr;
  }

  .featured-product-card:nth-child(n) {
    translate: none;
  }

  .featured-products-heading {
    margin-bottom: 0;
  }
}
</style>
