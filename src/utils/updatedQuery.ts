import { Cache, QueryInput } from "@urql/exchange-graphcache";

//wrapper function of cache updateQuery which cast's type
export function updatedQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  // casting return type of result to any
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
