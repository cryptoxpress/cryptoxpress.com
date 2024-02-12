const apiHostUrl = "https://s1.backend.cryptoxpress.com";
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTY4MCwiaWF0IjoxNzA3NzYxODYyLCJleHAiOjE3MTAzNTM4NjJ9.bWdJ1LBasIQc_iLSlgx4JTEAkhLlVXY-zW5loGOWg8Q";

const giftCardsContainer = $("#gift_cards_container");
const loadingGifts = VariableObserver(false); // for loading state

const getVouchers = async ({
  catagory = null,
  country = null,
  price = null,
  searchProduct = null,
  page = 0,
  limit = 4,
}) => {
  loadingGifts.setValue(true);
  let url = `${apiHostUrl}/xoxodays?_limit=${limit}&_start=${page * limit}${
    country ? `&countryName=${country}` : ``
  }${catagory ? `&categories_contains=${encodeURIComponent(catagory)}` : ``}`;
  const response = await (
    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwt,
      },
    })
  ).json();
  return response;
};

getVouchers({
  catagory: null,
  country: null,
  price: null,
  searchProduct: null,
  page: 0,
  limit: 4,
})
  .then((res) => {
    loadingGifts.setValue(false);
    console.log("Gift cards: ", res);
    renderGiftCards(res);
  })
  .catch((e) => {
    console.log("Error gift cards: ", e);
  });

const renderGiftCards = (gifts) => {
  let output = "";

  gifts.forEach((gift) => {
    const denominations = gift.valueDenominations.split(",");
    output += `
		<div class="gift-card">
			<img
				src="${gift.imageUrl}"
				alt="gift card"
			/>
			<div class="gift-footer">
			<h3>${gift.name}</h3>
			<p>$${denominations[denominations.length - 1]} - $${denominations[0]}</p>
			</div>
		</div>
		`;
  });

  giftCardsContainer.html(output);
};

loadingGifts.addEventListener("variableChanged", (event) => {
  console.log("Loading kline: ", event.detail.newValue);
  $(".gifts-loader").toggleClass("hidden", !event.detail.newValue);
  $(".gifts-loaded").toggleClass("hidden", event.detail.newValue);
});

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
