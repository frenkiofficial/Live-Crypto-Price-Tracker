document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const cryptoTableBody = document.getElementById('cryptoTableBody');
    const currencySelector = document.getElementById('currencySelector');
    const topGainersList = document.getElementById('topGainersList');
    const topLosersList = document.getElementById('topLosersList');
    const priceChartCanvas = document.getElementById('priceChart').getContext('2d');
    const chartTitle = document.getElementById('chartTitle');
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    const chartControls = document.querySelector('.chart-controls');

    // API & Settings
    const API_BASE_URL = 'https://api.coingecko.com/api/v3';
    const COINS_PER_PAGE = 50; // Number of coins to fetch
    const UPDATE_INTERVAL = 30000; // Data update interval (ms) - 30 seconds

    // State Variables
    let selectedCurrency = currencySelector.value;
    let priceChart = null; // Chart.js instance
    let allCoinsData = []; // Store all coin data for sorting gainers/losers
    let currentChartCoinId = 'bitcoin'; // Default coin for the chart
    let currentChartDays = 7; // Default chart period

    // --- Format Functions ---
    function formatCurrency(amount, currency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: (amount < 1 && amount > -1) ? 6 : 2, // More digits for prices < $1
        }).format(amount);
    }

    function formatPercentage(percentage) {
        if (percentage === null || percentage === undefined) return 'N/A';
        const value = parseFloat(percentage).toFixed(2);
        const className = value >= 0 ? 'positive-change' : 'negative-change';
        const sign = value >= 0 ? '+' : '';
        return `<span class="${className}">${sign}${value}%</span>`;
    }

    function formatLargeNumber(number, currency) {
         if (number === null || number === undefined) return 'N/A';
         // Simple currency format, remove decimals for market cap/volume
         return formatCurrency(number, currency).replace(/\.\d+$/, '');
    }

    function updateTimestamp() {
        const now = new Date();
        lastUpdatedSpan.textContent = `Last Updated: ${now.toLocaleTimeString()}`;
    }

    // --- API Fetch Functions ---
    async function fetchCoinData() {
        cryptoTableBody.innerHTML = '<tr><td colspan="5">Updating data...</td></tr>'; // Loading state
        try {
            const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=${selectedCurrency}&order=market_cap_desc&per_page=${COINS_PER_PAGE}&page=1&sparkline=false&price_change_percentage=24h`);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            allCoinsData = await response.json();
            displayCoinData(allCoinsData);
            displayGainersLosers(allCoinsData);
            updateTimestamp();

            // Update chart data only if currency/coin/period changes, not on every auto-refresh
            // const currentCoin = allCoinsData.find(coin => coin.id === currentChartCoinId);
            // if (currentCoin) {
                 // Could potentially update just the last point of the chart here, but it's more complex
            // }

        } catch (error) {
            console.error("Error fetching coin data:", error);
            cryptoTableBody.innerHTML = `<tr><td colspan="5">Failed to load data. Try again later. Error: ${error.message}</td></tr>`;
             lastUpdatedSpan.textContent = 'Update failed';
        }
    }

    async function fetchChartData(coinId, days) {
        chartTitle.textContent = `Loading ${coinId} chart...`;
        try {
            // Try daily interval first
            const dailyResponse = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${selectedCurrency}&days=${days}&interval=daily`);

            let chartData;
            if (!dailyResponse.ok && days <= 2) { // If daily fails and it's a short period (1 or 2 days)
                 // Try 'hourly' interval as fallback
                 console.log(`Daily fetch failed for ${coinId} (${days}d), trying hourly...`);
                 const hourlyResponse = await fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${selectedCurrency}&days=${days}&interval=hourly`);
                 if (!hourlyResponse.ok) {
                     throw new Error(`Failed to fetch chart data (daily & hourly): ${hourlyResponse.statusText}`);
                 }
                 chartData = await hourlyResponse.json();
            } else if (!dailyResponse.ok) { // If daily fails for longer periods
                 throw new Error(`Failed to fetch chart data (daily): ${dailyResponse.statusText}`);
            } else { // If daily fetch is successful
                chartData = await dailyResponse.json();
            }

            displayChart(chartData.prices, coinId, days);

        } catch (error) {
            console.error("Error fetching chart data:", error);
            chartTitle.textContent = `Failed to load ${coinId} chart`;
             if (priceChart) {
                 priceChart.destroy(); // Remove old chart if failed to load new one
                 priceChart = null;
             }
            // Clear canvas or show error message visually if desired
            priceChartCanvas.clearRect(0, 0, priceChartCanvas.canvas.width, priceChartCanvas.canvas.height); // Clear canvas
        }
    }


    // --- Display Functions ---
    function displayCoinData(coins) {
        cryptoTableBody.innerHTML = ''; // Clear the table
        coins.forEach((coin, index) => {
            const row = cryptoTableBody.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td data-coin-id="${coin.id}" title="Click to view ${coin.name} chart">
                    <img src="${coin.image}" alt="${coin.name} logo">
                    <span>${coin.symbol.toUpperCase()} <small>(${coin.name})</small></span>
                </td>
                <td>${formatCurrency(coin.current_price, selectedCurrency)}</td>
                <td>${formatPercentage(coin.price_change_percentage_24h)}</td>
                <td>${formatLargeNumber(coin.market_cap, selectedCurrency)}</td>
            `;
             // Add event listener for click on the coin name cell
            row.querySelector('td[data-coin-id]').addEventListener('click', () => {
                currentChartCoinId = coin.id;
                fetchChartData(currentChartCoinId, currentChartDays); // Reload chart with new coin & last period
                // Optional: Scroll to chart on small screens
                document.getElementById('chartTitle').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

     function displayGainersLosers(coins) {
        // Sort by 24h percentage change. Handle null/undefined values robustly.
        const sortedCoins = [...coins].sort((a, b) =>
            (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity)
        );

        // Filter out coins with null percentage change before slicing
        const validCoins = sortedCoins.filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined);

        const gainers = validCoins.slice(0, 5);
        const losers = validCoins.slice(-5).reverse(); // Take the last 5 and reverse the order

        topGainersList.innerHTML = '';
        if (gainers.length > 0) {
            gainers.forEach(coin => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="coin-name">${coin.symbol.toUpperCase()}</span> ${formatPercentage(coin.price_change_percentage_24h)}`;
                topGainersList.appendChild(li);
            });
        } else {
            topGainersList.innerHTML = '<li>N/A</li>';
        }


        topLosersList.innerHTML = '';
         if (losers.length > 0) {
            losers.forEach(coin => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="coin-name">${coin.symbol.toUpperCase()}</span> ${formatPercentage(coin.price_change_percentage_24h)}`;
                topLosersList.appendChild(li);
            });
        } else {
             topLosersList.innerHTML = '<li>N/A</li>';
        }
    }


    function displayChart(prices, coinId, days) {
        if (priceChart) {
            priceChart.destroy(); // Destroy previous chart instance if it exists
        }

         // Find coin name from allCoinsData, fallback to ID
         const coinData = allCoinsData.find(c => c.id === coinId);
         const coinName = coinData ? coinData.name : coinId.charAt(0).toUpperCase() + coinId.slice(1); // Capitalize ID as fallback
         chartTitle.textContent = `${coinName} Chart (${days} Day${days > 1 ? 's' : ''})`; // Update chart title

        const labels = prices.map(price => new Date(price[0])); // Timestamps
        const dataPoints = prices.map(price => price[1]); // Prices

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Price (${selectedCurrency.toUpperCase()})`,
                    data: dataPoints,
                    borderColor: '#e94560', // Accent color
                    backgroundColor: 'rgba(233, 69, 96, 0.1)', // Light accent fill
                    borderWidth: 2,
                    pointRadius: 0, // Hide points for cleaner look
                    pointHoverRadius: 5,
                    tension: 0.1 // Slight curve for aesthetics
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        // Adapter 'chartjs-adapter-date-fns' is required for the time scale
                        time: {
                             unit: determineTimeUnit(days), // Dynamically set unit based on duration
                             tooltipFormat: 'PPp', // Format for tooltip (e.g., Sep 15, 2023, 12:00:00 PM)
                             displayFormats: { // Format for labels displayed on the X axis
                                hour: 'HH:mm',   // e.g., 14:00
                                day: 'MMM d',    // e.g., Sep 15
                                month: 'MMM yyyy'// e.g., Sep 2023
                            }
                        },
                        ticks: {
                            color: '#a0a0c0', // Axis label color
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 7 // Limit the number of X labels to avoid overcrowding
                        },
                        grid: {
                            color: 'rgba(74, 74, 106, 0.2)' // Grid line color
                        }
                    },
                    y: {
                        ticks: {
                            color: '#a0a0c0', // Axis label color
                            // Format Y-axis labels as currency
                            callback: function(value, index, values) {
                                // Simple format without decimals on Y-axis for less clutter
                                return formatCurrency(value, selectedCurrency).replace(/\.\d+$/, '');
                            }
                        },
                        grid: {
                            color: 'rgba(74, 74, 106, 0.5)' // Grid line color
                        }
                    }
                },
                plugins: {
                    tooltip: {
                         mode: 'index', // Show tooltips for all datasets at that index
                         intersect: false, // Tooltip appears when hovering anywhere vertically
                         callbacks: {
                            // Custom tooltip label formatting
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Use the full currency format in the tooltip
                                    label += formatCurrency(context.parsed.y, selectedCurrency);
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: false // Hide default legend
                    }
                },
                 interaction: { // Improve hover interaction
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        };

        priceChart = new Chart(priceChartCanvas, chartConfig);
    }

    // Determines the time unit ('hour', 'day', 'month') for the chart's X-axis
    // based on the selected number of days.
    function determineTimeUnit(days) {
         if (days <= 2) return 'hour';    // Use hours for 1-2 days
         if (days <= 90) return 'day';     // Use days for up to 3 months
         return 'month';                   // Use months for longer periods
    }


    // --- Event Listeners ---
    currencySelector.addEventListener('change', (e) => {
        selectedCurrency = e.target.value;
        fetchCoinData(); // Reload table data & gainers/losers
        fetchChartData(currentChartCoinId, currentChartDays); // Reload chart with the new currency
    });

     // Event delegation for chart controls
     chartControls.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const days = parseInt(e.target.getAttribute('data-days'));
            // Check if it's a valid number and different from the current period
            if (!isNaN(days) && days !== currentChartDays) {
                 currentChartDays = days;
                 fetchChartData(currentChartCoinId, currentChartDays); // Fetch new chart data

                 // Update active button style
                 chartControls.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                 e.target.classList.add('active');
            }
        }
    });

    // --- Initialization & Interval ---
    fetchCoinData(); // Initial fetch on load
    fetchChartData(currentChartCoinId, currentChartDays); // Load default chart on load
    setInterval(fetchCoinData, UPDATE_INTERVAL); // Set interval for automatic updates (mind API rate limits)
});
