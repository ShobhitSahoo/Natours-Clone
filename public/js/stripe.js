import axios from 'axios';
import { showAlert } from './alerts'

// const stripe = Stripe(`${process.env.STRIPE_PUB_KEY}`);
const stripe = Stripe(`pk_test_51Iw5dWSElk0DPMVIVcnCFoTwpZqe72Mk9SLRopp7GAGtH7LYRza2diVAen5we8i4PRE45mx99Y2GkcmLgcDfGbTZ00Pq81ITjp`);

export const bookTour = async tourId => {
    
    try {
        // 1) Get checkout session from server
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        const sId = session.data.session.id;

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: sId
        })

    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};