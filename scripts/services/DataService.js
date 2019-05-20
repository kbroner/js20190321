const COINS_URL = 'https://api.coinpaprika.com/v1/coins';

const getSingleCoinUrl = id => `https://api.coinpaprika.com/v1/coins/${id}/ohlcv/today/`;

const DataService = {
  _sendRequest({ url, successCallback, method = 'GET' }) {
    var xhr = new XMLHttpRequest();

    xhr.open(method, url);

    xhr.send();

    xhr.onload = () => {
      let responseData = JSON.parse(xhr.responseText);
      successCallback(responseData);
    }
  },

  _sendMultipleRequests(urls, callback) {
    let requestCount = urls.length;
    let results = [];

    urls.forEach(url => {
      DataService._sendRequest({ 
        url, 
        successCallback: data => {
          results.push({ url, data });
          requestCount--;

          if (!requestCount) {
            callback(results);
          }
        }
      })
    })
  },

  getCurrencies(callback) {
    DataService._sendRequest({
      url: COINS_URL,
      successCallback: data => {
        DataService.getCurrenciesPrices(data.slice(0, 10), callback)
      },
    })
  },

  getCurrenciesPrices(data, callback) {
    let coinsIds = data.map(coin => coin.id);
    const coinsIdMap = coinsIds.reduce((acc, id) => {
      acc[getSingleCoinUrl(id)] = id;
      return acc;
    }, {});

    DataService._sendMultipleRequests(Object.keys(coinsIdMap), coins => {
      const dataWithPrice = data.map(item => {
        let itemUrl = getSingleCoinUrl(item.id);
        let [itemPriceData] = coins.find(coin => coin.url === itemUrl).data;
        item.price = itemPriceData.close;

        return item;
      })

      callback(dataWithPrice)
    })

  }
}

export default DataService;

