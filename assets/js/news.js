// variables

const loading = VariableObserver(false);

// logic

const getNewsList = async () => {
  loading.setValue(true);
  const resp = await (
    await fetch(
      "https://cryptonews-api.com/api/v1/category?section=general&items=8&page=1&token=jenkblftud4ceyamhv7imsovxffsctjjjak9yniq"
    )
  ).json();

  return resp.data;
};

// caller

getNewsList()
  .then((res) => {
    loading.setValue(false);
    renderNewsList(res);
  })
  .catch((err) => {
    alert("Error fetching news: ", err);
  });

// ui

const renderNewsList = (news = []) => {
  const newsListElement = $("#newsList");

  let output = ``;

  // truncateString from utilities

  if (news.length > 0) {
    console.log("News list from render: ", newsListElement, news);
    news.forEach((item) => {
      output += `
			<div class="flex flex-col justify-start align-center news-card" onclick="browseUrl('${
        item?.news_url
      }')">
				<img src="${item?.image_url}" alt="">
				<div class="p-4 flex flex-col gap-3 items-start w-full">
				<p>${item?.source_name}</p>
				<h2>${item?.title}</h2>
				<h3>${truncateString(item?.text, 150)}</h3> 
				</div>
			</div>
		`;
    });
  }

  newsListElement.html(output);
};

// helper
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

// event listener

loading.addEventListener("variableChanged", function (event) {
  $("#newsList_loader").toggleClass("hidden", !event.detail.newValue);
  $("#newsList").toggleClass("hidden", event.detail.newValue);
});
