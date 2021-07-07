import { dedupExchange, fetchExchange } from "urql";
import {
  MeDocument,
  LoginMutation,
  MeQuery,
  RegisterMutation,
} from "../generated/graphql";
import { cacheExchange } from "@urql/exchange-graphcache";
import { updatedQuery } from "./updatedQuery";

export const createUrqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  // urql responds from cache for same request. Hence using exchange-graphcache for making new request.
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, _, cache, __) => {
            updatedQuery(cache, { query: MeDocument }, _result, () => ({
              me: null,
            }));
          },
          // whenever the login mutation takes place the MeQuery specifically gets updated instead reading from the cache
          login: (_result, _, cache, __) => {
            updatedQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query;
                } else {
                  return {
                    me: result.login.user,
                  };
                }
              }
            );
          },
          // whenever the register mutation takes place the MeQuery specifically gets updated instead reading from the cache
          register: (_result, _, cache, __) => {
            updatedQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query;
                } else {
                  return {
                    me: result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
