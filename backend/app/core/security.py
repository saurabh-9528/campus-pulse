import time
from collections import defaultdict
from typing import Dict, List


class SlidingWindowRateLimiter:
    """Lightweight in-memory sliding window rate limiter for expensive endpoints."""

    def __init__(self, max_requests: int = 15, window_seconds: float = 60.0):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds

        # Clean timestamps outside of current window
        self.requests[key] = [t for t in self.requests[key] if t > window_start]

        if len(self.requests[key]) >= self.max_requests:
            return False

        self.requests[key].append(now)
        return True

    def reset(self):
        """Reset all rate limit tracking (useful for testing)."""
        self.requests.clear()


# Single instance for AI extraction rate limiting (15 requests per minute per IP)
extract_rate_limiter = SlidingWindowRateLimiter(max_requests=15, window_seconds=60.0)

