import '@babel/polyfill'
import { displayMap } from './mapbox';
import { login, signup, forgotPassword, resetPassword, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

// DOM elements create and check if it exists
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgotForm = document.querySelector('.form--forgot');
const resetForm = document.querySelector('.form--reset');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if(mapBox) {
    const locations =JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations);
}

if(loginForm) {
    document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault();
        console.log("Login btn clicked");
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log("Signup btn pressed");
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name, email, password, passwordConfirm);
    });
}

if(forgotForm) {
    forgotForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        forgotPassword(email);
    })
}

if(resetForm) {
    resetForm.addEventListener('submit', e => {
        e.preventDefault();
        const url = document.URL;
        const token = url.split('/')[4];
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        resetPassword(password, passwordConfirm, token);
    })
}

if(logOutBtn) logOutBtn.addEventListener('click', logout);

if(userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        
        updateSettings(form, 'data');
    })
}

if(userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        
        document.querySelector('.btn--save-password').textContent = 'Updating...';

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');

        document.querySelector('.btn--save-password').textContent = 'Save Password';
        
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        // console.log(tourId);
        bookTour(tourId);
    });
}