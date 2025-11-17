// Define target date in UTC (convert from MST manually)
const targetDate = new Date(Date.UTC(2025, 10, 30, 18 + 7, 59, 59)); // MST = UTC-7, adding 7 hours to convert

function calculateTimeRemaining() {
  const nowUTC = new Date(); // Get current UTC time
  const difference = targetDate.getTime() - nowUTC.getTime(); // Always subtract in UTC to avoid timezone issues

  if (difference <= 0) {
    clearInterval(timerInterval);
    document.getElementById('timer').innerHTML = 'Countdown expired!';
    return;
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  document.getElementById('countdown').innerHTML = `${days}D ${hours}H ${minutes}M ${seconds}S`;
}

// Calculate initial time remaining
calculateTimeRemaining();

// Update the countdown every second
const timerInterval = setInterval(calculateTimeRemaining, 1000);
