// One wrapper per content collection. Each owns a stable useAsyncData key, so
// the duplicated section components in the infinite-scroll track (rendered
// twice — once real, once inert) share a single query instead of doubling it.

export function useProfile() {
  const { locale } = useI18n();
  return useAsyncData(
    () => `resume-profile:${locale.value}`,
    async () => {
      const localized = await queryCollection("profile")
        .where("locale", "=", locale.value)
        .first();
      return (
        localized ??
        queryCollection("profile").where("locale", "=", "en").first()
      );
    },
  );
}

export function useNow() {
  const { locale } = useI18n();
  return useAsyncData(
    () => `resume-now:${locale.value}`,
    async () => {
      const localized = await queryCollection("now")
        .where("locale", "=", locale.value)
        .first();
      return (
        localized ?? queryCollection("now").where("locale", "=", "en").first()
      );
    },
  );
}

export function useJourney() {
  const { locale } = useI18n();
  return useAsyncData(
    () => `resume-journey:${locale.value}`,
    async () => {
      const localized = await queryCollection("journey")
        .where("locale", "=", locale.value)
        .order("order", "ASC")
        .all();
      if (locale.value === "en") return localized;

      const localizedOrders = new Set(localized.map((entry) => entry.order));
      const english = await queryCollection("journey")
        .where("locale", "=", "en")
        .order("order", "ASC")
        .all();
      return [
        ...localized,
        ...english.filter((entry) => !localizedOrders.has(entry.order)),
      ].sort((a, b) => a.order - b.order);
    },
    { default: () => [] },
  );
}

export function useSkills() {
  const { locale } = useI18n();
  return useAsyncData(
    () => `resume-skills:${locale.value}`,
    async () => {
      const localized = await queryCollection("skills")
        .where("locale", "=", locale.value)
        .order("order", "ASC")
        .all();
      if (locale.value === "en") return localized;

      const localizedOrders = new Set(localized.map((entry) => entry.order));
      const english = await queryCollection("skills")
        .where("locale", "=", "en")
        .order("order", "ASC")
        .all();
      return [
        ...localized,
        ...english.filter((entry) => !localizedOrders.has(entry.order)),
      ].sort((a, b) => a.order - b.order);
    },
    { default: () => [] },
  );
}

export function useContact() {
  const { locale } = useI18n();
  return useAsyncData(
    () => `resume-contact:${locale.value}`,
    async () => {
      const localized = await queryCollection("contact")
        .where("locale", "=", locale.value)
        .first();
      return (
        localized ??
        queryCollection("contact").where("locale", "=", "en").first()
      );
    },
  );
}
