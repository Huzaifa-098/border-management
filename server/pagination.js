export function parsePagination(query, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPagination(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function searchClause(fields, term) {
  if (!term || !String(term).trim()) return { sql: "", params: [] };
  const like = `%${String(term).trim()}%`;
  const parts = fields.map((f) => `${f} LIKE ?`).join(" OR ");
  return { sql: ` AND (${parts})`, params: fields.map(() => like) };
}
