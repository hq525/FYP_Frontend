import { makeObservable, action, observable, computed } from 'mobx';

class UserStore {
    isAuthenticated = false;
    user = null;
    constructor() {
        makeObservable(this, {
            isAuthenticated: observable,
            user: observable,
            getAuthenticated: computed,
            setAuthenticated: action,
            getUser: computed,
            setUser: action
        })
    }
    get getUser() {
        return this.user
    }
    setUser(user) {
        this.user = user
    }
    get getAuthenticated() {
        return this.isAuthenticated
    }
    setAuthenticated(authenticated) {
        this.isAuthenticated = authenticated
    }
}



export default UserStore;