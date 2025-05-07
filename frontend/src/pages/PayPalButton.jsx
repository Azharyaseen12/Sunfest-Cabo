import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';

const PayPalButton = ({ totalPrice }) => {
    const [error, setError] = useState(null);

    const handlePaymentSuccess = async (details) => {
        try {
            const response = await axios.post('http://localhost:8000/api/payments/api/payment/callback/', {
                transaction_id: details.id,
                payer_email: details.payer.email_address,
                payer_name: details.payer.name.given_name + ' ' + details.payer.name.surname,
                amount: details.purchase_units[0].amount.value,
                currency: details.purchase_units[0].amount.currency_code,
                status: details.status
            });
            console.log('Payment recorded:', response.data);
            alert('Payment successful! Transaction ID: ' + details.id);
        } catch (err) {
            setError('Failed to record payment');
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '300px', margin: '20px auto' }}>
            <PayPalScriptProvider options={{
                'client-id': 'AY12GGCaAQ3_IKcumxS8ulPgFicM8RD6Uoko3NKldOMCIlB0GgC1MhDaB1xGBJmcmiXvG6U6Hi6_b2yV', // Your PayPal Client ID tied to the business account
                currency: 'USD'
            }}>
                <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: totalPrice.toFixed(2), // PayPal expects dollars
                                currency_code: 'USD'
                              },
                              payee: {
                                email_address: 'swen19111105@kfueit.edu.pk'
                              }
                            }
                          ]
                        });
                      }}
                    onApprove={async (data, actions) => {
                        const details = await actions.order.capture();
                        await handlePaymentSuccess(details);
                    }}
                    onError={(err) => {
                        setError('Payment failed. Please try again.');
                        console.error('PayPal Error:', err);
                    }}
                />
            </PayPalScriptProvider>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PayPalButton;