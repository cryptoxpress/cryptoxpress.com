const CMC_XPRESS_ID = 13251;

let xpressData = {};

async function fetchXpressData() {
   const response = await fetch(
      'https://com-cx-cmcproxy.server.cryptoxpress.com/',
      {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
         // mode: 'no-cors',
      }
   );
   console.log(response, 'xpress response');
   const data = await response.json();
   console.log(data, 'xpress data');
   if (data?.data?.[CMC_XPRESS_ID]) {
      xpressData = data.data[CMC_XPRESS_ID];
      updateXpressStatisticsTable();
      updateTopBarXpressPrice();
   }
}

function updateTopBarXpressPrice() {
   const usdQuotes = xpressData?.quote?.USD;
   $('#top_bar_xpress_price').text(
      `$${numberWithCommas(usdQuotes?.price?.toFixed(2))}`
   );
}

function updateXpressStatisticsTable() {
   const usdQuotes = xpressData?.quote?.USD;
   $('#xpress-data-price').text(
      `$${numberWithCommas(usdQuotes?.price?.toFixed(2))}`
   );
   $('#xpress-data-percent-change').text(
      `${usdQuotes?.percent_change_24h?.toFixed(2)}%`
   );
   $('#xpress-data-volume').text(
      `$${numberWithCommas(usdQuotes?.volume_24h?.toFixed(2))}`
   );
   $('#xpress-data-rank').text(`${numberWithCommas(xpressData?.cmc_rank)}`);
   $('#xpress-data-diluted-marketcap').text(
      `$${numberWithCommas(usdQuotes?.fully_diluted_market_cap?.toFixed(2))}`
   );
   $('#xpress-data-total-supply').text(
      `${numberWithCommas(xpressData?.total_supply)} XPRESS`
   );
   $('#xpress-data-max-supply').text(
      `${numberWithCommas(xpressData?.max_supply)} XPRESS`
   );
}

function numberWithCommas(n) {
   if (!n) return n;
   const parts = n.toString().split('.');
   return (
      parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      (parts[1] ? '.' + parts[1] : '')
   );
}

$(document).ready(function () {
   console.log('henlo');
   fetchXpressData();
});
