const COINS_URL = 'https://api.coinpaprika.com/v1/coins';

const getSingleCoinUrl = id => `https://api.coinpaprika.com/v1/coins/${id}/ohlcv/today/`;

class MyPromise {
  constructor(behaviorFunction) {
    this._status = 'pending';
    this._result = null;
    this._errorCallbacks = [];
    this._successCallbacks = [];

    behaviorFunction(this._resolve.bind(this), this._reject.bind(this));
  }

  then(successCallback) {
    if (this._status === 'fulfilled') {
      successCallback(this._result);
    } else {
      this._successCallbacks.push(successCallback);
    } 
  }

  catch(errorCallback) {
    if (this._status === 'rejected') {
      errorCallback(this._result);
    } else {
      this._errorCallbacks.push(errorCallback);
    } 
  }

  _resolve(data) {
    this._status = 'fulfilled';
    this._result = data;
    this._successCallbacks.forEach(callback => callback(data))
  }

  _reject(error) {
    this._status = 'rejected';
    this._result = error;
    this._errorCallbacks.forEach(callback => callback(data))
  }
}

const HttpService = {
  sendRequest(url) {
    let promise = new MyPromise((resolve, reject) => {
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
    }, err => {
      console.log('from then')
      console.error(err)
    })

    promise.catch(err => {
      console.error(err)
    })



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

