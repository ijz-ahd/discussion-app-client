import { useRouter as router } from "next/router";

export const useGetIntId = () => {
  const route = router();
  const intId =
    typeof route.query.id === "string" ? parseInt(route.query.id) : -1;

  return intId;
};
