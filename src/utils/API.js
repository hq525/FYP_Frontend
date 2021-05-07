import axios from 'axios';
import { ENDPOINT } from './config';

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
  refreshToken() {
    return new Promise((resolve, reject) => {
      if (localStorage.refresh_token) {
        this.config.headers.Authorization = 'Bearer ' + localStorage.refresh_token
        this
        .post(`${ENDPOINT}/refresh`,{})
        .then((data) => {
          localStorage.access_token = data.access_token
          resolve()
        })
        .catch((error) => {
          reject()
        })
      } else {
        reject()
      }  
    })
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
      .delete(path, {
        headers: this.config.headers,
        data
      })
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        reject(error.response);
      });
    });
  }
}
