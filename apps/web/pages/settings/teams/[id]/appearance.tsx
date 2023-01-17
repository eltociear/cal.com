import { GetServerSidePropsContext } from "next";

import { ssrInit } from "@calcom/trpc/server/ssr";

export { default } from "@calcom/features/ee/teams/pages/team-appearance-view";

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const ssr = await ssrInit(context);

  return {
    props: {
      trpcState: ssr.dehydrate(),
    },
  };
};
