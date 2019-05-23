const COINS_URL = 'https://api.coinpaprika.com/v1/coins';

const getSingleCoinUrl = id => `https://api.coinpaprika.com/v1/coins/${id}/ohlcv/today/`;

const HttpService = {
  sendRequest(url) {
    let promise = new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url);

      xhr.send();

      xhr.onload = () => {
        let responseData = JSON.parse(xhr.responseText);
        resolve(responseData);
      }

      xhr.onerror = () => {
        let responseData = JSON.parse(xhr.responseText);
        reject(xhr.responseText);
      }
    });
   
    return promise;
  },

  sendMultipleRequests(urls) {
    let requests = urls.map(url => this.sendRequest(url))
    return Promise.all(requests);
  },
};

const DataService = {
  getCurrencies({ filter = '' } = {}) {

    return HttpService.sendRequest(COINS_URL).then(data => {
      const filteredData = data.filter(item => {
        return item.name.toLowerCase().includes(filter);
      }).slice(0, 10);
      return DataService.getCurrenciesPrices(filteredData);
    })
  },

  getCurrenciesPrices(data) {
    const coinsUrls = data.map(coin => getSingleCoinUrl(coin.id));

    return HttpService.sendMultipleRequests(coinsUrls)
      .then(coins => {
        return data.map((item, index) => {
          if (coins[index][0]) {
            item.price = coins[index][0].close;
          }
          return item;
        })
      })

  }
}

export default DataService;

