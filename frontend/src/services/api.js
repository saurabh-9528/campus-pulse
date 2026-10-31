// API client layer for Campus Pulse

export const API_BASE_URL = '/api/v1';

/**
 * Helper to perform HTTP fetch and handle error responses consistently.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMsg = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail);
      }
    } catch {
      // fallback to generic status
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Fetch notices with optional filtering, search, and pagination.
 */
export async function fetchNotices(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.append('search', params.search);
  if (params.category && params.category !== 'All') searchParams.append('category', params.category);
  if (params.priority && params.priority !== 'All') searchParams.append('priority', params.priority);
  if (params.start_date) searchParams.append('start_date', params.start_date);
  if (params.end_date) searchParams.append('end_date', params.end_date);
  if (params.page) searchParams.append('page', params.page);
  if (params.limit) searchParams.append('limit', params.limit);

  const query = searchParams.toString();
  const endpoint = query ? `/notices?${query}` : '/notices';
  return request(endpoint, { method: 'GET' });
}

/**
 * Retrieve a single notice by ID.
 */
export async function fetchNoticeById(id) {
  return request(`/notices/${id}`, { method: 'GET' });
}

/**
 * Save and persist a validated notice.
 */
export async function createNotice(noticeData) {
  return request('/notices', {
    method: 'POST',
    body: JSON.stringify(noticeData),
  });
}

/**
 * Update an existing notice.
 */
export async function updateNotice(id, noticeData) {
  return request(`/notices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(noticeData),
  });
}

/**
 * Delete a notice by ID.
 */
export async function deleteNotice(id) {
  return request(`/notices/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Extract structured notice details from raw announcement text via AI.
 */
export async function extractNoticeText(text) {
  return request('/notices/extract', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
