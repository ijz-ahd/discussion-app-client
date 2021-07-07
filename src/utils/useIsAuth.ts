import { useEffect } from "react";
import { useRouter as router } from "next/router";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const route = router();

  useEffect(() => {
    if (!fetching && !data?.me) {
      route.replace("/login?next=" + route.pathname);
    }
  }, [fetching, data, route]);
};
