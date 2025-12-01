document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "/api/leaderboard";
    const MAX_PLAYERS = 10;
    let refreshInterval = null;
    let leaderboardEnded = false;

    // Get URL parameters to check if viewing a specific day
    const urlParams = new URLSearchParams(window.location.search);
    const dayParam = urlParams.get('day'); // e.g., ?day=1 for December 1st

    // Default leaderboard period: December 1, 2025 to December 30, 2025
    // Calculate exact millisecond timestamps like: startTime=1764591959590&endTime=1767139199000
    const defaultStartDate = new Date(Date.UTC(2025, 11, 1, 0, 0, 0)); // December 1, 2025 00:00:00 UTC
    const defaultStartTime = defaultStartDate.getTime(); // Milliseconds timestamp
    
    // End: December 30, 2025 at 23:59:59 UTC
    const endDate = new Date(Date.UTC(2025, 11, 30, 23, 59, 59)); // December 30, 2025
    const defaultEndTime = endDate.getTime(); // Milliseconds timestamp
    
    console.log(`Using timestamps: startTime=${defaultStartTime}, endTime=${defaultEndTime}`);

    // If day parameter is provided (e.g., ?day=1), show data for that specific day
    let startTime, endTime;
    if (dayParam) {
        const day = parseInt(dayParam);
        if (day >= 1 && day <= 31) {
            // Show data for specific day: December [day], 2025
            const dayStart = new Date(Date.UTC(2025, 11, day, 0, 0, 0)); // December [day], 00:00:00
            const dayEnd = new Date(Date.UTC(2025, 11, day, 23, 59, 59)); // December [day], 23:59:59
            startTime = dayStart.getTime();
            endTime = dayEnd.getTime();
            console.log(`Showing wagers for December ${day}, 2025`);
        } else {
            // Invalid day, use default (Dec 1-30)
            startTime = defaultStartTime;
            endTime = defaultEndTime;
        }
    } else {
        // Default: Show wagers from December 1 to December 30 (resets to $0, only counts Dec 1-30)
        startTime = defaultStartTime;
        endTime = defaultEndTime;
    }

    const formatCurrency = (value) => {
        const amount = Number(value) || 0;
        return amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const updateLeaderboard = () => {
        // Build URL with startTime and endTime parameters in exact format
        // Format: startTime=1764591959590&endTime=1767139199000 (milliseconds timestamps)
        // Add timestamp to prevent caching and ensure fresh data
        const url = new URL(API_URL, window.location.origin);
        url.searchParams.set("startTime", startTime.toString());
        url.searchParams.set("endTime", endTime.toString());
        url.searchParams.set("_t", Date.now().toString()); // Cache buster - ensures fresh data
        
        console.log(`[${new Date().toLocaleTimeString()}] Fetching fresh leaderboard data`);
        console.log(`URL: ${url.toString()}`);
        console.log(`Timestamps: startTime=${startTime} (Dec 1, 2025), endTime=${endTime} (Dec 30, 2025)`);

        // Fetch with no cache for fresh data - always get latest
        fetch(url, { 
            cache: "no-store",
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Shuffle API responded with ${response.status}`);
                }
                return response.json();
            })
            .then((response) => {
                // Handle both old format (array) and new format (object with data and ended)
                let data;
                if (Array.isArray(response)) {
                    data = response;
                } else if (response.data && Array.isArray(response.data)) {
                    data = response.data;
                    if (response.ended) {
                        leaderboardEnded = true;
                        // Stop auto-refresh after leaderboard ends, but still allow manual refresh
                        if (refreshInterval) {
                            clearInterval(refreshInterval);
                            refreshInterval = null;
                        }
                    }
                } else {
                    console.error("Unexpected API response shape:", response);
                    data = [];
                }

                console.log(`✅ API returned ${data.length} entries (fresh data from Dec 1-30, 2025)`);
                
                // Sort and display data (include entries with 0 wagerAmount too)
                // Always show latest data - no caching
                const sorted = data
                    .filter((player) => player && typeof player?.wagerAmount === "number")
                    .sort((a, b) => b.wagerAmount - a.wagerAmount)
                    .slice(0, MAX_PLAYERS);
                
                console.log(`📊 Displaying ${sorted.length} players (sorted by wagerAmount, latest data only)`);
                
                // Log if no data
                if (sorted.length === 0) {
                    console.warn("⚠️ No leaderboard data available. Possible reasons:");
                    console.warn("1. No wagers in Dec 1-30, 2025 period");
                    console.warn("2. API rate limit (waiting 12+ seconds between requests)");
                    console.warn("3. No referees found");
                    console.warn("4. API temporarily unavailable");
                } else {
                    console.log(`✅ Successfully displaying ${sorted.length} players with latest wager data`);
                }

                // Update all player slots (fill with empty if no data)
                for (let index = 0; index < MAX_PLAYERS; index++) {
                    const nameEl = document.getElementById(`user${index}_name`);
                    const wagerEl = document.getElementById(`user${index}_wager`);

                    if (!nameEl || !wagerEl) {
                        continue;
                    }

                    if (index < sorted.length && sorted[index]) {
                        const player = sorted[index];
                        // Username is already masked by the backend API
                        nameEl.textContent = player.username || "User";
                        wagerEl.textContent = formatCurrency(player.wagerAmount);
                    } else {
                        // Show placeholder if no data for this rank
                        nameEl.textContent = "----";
                        wagerEl.textContent = "----";
                    }
                }
            })
            .catch((error) => {
                console.error("Failed to load leaderboard data:", error);
            });
    };

    // Initial load immediately
    updateLeaderboard();

    // Refresh every 12 seconds to avoid rate limiting
    // API allows 1 request every 10 seconds, so 12 seconds gives buffer
    // Always fetch fresh data with exact startTime/endTime - no caching
    refreshInterval = setInterval(() => {
        updateLeaderboard();
    }, 12000); // 12 seconds to avoid rate limit (API: 1 req per 10 sec)
});
