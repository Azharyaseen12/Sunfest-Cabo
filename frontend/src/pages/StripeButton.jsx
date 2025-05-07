import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51MbFiSHy6xVLM3X4CKkxYGHxydZq7Jr6bmHUjbcimVm5YCiVE1Tif5vk7BVaQt3DYvtdjvtifGMOvQ5lk3JD5YtV00JN945lB5');

const StripeButton = ({ totalPrice }) => {
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        try {
            console.log('Sending totalPrice to backend:', totalPrice); // Debug log
            // Request a checkout session from the backend with totalPrice
            const response = await axios.post('http://localhost:8000/api/payments/api/stripe/checkout/', {
                amount: Math.round(totalPrice * 100), // Convert to cents
            });
            const sessionId = response.data.sessionId;

            // Redirect to Stripe Checkout
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                setError('Failed to initiate checkout');
                console.error('Stripe Checkout Error:', error);
            }
        } catch (err) {
            setError('Failed to connect to server');
            console.error('Axios Error:', err);
        }
    };

    const handlePaymentSuccess = async (session) => {
        try {
            console.log('Sending payment data to backend:', {
                transaction_id: session.payment_intent,
                payer_email: session.customer_details.email || 'unknown@example.com',
                payer_name: session.customer_details.name || 'Unknown',
                amount: session.amount_total / 100,
                currency: session.currency.toUpperCase(),
                status: session.payment_status
            });
            const response = await axios.post('http://localhost:8000/api/payments/stripe/callback/', {
                transaction_id: session.payment_intent,
                payer_email: session.customer_details.email || 'unknown@example.com',
                payer_name: session.customer_details.name || 'Unknown',
                amount: session.amount_total / 100, // Convert cents to dollars
                currency: session.currency.toUpperCase(),
                status: session.payment_status
            });
            console.log('Payment recorded:', response.data);
            alert('Payment successful! Transaction ID: ' + session.payment_intent);
        } catch (err) {
            setError('Failed to record payment');
            console.error('Axios Error:', err);
        }
    };

    // Check for redirect back from Stripe
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');
        if (query.get('success') && sessionId) {
            const fetchSession = async () => {
                try {
                    const stripe = await stripePromise;
                    const session = await stripe.retrieveSession(sessionId);
                    if (session.payment_status === 'paid') {
                        await handlePaymentSuccess(session);
                    }
                } catch (err) {
                    setError('Failed to verify payment');
                    console.error('Stripe Error:', err);
                }
            };
            fetchSession();
        }
    }, []);

    return (
        <div style={{ maxWidth: '300px', margin: '20px auto' }}>
            <button
                onClick={handleCheckout}
                style={{
                    backgroundColor: '#6772E5',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Pay ${totalPrice ? totalPrice.toFixed(2) : '0.00'} with Stripe
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default StripeButton;