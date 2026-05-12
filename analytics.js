import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/11.7.1/firebase-analytics.js';

const firebaseConfig = {
    apiKey: 'AIzaSyBxZtbieEKywKr5qxZ9b_TCAGqf4tSuDwE',
    authDomain: 'printpricepro-4acd1.firebaseapp.com',
    projectId: 'printpricepro-4acd1',
    storageBucket: 'printpricepro-4acd1.firebasestorage.app',
    messagingSenderId: '1086344918454',
    appId: '1:1086344918454:web:aa46bba45f724e1fcffd17',
    measurementId: 'G-XNHG8XXFS4'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

window.trackEvent = (name, params = {}) => logEvent(analytics, name, params);
