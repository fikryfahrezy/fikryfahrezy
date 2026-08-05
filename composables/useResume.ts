// One wrapper per content collection. Each owns a stable useAsyncData key, so
// the duplicated section components in the infinite-scroll track (rendered
// twice — once real, once inert) share a single query instead of doubling it.

export function useProfile() {
  return useAsyncData("resume-profile", () =>
    queryCollection("profile").first(),
  );
}

export function useSections() {
  return useAsyncData("resume-sections", () =>
    queryCollection("sections").first(),
  );
}

export function useNow() {
  return useAsyncData("resume-now", () => queryCollection("now").first());
}

export function useJourney() {
  return useAsyncData(
    "resume-journey",
    () => queryCollection("journey").order("order", "ASC").all(),
    { default: () => [] },
  );
}

export function useSkills() {
  return useAsyncData(
    "resume-skills",
    () => queryCollection("skills").order("order", "ASC").all(),
    { default: () => [] },
  );
}

export function useContact() {
  return useAsyncData("resume-contact", () =>
    queryCollection("contact").first(),
  );
}
