import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentReturn: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Parse the query parameters from the URL
        const params = new URLSearchParams(location.search);
        const status = params.get('status'); // 'success' or 'cancel'
        const sessionId = params.get('session_id');
        const userId = params.get('userId');

        if (window.opener) {
            // Prepare the message payload
            const message = {
                type: "stripePaymentResult",
                sessionId: sessionId,
                status: status === 'success' ? 'succeeded' : 'failed',
                error: status === 'cancel' ? 'User cancelled payment.' : null,
                userId: userId
            };

            // Send the message to the window that opened this one
            window.opener.postMessage(message, window.location.origin);
            
            // ⭐️ CRITICAL: Close the window to unblock the opener's Promise
            window.close();
        }
    }, [location.search]);

    // Show a simple loading or closing message while the window closes
    return <h1>Processing Payment... Please wait as this window closes.</h1>;
};

export default PaymentReturn;