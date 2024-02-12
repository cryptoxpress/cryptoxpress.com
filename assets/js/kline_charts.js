// variables and constants

const dummyChartsData = JSON.parse(
  String.raw`[{"date":"2024-02-07 12:00","value":0.03976608},{"date":"2024-02-07 12:30","value":0.03924704},{"date":"2024-02-07 13:00","value":0.03940719},{"date":"2024-02-07 13:30","value":0.03911452},{"date":"2024-02-07 14:00","value":0.03933764},{"date":"2024-02-07 14:30","value":0.03930157},{"date":"2024-02-07 15:00","value":0.03945276},{"date":"2024-02-07 15:30","value":0.03933626},{"date":"2024-02-07 16:00","value":0.03931961},{"date":"2024-02-07 16:30","value":0.03929275},{"date":"2024-02-07 17:00","value":0.03932666},{"date":"2024-02-07 17:30","value":0.03906805},{"date":"2024-02-07 18:00","value":0.03916471},{"date":"2024-02-07 18:30","value":0.03911413},{"date":"2024-02-07 19:00","value":0.03916158},{"date":"2024-02-07 19:30","value":0.03922294},{"date":"2024-02-07 20:00","value":0.03935311},{"date":"2024-02-07 20:30","value":0.0393572},{"date":"2024-02-07 21:00","value":0.03951348},{"date":"2024-02-07 21:30","value":0.04008997},{"date":"2024-02-07 22:00","value":0.04063045},{"date":"2024-02-07 22:30","value":0.04012856},{"date":"2024-02-07 22:55","value":0.03941837},{"date":"2024-02-07 23:25","value":0.03946421},{"date":"2024-02-07 23:55","value":0.03954873},{"date":"2024-02-08 00:25","value":0.03942856},{"date":"2024-02-08 00:55","value":0.03925802},{"date":"2024-02-08 01:25","value":0.03907945},{"date":"2024-02-08 01:55","value":0.03885814},{"date":"2024-02-08 02:25","value":0.03849671},{"date":"2024-02-08 02:55","value":0.03766738},{"date":"2024-02-08 03:25","value":0.03691024},{"date":"2024-02-08 03:55","value":0.0372595},{"date":"2024-02-08 04:25","value":0.03787878},{"date":"2024-02-08 04:55","value":0.03834928},{"date":"2024-02-08 05:25","value":0.03787953},{"date":"2024-02-08 05:55","value":0.03769058},{"date":"2024-02-08 06:25","value":0.03797119},{"date":"2024-02-08 06:55","value":0.03811379},{"date":"2024-02-08 07:25","value":0.03808362},{"date":"2024-02-08 07:55","value":0.03807267},{"date":"2024-02-08 08:25","value":0.03780393},{"date":"2024-02-08 08:55","value":0.03953161},{"date":"2024-02-08 09:25","value":0.03966857},{"date":"2024-02-08 09:55","value":0.0391802},{"date":"2024-02-08 10:25","value":0.03967817},{"date":"2024-02-08 10:55","value":0.03965837},{"date":"2024-02-08 11:25","value":0.03966916}]`
);
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
let timeFormatString = "%I:%M %p";
// variables with events
const loadingKline = VariableObserver(false);
const interval = VariableObserver("1d");
const klineData = VariableObserver({});
const chartsData = new Map();

// logic functions

const selectIntervalToFetch = () => {
  let params = {};
  switch (interval.getValue()) {
    case "1d":
      timeFormatString = "%I %M %p";
      params = {
        // interval: KLINE_INTERVALS.FIFTEEN_MINUTES, // fetch 1 minute intervals
        startTime: moment().subtract(1, "d").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 96,
      };
      break;
    case "1w":
      timeFormatString = "%e %b";
      params = {
        // interval: KLINE_INTERVALS.ONE_HOUR, // fetch 1 minute intervals
        startTime: moment().subtract(1, "w").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 84,
      };
      break;
    case "1M":
      timeFormatString = "%e %b";
      params = {
        // interval: KLINE_INTERVALS.EIGHT_HOURS, // fetch 1 minute intervals
        startTime: moment().subtract(1, "M").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 120,
      };
      break;
    case "6M":
      timeFormatString = "%b";
      params = {
        // interval: KLINE_INTERVALS.THREE_DAYS, // fetch 1 minute intervals
        startTime: moment().subtract(6, "M").format("YYYY-MM-DD"), // fetch from 10 min ago
        samples: 150,
      };
      break;
    case "1Y":
      timeFormatString = "%b";
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
  const url = `https://coincodex.com/api/coincodex/get_coin_history/${symbol}/${startTime}/${endTime}/${samples}`;
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
        [interval.getValue()]: res[symbol],
      });
    }
  } catch (err) {
    console.log("Kline error: ", err);
  } finally {
    loadingKline.setValue(false);
  }
};

const formatKlineData = () => {
  const _labels = [];
  const _data = [];
  const valuesFromKlineData = klineData.getObject()[interval.getValue()];
  console.log("Kline data: ", valuesFromKlineData.length);
  if (valuesFromKlineData && valuesFromKlineData.length > 0) {
    valuesFromKlineData.forEach((obj, idx) => {
      try {
        _data.push(parseFloat(Number(obj[1]).toFixed(8)));
        _labels.push(obj[0]);
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
  console.log("klineData: ", event.detail.newValue);
  if (event.detail.newValue && Object.keys(event.detail.newValue).length > 0) {
    const chartData = formatKlineData();
    chartsData.clear(); // clear previous data before populating new values else it'll overlap

    for (
      let i = 0;
      i < (chartData.dates.length || chartData.prices.length);
      i++
    ) {
      chartsData.set(chartData.dates[i], chartData.prices[i]);
    }

    console.log(
      "Kline chart data: ",
      JSON.stringify(
        Array.from(chartsData, ([key, value]) => ({ date: key, value }))
      )
    );

    renderChart(
      Array.from(chartsData, ([key, value]) => ({ date: key, value }))
    );
  }
});

$(".kline-time").click(function () {
  const requestTime = $(this).text().trim();
  interval.setValue(requestTime);
});

interval.addEventListener("variableChanged", (event) => {
  console.log("Interval changed: ", event.detail.newValue);
  fetchKlineData("USDT");
});

loadingKline.addEventListener("variableChanged", (event) => {
  console.log("Loading kline: ", event.detail.newValue);
  $("#graph_loader").toggleClass("hidden", !event.detail.newValue);
  $("#graph_container").toggleClass("hidden", event.detail.newValue);
});

// ui

const renderChart = (chartsData = []) => {
  const parentWidth = $("#graph_container").width();

  // Sample data
  // [
  //   { date: "A", value: 10 },
  //   { date: "B", value: 20 },
  //   { date: "C", value: 15 },
  //   { date: "D", value: 25 },
  //   { date: "E", value: 30 },
  // ]
  const data = chartsData.map((item) => ({
    date: d3.utcParse("%s")(item.date),
    value: item.value,
  }));

  // Set up dimensions for the chart
  const width = parentWidth - 100;
  const height = 300;
  const margin = { top: 30, right: 30, bottom: 30, left: 30 }; // Increased bottom margin for x-axis labels

  console.log(
    "Parent width: ",
    d3.extent(data, (d) => d.date)
  );

  // Remove any existing SVG
  d3.select("#graph_container").select("svg").remove();

  // Create SVG element
  const svg = d3
    .select("#graph_container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left + 20},${margin.top})`);

  // Set up scales
  const x = d3.scaleUtc(
    d3.extent(data, (d) => d.date),
    [0, width]
  ); // Use unix scale for time

  const y = d3.scaleLinear([0, d3.max(data, (d) => d.value)], [height, 0]);

  // Draw area curve
  const area = d3
    .area()
    .x((d) => x(d.date))
    .y0(height)
    .y1((d) => y(d.value));

  svg
    .append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .on("mouseover", function (event) {
      const [xCoord] = d3.pointer(event, this);
      const bisectDate = d3.bisector((d) => d.date).left;
      const x0 = x.invert(xCoord);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const dataPoint = x0 - d0.date > d1.date - x0 ? d1 : d0;
      // console.log("Area data: ", dataPoint?.date?.toLocaleDateString());

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
          <p class="date">${dataPoint?.date?.toLocaleDateString()}</p>
          <p class="value">${dataPoint?.value}</p>
        `
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event, d) {
      const [xCoord] = d3.pointer(event, this);
      const bisectDate = d3.bisector((d) => d.date).left;
      const x0 = x.invert(xCoord);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const dataPoint = x0 - d0.date > d1.date - x0 ? d1 : d0;
      // console.log("Area data: ", dataPoint?.date?.toLocaleDateString());

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
          <p class="date">${dataPoint?.date?.toLocaleDateString()}</p>
          <p class="value">${dataPoint?.value}</p>
        `
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Draw line
  const line = d3
    .line()
    .x((d) => x(d.date))
    .y((d) => y(d.value));

  svg.append("path").datum(data).attr("class", "line").attr("d", line);

  // Draw x-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat(timeFormatString)));

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
