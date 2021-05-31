import axios from 'axios';
import { showAlert } from './alerts'

export const login = async (email, password) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const signup = async (name, email, password, passwordConfirm) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Created user successfully, check your mail');
            window.setTimeout(() => {
                location.assign('/');
            }, 3000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const forgotPassword = async (email) => {
    try{
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/forgetPassword',
            data: {
                email
            }
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Password reset token was sent successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 10000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const resetPassword = async (password, passwordConfirm, token) => {
    try{
        const res = await axios({
            method: 'PATCH',
            url: `/api/v1/users/resetPassword/${token}`,
            data: {
                password, 
                passwordConfirm
            }
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Password has been reset successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 10000);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if(res.data.status === 'success') {
            showAlert('success', 'Logged out successfully');
            location.reload(true);
        }
    } catch (err) {
        showAlert('error', 'Error logging out. Try Again!');
    }
}