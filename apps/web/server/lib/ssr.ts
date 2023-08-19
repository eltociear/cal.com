import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import superjson from "superjson";

import { getLocaleFromRequest } from "@calcom/lib/i18n";
import { createProxySSGHelpers } from "@calcom/trpc/react/ssg";
import { createContext } from "@calcom/trpc/server/createContext";
import { appRouter } from "@calcom/trpc/server/routers/_app";

// TODO: Consolidate this constant
// eslint-disable-next-line turbo/no-undeclared-env-vars
const CalComVersion = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "NA";

/**
 * Initialize server-side rendering tRPC helpers.
 * Provides a method to prefetch tRPC-queries in a `getServerSideProps`-function.
 * Automatically prefetches i18n based on the passed in `context`-object to prevent i18n-flickering.
 * Make sure to `return { props: { trpcState: ssr.dehydrate() } }` at the end.
 */
export async function ssrInit(context: GetServerSidePropsContext) {
  const ctx = await createContext(context);
  const locale = await getLocaleFromRequest(context.req);
  const i18n = await serverSideTranslations(locale, ["common", "vital"]);

  const ssr = createProxySSGHelpers({
    router: appRouter,
    transformer: superjson,
    ctx: { ...ctx, locale, i18n },
  });

  // always preload "viewer.public.i18n"
  await ssr.viewer.public.i18n.fetch({ locale, CalComVersion });
  // So feature flags are available on first render
  await ssr.viewer.features.map.prefetch();
  // Provides a better UX to the users who have already upgraded.
  await ssr.viewer.teams.hasTeamPlan.prefetch();

  await ssr.viewer.public.session.prefetch();

  return ssr;
}
