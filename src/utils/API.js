import axios from 'axios';

export default class API {
  constructor() {}
  get(path) {
    return new Promise((resolve, reject) => {
      axios
        .get(path)
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
        .post(path, data)
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
        .put(path, data)
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
        .delete(path, data)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(error.response);
        });
    });
  }
}
