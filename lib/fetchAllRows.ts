// Supabase returns at most 1000 rows per request (the API "Max rows" setting),
// so list queries are read page by page until no rows are left.
const PAGE_SIZE = 1000;

type PageResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>;

export async function fetchAllRows<T>(buildQuery: (from: number, to: number) => PageResult<T>): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) return { data: null, error };
    const page = data ?? [];
    // Stop on an empty page rather than a short one, in case the server's row limit is set below PAGE_SIZE.
    if (page.length === 0) return { data: rows, error: null };
    rows.push(...page);
    from += page.length;
  }
}
