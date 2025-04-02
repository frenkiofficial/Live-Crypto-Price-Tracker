# 🔥 Live Crypto Price Tracker

A simple, frontend-only web application displaying real-time cryptocurrency prices using the public CoinGecko API. Built with HTML, CSS, and vanilla JavaScript.

**(Optional: Add a Screenshot/GIF Here)**
<!-- ![Live Crypto Tracker Screenshot](link_to_your_screenshot.png) -->
*Consider adding a screenshot or a GIF showing the tracker in action!*

## Description

This project provides a clean interface to track the prices of various cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), and many others. Prices are updated automatically without needing to refresh the page. It also includes historical price charts and lists the top gainers and losers over the last 24 hours.

## Features

✅ **Live Price Updates:** BTC, ETH, and other token prices update automatically at a set interval.
✅ **Historical Price Chart:** Displays interactive price movement graphs using Chart.js (Default: Bitcoin, 7 Days). Click on any coin in the table to view its chart.
✅ **Fiat Currency Conversion:** Easily switch the displayed prices between different fiat currencies (USD, IDR, EUR supported initially).
✅ **Top Gainers/Losers:** Shows the coins with the largest positive and negative price changes in the last 24 hours.
✅ **Responsive Design:** The layout adapts to different screen sizes (desktops, tablets, mobiles).

## Technologies Used

*   **HTML5:** For the basic structure of the web page.
*   **CSS3:** For styling, layout (including Flexbox), and responsiveness.
*   **JavaScript (ES6+):** For fetching data, manipulating the DOM, handling user interactions, and updating content dynamically.
*   **Fetch API:** Used to make requests to the CoinGecko API without needing a backend server.
*   **Chart.js:** A popular library for creating interactive and visually appealing charts.
*   **`chartjs-adapter-date-fns`:** Required adapter for Chart.js to correctly handle time-based data on the chart axes.

## How to Use / Setup

This is a purely frontend application, so setup is very straightforward.

**Prerequisites:**

*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
*   Git (Optional, for cloning the repository).

**Steps:**

1.  **Get the Code:**
    *   **Option 1: Clone the repository (Recommended)**
        Open your terminal or command prompt and run:
        ```bash
        git clone https://github.com/frenkiofficial/Live-Crypto-Price-Tracker.git
        cd Live-Crypto-Price-Tracker
        ```
    *   **Option 2: Download ZIP**
        Go to the repository page: [https://github.com/frenkiofficial/Live-Crypto-Price-Tracker](https://github.com/frenkiofficial/Live-Crypto-Price-Tracker)
        Click the green "Code" button, then click "Download ZIP". Extract the downloaded ZIP file.

2.  **Run the Application:**
    *   Navigate to the project folder (`Live-Crypto-Price-Tracker`) where you cloned or extracted the files.
    *   Simply **double-click the `index.html` file**, or right-click and choose "Open with" your preferred web browser.

That's it! The Live Crypto Price Tracker should now be running locally in your browser.

## Project Structure


*   **`index.html`**: Defines the structure and elements of the webpage, including the table, chart canvas, and controls.
*   **`style.css`**: Contains all the CSS rules to style the elements, implement the dark theme, and make the layout responsive.
*   **`script.js`**: Contains the core logic:
    *   Fetching market data and historical chart data from the CoinGecko API.
    *   Formatting currency and percentage values.
    *   Populating the crypto table.
    *   Identifying and displaying top gainers/losers.
    *   Initializing and updating the Chart.js price chart.
    *   Handling user interactions (currency selection, chart period changes, clicking on coins).
    *   Setting up the interval for automatic data refresh.

## API Used

This project utilizes the free tier of the **[CoinGecko API](https://www.coingecko.com/en/api)** to fetch all cryptocurrency market data. Please be mindful of their rate limits if you plan to modify the update frequency or make significantly more requests.

## Need Help or Want Custom Development?

Hi, I'm Frenki! If you find this project useful, have suggestions for improvement, encounter any issues, or require custom web development services, feel free to reach out. I can help build more advanced crypto trackers, dashboards, data visualization tools, or other web applications tailored to your needs.

You can contact me via:

*   **GitHub:** [frenkiofficial](https://github.com/frenkiofficial) (Feel free to open an Issue or Discussion)
*   **Hugging Face:** [frenkiofficial](https://huggingface.co/frenkiofficial)
*   **Telegram:** [@FrenkiOfficial](https://t.me/FrenkiOfficial)
*   **Twitter:** [@officialfrenki](https://twitter.com/officialfrenki)
*   **Fiverr:** [frenkimusic](https://www.fiverr.com/frenkimusic/)

---

*Feel free to contribute to this project by forking it and submitting pull requests!*
