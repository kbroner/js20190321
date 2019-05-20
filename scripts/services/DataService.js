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

  then(successCallback, errorCalback) {
    if (this._status === 'fulfilled') {
      successCallback(this._result);
    } else if (this._status === 'rejected') {
      errorCalback(this._result);
    } else {
      this._successCallbacks.push(successCallback);
      this._errorCallbacks.push(errorCalback);
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

    // let requestCount = urls.length;
    // let results = [];

    // urls.forEach(url => {
    //   HttpService.sendRequest({ 
    //     url, 
    //     successCallback: data => {
    //       results.push({ url, data });
    //       requestCount--;

    //       if (!requestCount) {
    //         callback(results);
    //       }
    //     }
    //   })
    // })
  },
};

const DataService = {
  getCurrencies() {
    return HttpService.sendRequest(COINS_URL).then(data => {
      return DataService.getCurrenciesPrices(data.slice(0, 10));
    })
  },

  getCurrenciesPrices(data) {
    const coinsUrls = data.map(coin => getSingleCoinUrl(coin.id));

    return HttpService.sendMultipleRequests(coinsUrls)
      .then(coins => {
        return data.map((item, index) => {
          item.price = coins[index][0].close;
          return item;
        })
      })

  }
}

export default DataService;

