import axios from 'axios';

export default class API {
  config
  constructor() {
    this.config = {
      headers: {
        Authorization : null 
      }
    }
  }
  setAuthorizationToken(token) {
    this.config.headers.Authorization = 'Bearer ' + token
  }
  get(path) {
    return new Promise((resolve, reject) => {
      axios
        .get(path, this.config)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error.response);
        });
    });
  }
  post(path, data) {
    return new Promise((resolve, reject) => {
      axios
        .post(path, data, this.config)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error.response);
        });
    });
  }
  put(path, data) {
    return new Promise((resolve, reject) => {
      axios
        .put(path, data, this.config)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error.response);
        });
    });
  }
  delete(path, data) {
    return new Promise((resolve, reject) => {
      axios
        .delete(path, data, this.config)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error.response);
        });
    });
  }
}
