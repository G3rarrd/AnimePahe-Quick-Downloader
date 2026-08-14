class TokenBucketLimiter {
    private tokens: number;
    private lastRefill: number = Date.now();
    private capacity : number;
    private refillRate : number;

    constructor (capacity: number, refillRate: number) {
        this.tokens = capacity;
        this.capacity = capacity;
        this.refillRate = refillRate;
    }

    public allow(): boolean {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }

        return false;
    }

    private refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000; // 1000 ms is 1 sec
        this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
        this.lastRefill = now;
    }

}

export const fetchRateLimiter = new TokenBucketLimiter(3,  0.15);