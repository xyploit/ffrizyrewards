// Define target date: December 30, 2025 at 23:59:59 UTC
// Month 11 = December (0-indexed, so 11 = December)
const targetDate = new Date(Date.UTC(2025, 11, 30, 23, 59, 59)); // December 30, 2025

function calculateTimeRemaining() {
  const nowUTC = new Date(); // Get current UTC time
  const difference = targetDate.getTime() - nowUTC.getTime(); // Always subtract in UTC to avoid timezone issues

  if (difference <= 0) {
    clearInterval(timerInterval);
    document.getElementById('countdown').innerHTML = '00D 00H 00M 00S';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById('countdown').innerHTML = `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M ${String(seconds).padStart(2, '0')}S`;
}

// Calculate initial time remaining
calculateTimeRemaining();

// Update the countdown every second
const timerInterval = setInterval(calculateTimeRemaining, 1000);
