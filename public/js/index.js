import '@babel/polyfill'
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateData } from './updateSettings';

// DOM elements create and check if it exists
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

if(mapBox) {
    const locations =JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations);
}

if(loginForm) {
    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(logOutBtn) logOutBtn.addEventListener('click', logout);

if(userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        updateData(name, email);
    })
}