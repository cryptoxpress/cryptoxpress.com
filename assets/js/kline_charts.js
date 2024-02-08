// variables and constants
const quoteAsset = "USDT";
const XPRESS_INFO = {
  coin: "XPRESS",
  name: "XPRESS",
  contract: "0xaA9826732f3A4973FF8B384B3f4e3c70c2984651",
  isLegalMoney: false,
  isDexCoin: true,
};

const coin = {
  symbol: XPRESS_INFO.coin,
  name: XPRESS_INFO.name,
};
// variables with events
const loadingKline = VariableObserver(false);
const interval = VariableObserver("1d");
const klineData = VariableObserver({});
const chartsData = new Map();

// helper functions

const formatUnixDateToChartString = (unixDate) => {
  let duration = moment.duration(moment.unix(unixDate).diff(moment()));

  // Define thresholds for rounding
  const thresholds = [
    { unit: "y", value: 365 * 24 * 60 * 60 }, // 1 year in seconds
    { unit: "d", value: 24 * 60 * 60 }, // 1 day in seconds
    { unit: "h", value: 60 * 60 }, // 1 hour in seconds
    { unit: "m", value: 60 }, // 1 minute in seconds
  ];

  // Find the first threshold that matches the duration
  const threshold = thresholds.find(
    (threshold) => duration.asSeconds() >= threshold.value
  );

  // If a threshold is found, round the duration to that unit
  if (threshold) {
    duration = moment.duration(
      Math.round(duration.asSeconds() / threshold.value),
      threshold.unit
    );
  }

  // Format the duration to a human-readable format
  let formatString = "y[y] d[d] h[h] m[m]";
  let formattedTime = duration.format(formatString.trim());

  // Output the formatted time
  return formattedTime;
};

// logic functions

const selectIntervalToFetch = () => {
  let params = {};
  switch (interval.getValue()) {
    case "1d":
      params = {
        // interval: KLINE_INTERVALS.FIFTEEN_MINUTES, // fetch 1 minute intervals
        startTime: moment().subtract(1, "d").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 96,
      };
      break;
    case "1w":
      params = {
        // interval: KLINE_INTERVALS.ONE_HOUR, // fetch 1 minute intervals
        startTime: moment().subtract(1, "w").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 84,
      };
      break;
    case "1M":
      params = {
        // interval: KLINE_INTERVALS.EIGHT_HOURS, // fetch 1 minute intervals
        startTime: moment().subtract(1, "M").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 120,
      };
      break;
    case "6M":
      params = {
        // interval: KLINE_INTERVALS.THREE_DAYS, // fetch 1 minute intervals
        startTime: moment().subtract(6, "M").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 150,
      };
      break;
    case "1Y":
      params = {
        // interval: KLINE_INTERVALS.ONE_WEEK, // fetch 1 minute intervals
        startTime: moment().subtract(1, "Y").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 150,
      };
      break;
  }
  return { ...params, endTime: moment().format("YYYY-MM-DD") };
};

const fetchDexHistoricalCharts = async ({
  symbol,
  startTime,
  endTime,
  samples,
}) => {
  const url =
    "https://coincodex.com/api/coincodex/get_coin_history/XPRESS/2024-02-05/2024-02-06/96";
  const res = await (await fetch(url)).json();
  if (res) return res;
  return null;
};

const fetchKlineData = async (_quoteAsset = quoteAsset) => {
  if (loadingKline.getValue() || coin?.symbol === _quoteAsset) return;
  loadingKline.setValue(true);
  try {
    const symbol = `${coin?.symbol?.toUpperCase()}`;
    const res = await fetchDexHistoricalCharts({
      symbol,
      ...selectIntervalToFetch(),
    });
    if (res?.[symbol]) {
      klineData.setObject({
        ...klineData.getObject(),
        [interval.getValue()]: res[symbol],
      });
    }
  } catch (err) {
    console.log(err);
  } finally {
    loadingKline.setValue(false);
  }
};

const formatKlineData = () => {
  const _labels = [];
  const _data = [];
  const valuesFromKlineData = klineData.getObject()[interval.getValue()];
  if (valuesFromKlineData && valuesFromKlineData.length > 0) {
    valuesFromKlineData.forEach((obj, idx) => {
      try {
        _data.push(parseFloat(Number(obj[1]).toFixed(8)));
        _labels.push(formatUnixDateToChartString(obj[0]));
      } catch (err) {
        console.log(err);
      }
    });
  }
  return {
    dates: _labels,
    prices: _data,
  };
};

// variable observer
function VariableObserver(initialValue = null) {
  let value = initialValue;
  let isObject = typeof initialValue === "object" && initialValue !== null;

  const event = new CustomEvent("variableChanged", {
    detail: { newValue: value },
  });

  const listeners = [];

  function setValue(newValue) {
    const newValueOrFunction =
      typeof newValue === "function" ? newValue(value) : newValue;
    if (!isObject && value !== newValueOrFunction) {
      value = newValueOrFunction;
      event.detail.newValue = value;
      dispatchEvent(event);
    }
  }

  function setObject(newObject) {
    const newObjectOrFunction =
      typeof newObject === "function" ? newObject(value) : newObject;
    if (
      isObject &&
      JSON.stringify(value) !== JSON.stringify(newObjectOrFunction)
    ) {
      value = newObjectOrFunction;
      event.detail.newValue = JSON.parse(JSON.stringify(value));
      dispatchEvent(event);
    }
  }

  function getValue() {
    return value;
  }

  function addEventListener(type, listener) {
    if (type === "variableChanged") {
      listeners.push(listener);
      // If the value or object is set using a function, trigger the listener immediately
      if (typeof listener === "function") {
        listener(event);
      }
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

// execution
fetchKlineData("USDT");

// event listeners

klineData.addEventListener("variableChanged", (event) => {
  //   console.log("klineData: ", event.detail.newValue);
  if (event.detail.newValue && Object.keys(event.detail.newValue).length > 0) {
    const chartData = formatKlineData();

    for (
      let i = 0;
      i < (chartData.dates.length || chartData.prices.length);
      i++
    ) {
      chartsData.set(chartData.dates[i], chartData.prices[i]);
    }

    renderChart(
      Array.from(chartsData, ([key, value]) => ({ name: key, value }))
    );
  }
});

// ui

const renderChart = (chartsData = []) => {
  const parentWidth = $("#graph_container").width();

  // Sample data
  const data =
    chartsData.length > 0
      ? chartsData
      : [
          { name: "A", value: 10 },
          { name: "B", value: 20 },
          { name: "C", value: 15 },
          { name: "D", value: 25 },
          { name: "E", value: 30 },
        ];

  // Set up dimensions for the chart
  const width = parentWidth;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 100, left: 40 }; // Increased bottom margin for x-axis labels

  // Create SVG element
  const svg = d3
    .select("#graph_container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.name))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)])
    .nice()
    .range([height, 0]);

  // Draw area curve
  const area = d3
    .area()
    .x((d) => x(d.name) + x.bandwidth() / 2)
    .y0(height)
    .y1((d) => y(d.value));

  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Value: ${d.value}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event, d) {
      // Add mousemove event to move tooltip
      tooltip
        .html(`Value: ${d.value}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
      tooltip
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Draw line
  const line = d3
    .line()
    .x((d) => x(d.name) + x.bandwidth() / 2)
    .y((d) => y(d.value));

  svg.append("path").datum(data).attr("class", "line").attr("d", line);

  // Draw x-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-90)");

  // Draw y-axis
  svg
    .append("g")
    .call(d3.axisLeft(y))
    .call((g) => g.select(".domain").remove());

  // Append a tooltip div
  const tooltip = d3
    .select("#graph_container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
};
