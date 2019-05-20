const COINS_URL = 'https://api.coinpaprika.com/v1/coins';

const getSingleCoinUrl = id => `https://api.coinpaprika.com/v1/coins/${id}/ohlcv/today/`;

const HttpService = {
  sendRequest(url) {
    let promise = {
      _status: 'pending',
      _result: null,
      _successCallbacks: [],

      then(successCallback) {
        console.log('then')
        if (this._status === 'fulfilled') {
          successCallback(this._result);
        } else {
          this._successCallbacks.push(successCallback);
        }
        
      },

      _resolve(data) {
        console.log('resolve')
        this._status = 'fulfilled';
        this._result = data;
        this._successCallbacks.forEach(callback => callback(data))
      }
    };

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);

    xhr.send();

    xhr.onload = () => {
      let responseData = JSON.parse(xhr.responseText);
      promise._resolve(responseData);
      // successCallback(responseData);
    }

    return promise;
  },

  sendMultipleRequests(urls, callback) {
    let requestCount = urls.length;
    let results = [];

    urls.forEach(url => {
      HttpService.sendRequest({ 
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
};

const DataService = {
  getCurrencies(callback) {
    let promise = HttpService.sendRequest(COINS_URL);

    promise.then(result => {
      console.log(result)
    })

    setTimeout(() => {
      console.log('async cb')
      promise.then(result => {
        console.log(result)
      })
    }, 1000)

    // HttpService.sendRequest({
    //   url: COINS_URL,
    //   successCallback: data => {
    //     DataService.getCurrenciesPrices(data.slice(0, 10), callback)
    //   }
    // })
  },

  getCurrenciesPrices(data, callback) {
    let coinsIds = data.map(coin => coin.id);
    const coinsIdMap = coinsIds.reduce((acc, id) => {
      acc[getSingleCoinUrl(id)] = id;
      return acc;
    }, {});

    HttpService.sendMultipleRequests(Object.keys(coinsIdMap), coins => {
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

