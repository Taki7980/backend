class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60 * 1000; // 1 minute window
  private readonly maxRequests: number = 5; // 5 requests per window

  public checkLimit(userId: string = 'default'): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get or initialize timestamps for this user
    let timestamps = this.requests.get(userId) || [];
    
    // Remove expired timestamps
    timestamps = timestamps.filter(time => time > windowStart);
    
    // Check if limit is exceeded
    if (timestamps.length >= this.maxRequests) {
      this.requests.set(userId, timestamps);
      return false;
    }
    
    // Add new timestamp
    timestamps.push(now);
    this.requests.set(userId, timestamps);
    return true;
  }

  public getRemainingRequests(userId: string = 'default'): number {
    const timestamps = this.requests.get(userId) || [];
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validTimestamps = timestamps.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  public getResetTime(userId: string = 'default'): number {
    const timestamps = this.requests.get(userId) || [];
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    return Math.max(0, oldestTimestamp + this.windowMs - Date.now());
  }
}

export const rateLimiter = new RateLimiter(); 