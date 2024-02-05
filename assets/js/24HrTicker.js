const CX_BINANCE_BASE_URL = "https://bwsp.s1.cryptoxpress.com";

const HIGHLIGHT_COINS = [
  "XPRESS",
  "BTC",
  "ETH",
  "BNB",
  "USDT",
  "USDC",
  "XRP",
  "ADA",
  "BUSD",
  "MATIC",
  "DOGE",
  "SOL",
  "DOT",
  "SHIB",
  "LTC",
  "AVAX",
  "TRX",
  "UNI",
  // "DAI",
  // "WBTC",
  "ATOM",
  "LINK",
  "ETC",
  "OKB",
  "LEO",
  "FIL",
];

const TREND_COINS = ["BTC", "ETH", "BNB", "USDT"];

/**
 * *globally accessible variables for this scope
 * *readonly variables are const in order to prevent accidental changes
 */
const _priceTickers = {}; // for rest reques
const priceTickers = VariableObserver({}); // for web socket
let wsConnectionRetries = 0;
let ws = null;
let fetchingRest = false;
let fiatCoins = [];
let _coinInfoSanitized = [];
let blockedCoins = [];
let exchangeInfo = {};
let homeDisplayCoins = [];
let marketTrendCoins = [];
let marketsDataRendered = false;
let quoteAsset = "USDT";

// logic helpers

const isCoinBlocked = (coin) => {
  return coin in blockedCoins;
};

const isFiatTradeable = async (fiat) => {
  if (!(fiat in fiatCoins)) return false;
  return fiatCoins[fiat]?.is_enabled;
};

const isCoinFiat = (coin) => {
  return coin in fiatCoins;
};

// logic functions

const fetchandSanitizeCapitalConfigs = async () => {
  const capitalConfigsUrl =
    "https://s1.backend.cryptoxpress.com/binance-exchange/capital-configs";
  try {
    const _coinInfo = await (
      await fetch(capitalConfigsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY4MCwiaWF0IjoxNzA2MTY0OTA2LCJleHAiOjE3MDg3NTY5MDZ9.xu5e836JJ-koOTxwCgeKTRIsUvwAk0ODM4XZOmTXmYU",
        },
      })
    ).json();

    exchangeInfo = await (
      await fetch(`${CX_BINANCE_BASE_URL}/spot/api/v3/exchangeInfo`)
    ).json();

    for (let i = 0; i < _coinInfo.length; i++) {
      const coin = _coinInfo[i];
      if (!coin?.coin) continue;
      // don't show non-trading coins
      if (!coin.trading) continue;
      // check whether to enable fiat trading if coin is fiat
      if (coin.isLegalMoney && isFiatTradeable(coin.coin)) {
        coin.isFiatTradingEnabled = true;
      }
      // check if coin is blocked from trading in CX
      coin.isTradingBlocked = isCoinBlocked(coin.coin);
      try {
        // Get all valid trading pairs (symbols) for a coin from exchange info and merge it to the coin info list
        coin.pairs = exchangeInfo?.symbols?.filter((symbol) => {
          if (
            symbol?.baseAsset === coin.coin &&
            symbol?.status.match(/^(TRADING|HALT)$/)
          ) {
            if (isCoinFiat(symbol?.quoteAsset))
              return isFiatTradeable(symbol?.quoteAsset);
            return !isCoinBlocked(symbol?.quoteAsset);
          }
          return false;
        });
      } catch (err) {
        console.error(err, "Error Sanitizing Coin Info");
      }
      _coinInfoSanitized.push(coin);
    }

    // Sort alphabetically
    _coinInfoSanitized = _coinInfoSanitized.sort(function (a, b) {
      const nameA = a?.coin?.toUpperCase();
      const nameB = b?.coin?.toUpperCase();
      return nameA?.localeCompare(nameB);
    });

    homeDisplayCoins = HIGHLIGHT_COINS.map((item) => {
      return _coinInfoSanitized.find((coin) => coin.coin === item);
    }).filter((item) => typeof item !== "undefined");

    marketTrendCoins = TREND_COINS.map((item) => {
      return _coinInfoSanitized.find((coin) => coin.coin === item);
    }).filter((item) => typeof item !== "undefined");
    // console.log("Home coin info: ", homeDisplayCoins);
  } catch (e) {
    console.log("Capital Configs Error", e);
    alert("Capital Configs Error");
  }
};

const fetchFiatsAndBlockedCoins = async () => {
  const blockedCoinUrl =
    "https://s1.backend.cryptoxpress.com/blocked-coins?_limit=-1";
  const _blocked = await (
    await fetch(blockedCoinUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY4MCwiaWF0IjoxNzA2MTY0OTA2LCJleHAiOjE3MDg3NTY5MDZ9.xu5e836JJ-koOTxwCgeKTRIsUvwAk0ODM4XZOmTXmYU",
      },
    })
  ).json();
  if (_blocked && _blocked.length > 0) {
    const _hashedBlockedCoins = {};
    for (const coin of _blocked) {
      _hashedBlockedCoins[coin.symbol] = coin;
    }
    blockedCoins = _hashedBlockedCoins;
  }

  const fiatCoinUrl =
    "https://s1.backend.cryptoxpress.com/fiat-coins?_limit=-1";
  const _fiats = await (
    await fetch(fiatCoinUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY4MCwiaWF0IjoxNzA2MTY0OTA2LCJleHAiOjE3MDg3NTY5MDZ9.xu5e836JJ-koOTxwCgeKTRIsUvwAk0ODM4XZOmTXmYU",
      },
    })
  ).json();
  if (_fiats && _fiats.length > 0) {
    const _hashedFiatCoins = {};
    for (const coin of _fiats) {
      _hashedFiatCoins[coin.symbol] = coin;
    }
    fiatCoins = _hashedFiatCoins;
  }
};

const fetch24HrTickerRest = async () => {
  fetchingRest = true;
  try {
    // const tickerURL = 'https://api.binance.com/api/v3/ticker/24hr'
    const tickerURL = `${CX_BINANCE_BASE_URL}/spot/api/v3/ticker/24hr`;
    const tickers = await (await fetch(tickerURL)).json();

    if (tickers) {
      for (const data of tickers) {
        if (data) {
          // format data
          const _ticker = {
            symbol: data.symbol,
            high: Number(data.highPrice) * 1.002,
            low: Number(data.lowPrice) * 1.002,
            bid: Number(data.bidPrice),
            ask: Number(data.askPrice),
            open: Number(data.openPrice) * 1.002,
            close: parseFloat((Number(data.lastPrice) * 1.002).toFixed(8)),
            last: parseFloat((Number(data.lastPrice) * 1.002).toFixed(8)),
            change: Number(data.priceChange),
            percentage: Number(data.priceChangePercent),
            volume: Number(data.volume),
          };
          _priceTickers[_ticker?.symbol?.toLowerCase()] = _ticker;
        }
      }

      // console.log("Price Ticker from Rest: ", _priceTickers);
    }
  } catch (e) {
    console.log("24hr Ticker Error", e);
    alert("24hr Rest Ticker Error");
  } finally {
    fetchingRest = false;
  }
};

const open24HrTickerWs = (interval = 5000) => {
  fetch24HrTickerRest();
  const wsURL = `wss://bwsp.s1.cryptoxpress.com/ws/!ticker@arr`;
  ws = new WebSocket(wsURL);

  const rateLimit = RateLimit(1, interval);

  ws.onerror = (err) => {
    console.error("24hr Ticker Error", err);
  };

  ws.onclose = (code, reason) => {
    console.log(`24hr Ticker WS connection CLOSED`, code, reason);
    // Retry connection if not closed manually
    if ((!code || (code && code !== 420)) && wsConnectionRetries <= 20) {
      console.log(`RETRYING 24hr Ticker Websocket`);
      wsConnectionRetries += 1;
      ws = null;
      return open24hrTickerWS(interval);
    }
  };

  ws.onopen = () => {
    console.log(`24hr Ticker Websocket connection OPENED`);
    wsConnectionRetries = 0;
  };

  ws.onmessage = (msg) => {
    if (rateLimit(ws) || fetchingRest) {
      return;
    } else {
      if (!msg?.data) return;
      const parsedData = JSON.parse(msg.data);

      for (const data of parsedData) {
        // format data
        const _ticker = {
          symbol: data.s,
          high: Number(data.h),
          low: Number(data.l),
          bid: Number(data.b),
          ask: Number(data.a),
          open: Number(data.o),
          close: parseFloat((Number(data.c) * 1.002).toFixed(8)),
          last: parseFloat((Number(data.c) * 1.002).toFixed(8)),
          change: Number(data.p),
          percentage: Number(data.P),
          volume: Number(data.v),
        };
        priceTickers.setObject({
          ...priceTickers.getObject(),
          [_ticker?.symbol?.toLowerCase()]: _ticker,
        });
      }

      // console.log("Price Ticker from WS: ", priceTickers.getObject());
    }
  };
};

// general helpers

const RateLimit = (limit, interval) => {
  let now = 0;
  const last = Symbol("last");
  const count = Symbol("count");
  setInterval(() => ++now, interval);
  return (_ws) => {
    if (!_ws) return null;
    if (_ws[last] !== now) {
      _ws[last] = now;
      _ws[count] = 1;
    } else {
      return ++_ws[count] > limit;
    }
  };
};

function VariableObserver(initialValue = null) {
  let value = initialValue;
  let isObject = typeof initialValue === "object" && initialValue !== null;

  const event = new CustomEvent("variableChanged", {
    detail: { newValue: value },
  });

  const listeners = [];

  function setValue(newValue) {
    if (!isObject && value !== newValue) {
      value = newValue;
      event.detail.newValue = newValue;
      dispatchEvent(event);
    }
  }

  function setObject(newObject) {
    if (isObject && JSON.stringify(value) !== JSON.stringify(newObject)) {
      value = newObject;
      event.detail.newValue = newObject;
      dispatchEvent(event);
    }
  }

  function getValue() {
    return value;
  }

  function addEventListener(type, listener) {
    if (type === "variableChanged") {
      listeners.push(listener);
    }
  }

  function removeEventListener(type, listener) {
    if (type === "variableChanged") {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  function dispatchEvent(event) {
    for (const listener of listeners) {
      listener(event);
    }
  }

  return {
    setValue,
    getObject: isObject ? () => value : null,
    setObject: isObject ? setObject : null,
    getValue: !isObject ? getValue : null,
    addEventListener,
    removeEventListener,
  };
}

const getCoinPair = (coin = "", quote = "usdt") => {
  if (coin === quote) {
    return `${quote.toLowerCase()}idrt`;
  }

  return `${coin.toLowerCase()}${quote.toLowerCase()}`;
};

// binding logic functions with ui functions

// fetch 24hr ticker and update
open24HrTickerWs();

// fetch initial coins
fetchFiatsAndBlockedCoins().then(() => {
  fetchandSanitizeCapitalConfigs().then(() => {
    renderMarketTable(priceTickers.getObject());
    renderMarketTrend(priceTickers.getObject());
  });
});

// ui functions

const renderMarketTable = (priceTickers = null) => {
  const market_table_container = $("#market_table_container");

  let table_body = ``;

  // console.log("Home coins: ", homeDisplayCoins, priceTickers);
  homeDisplayCoins
    .filter((item) => item !== null && typeof item !== "undefined")
    .forEach((coin, index) => {
      let priceTickerObj =
        priceTickers[
          `${getCoinPair(coin.coin.toLowerCase(), quoteAsset.toLowerCase())}`
        ];
      // console.log(
      //   "Price tick: ",
      //   priceTickers[
      //     `${getCoinPair(coin.coin.toLowerCase(), quoteAsset.toLowerCase())}`
      //   ],
      //   getCoinPair(coin.coin.toLowerCase(), quoteAsset.toLowerCase())
      // );
      if (priceTickerObj) {
        table_body += `
		<tr id="${coin?.name}">
			<td data-label="NO.">${index + 1}</td>
			<td data-label="NAME">
				<div class="d-flex justify-content-between align-center px-3">
				<img class="icon" src="https://cdn.jsdelivr.net/gh/cryptoxpress/crypto-icons/iconspng/${coin?.coin?.toLowerCase()}.png" alt="">
				<span>${coin?.name}</span>
				<span>${coin?.coin}</span>
				</div>
			</td>
			<td data-label="LAST PRICE" id="${coin?.coin}_last">${
          priceTickerObj?.last
        } ${quoteAsset}</td>
			<td data-label="CHANGE" id="${coin?.coin}_change">${
          priceTickerObj?.percentage
        }%</td>
			<td id="${coin?.coin}_stats">${
          parseFloat(priceTickerObj?.percentage) < 0 ? "Down" : "Up"
        }</td>
			<td>
				<div class="d-flex justify-content-center align-center">
				<button class="trade-btn">Trade</button>
				</div>
			</td>
		</tr>
	`;
      }
    });

  if (table_body.length > 0) {
    const output = `
      <table>
        <thead>
          <tr>
          <th>NO.</th>
          <th>NAME</th>
          <th>LAST PRICE</th>
          <th>CHANGE</th>
          <th>MARKET STATS</th>
          <th>TRADE</th>
          </tr>
        </thead>

        ${table_body}
      </table>
    `;

    market_table_container.html(output);
    marketsDataRendered = true;
  }
};

const renderMarketTrend = (priceTickers = null) => {
  const market_trends_container = $("#market-trends-list");

  let output = ``;

  marketTrendCoins.forEach((coin) => {
    let priceTickerObj;
    if (coin?.coin?.toLowerCase() === quoteAsset?.toLowerCase()) {
      priceTickerObj = priceTickers[`${quoteAsset?.toLowerCase()}idrt`];
    } else {
      priceTickerObj =
        priceTickers[
          `${coin?.coin?.toLowerCase()}${quoteAsset?.toLowerCase()}`
        ];
    }

    if (priceTickerObj) {
      output += `
	  <div class="market-card">
			<div class="market-card-content">
			<img src="https://cdn.jsdelivr.net/gh/cryptoxpress/crypto-icons/iconspng/${coin?.coin?.toLowerCase()}.png" alt="">
			<h2>${coin?.coin}</h2>

			<div class="market-card-tag">
				<p>${coin?.name}</p>
			</div>

      <span id="${coin?.name}_arrow">
			${
        priceTickerObj?.percentage < 0
          ? '<i class="material-icons" style="color: #B6B6B6;">south_west</i>'
          : '<i class="material-icons" style="color: #B6B6B6;">north_east</i>'
      }
      </span>
			</div>
			<span class="border market-card-rule w-100 h-1"></span>
			<div class="market-card-content">
			<div class="w-100">
				<h2 class="market-value" id="${
          coin?.name
        }_value">${priceTickerObj?.last?.toFixed(2)} ${
        coin?.coin?.toLowerCase() === quoteAsset?.toLowerCase()
          ? "IDRT"
          : quoteAsset
      }</h2>
				<div class="gap-y-9m"></div>
				<p id="${coin?.name}_percent" class="${
        priceTickerObj?.percentage < 0 ? "text-danger" : ""
      }">${priceTickerObj?.percentage}%</p>
			</div>

      <!-- <svg id="${coin?.name}_graph"></svg> -->
			</div>
		</div>
	  `;
    }
  });

  market_trends_container.html(output);
};

const updateMarketTableAndTrend = (priceTickers = null) => {
  if (homeDisplayCoins.length !== priceTickers.length) {
    renderMarketTable(priceTickers);
    renderMarketTrend(priceTickers);
  }
  homeDisplayCoins.forEach((coin) => {
    let priceTickerObj =
      priceTickers[`${coin?.coin?.toLowerCase()}${quoteAsset?.toLowerCase()}`];
    const lastPrice = $(`#${coin?.coin}_last`);
    const change = $(`#${coin?.coin}_change`);
    const stats = $(`#${coin?.coin}_stats`);
    const graph = $(`#${coin?.coin}_graph`);

    if (priceTickerObj && lastPrice && change && stats && graph) {
      lastPrice.html(`${priceTickerObj?.last?.toFixed(2)} ${quoteAsset}`);
      change.html(`${priceTickerObj?.percentage}%`);
      stats.html(
        `${parseFloat(priceTickerObj?.percentage) < 0 ? "Down" : "Up"}`
      );
    }

    // for trend chart
    const value = $(`#${coin?.name}_value`);
    const percent = $(`#${coin?.name}_percent`);
    const arrow = $(`#${coin?.name}_arrow`);

    if (priceTickerObj && value && percent && arrow) {
      value.html(
        `${priceTickerObj?.last?.toFixed(2)} ${
          coin?.coin?.toLowerCase() === quoteAsset?.toLowerCase()
            ? "IDRT"
            : quoteAsset
        }`
      );
      percent.html(`${priceTickerObj?.percentage}%`);
      arrow.html(
        `${
          priceTickerObj?.percentage < 0
            ? '<i class="material-icons" style="color: #B6B6B6;">south_west</i>'
            : '<i class="material-icons" style="color: #B6B6B6;">north_east</i>'
        }`
      );
    }

    // chart showing
    // const data = [
    //   { x: 0, y: 30 },
    //   { x: 1, y: 40 },
    //   { x: 2, y: 25 },
    //   { x: 3, y: 45 },
    //   { x: 4, y: 35 },
    // ];

    // const svgWidth = 76;
    // const svgHeight = 40;

    // // Create SVG element
    // const svg = d3
    //   .select("#graph")
    //   .attr("width", svgWidth)
    //   .attr("height", svgHeight);

    // // Define line function with curve interpolation
    // const line = d3
    //   .line()
    //   .x((d) => d.x * 50) // Scale x values by 50
    //   .y((d) => svgHeight - d.y) // Invert y values and scale
    //   .curve(d3.curveMonotoneX); // Use monotone curve interpolation

    // // Draw line
    // svg
    //   .append("path")
    //   .datum(data)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("stroke-width", 2)
    //   .attr("d", line);

    // // Hide grid lines and axes
    // svg.selectAll(".domain, .tick line").remove();
  });
};

// event listeners

priceTickers.addEventListener("variableChanged", (event) => {
  if (marketsDataRendered) {
    updateMarketTableAndTrend(event.detail.newValue);
  } else {
    renderMarketTable(event.detail.newValue);
    renderMarketTrend(event.detail.newValue);
  }
});
