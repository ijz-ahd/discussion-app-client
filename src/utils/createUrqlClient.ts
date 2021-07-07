import Router from "next/router";
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables,
} from "urql";
import {
  MeDocument,
  LoginMutation,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
  DeletePostMutationVariables,
} from "../generated/graphql";
import { Cache, cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { updatedQuery } from "./updatedQuery";
import { pipe, tap } from "wonka";
import gql from "graphql-tag";
import { isServer } from "./isServer";

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes("not authenticated")) {
          Router.replace("/login");
        }
      })
    );
  };

// implementing pagination by reference from urql (github)
const cursorPagination = (): Resolver => {
  // structure of client side resolver
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);

    // filtering only posts fields from cache
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    // generating fieldKey here to check the value of info.partial which returns a boolean
    // Means that whether cache contains data/posts or not.
    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const inCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      "posts"
    );

    // if data is in the cache dont fetch from server, else fetch from server.
    info.partial = !inCache;

    // looping through cache so that whenever a data enters the cache it just adds to the existing results
    // combining into array of results
    let hasMore = true;
    const results: string[] = [];
    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, "posts") as string[];
      const _hasMore = cache.resolve(key, "hasMore");
      if (!_hasMore) {
        hasMore = _hasMore as boolean;
      }
      results.push(...data);
    });
    return {
      __typename: "PaginatedPosts",
      hasMore,
      posts: results,
    };
  };
};

function invalidateCache(cache: Cache) {
  const allFields = cache.inspectFields("Query");

  // filtering only posts fields from cache
  const fieldInfos = allFields.filter((info) => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate("Query", "posts", fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = "";
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include" as const,
      headers: cookie ? { cookie } : undefined,
    },
    // urql responds from cache for same request. Hence using exchange-graphcache for making new request.
    exchanges: [
      dedupExchange,
      // taking data available from cache
      // reason using this way of fetching from cache instead reaching server is for fast access of data
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, info) => {
              cache.invalidate({
                __typename: "Post",
                id: (args as DeletePostMutationVariables).id,
              });
            },
            // updating vote cache
            vote: (_result, args, cache, info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              console.log(data);
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }

                const newPoints =
                  (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            // invalidating cache to fetch data from server
            createPost: (_result, _, cache, __) => {
              invalidateCache(cache);
            },
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

              invalidateCache(cache);
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
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
