// logic

const getNewsList = async () => {
  const coins = ["btc", "eth", "ltc", "xrp", "doge"];
  const newsFetchList = [];

  for (const coin of coins) {
    newsFetchList.push(
      (
        await fetch(
          `https://cryptonews-api.com/api/v1?tickers=${coin}&items=3&token=jenkblftud4ceyamhv7imsovxffsctjjjak9yniq`
        )
      ).json()
    );
  }

  const resp = await Promise.all(newsFetchList);

  return resp.map((item) => item?.data).flat();
};

// caller

getNewsList()
  .then((res) => {
    renderNewsList(res);
  })
  .catch((err) => {
    alert("Error fetching news: ", err);
  });

// ui

const renderNewsList = (news = []) => {
  const newsListElement = $("#newsList");

  let output = ``;

  if (news.length > 0) {
    console.log("News list from render: ", newsListElement, news);
    news.forEach((item) => {
      output += `
			<div class="d-flex flex-column justify-content-start align-center news-card" onclick="browseUrl('${item?.news_url}')">
				<img src="${item?.image_url}" alt="">
				<div class="p-4 d-flex flex-column gap-12 align-start w-100">
				<p>${item?.source_name}</p>
				<h2>${item?.title}</h2>
				<h3>${item?.text}</h3>
				</div>
			</div>
		`;
    });
  }

  newsListElement.html(output);
};
