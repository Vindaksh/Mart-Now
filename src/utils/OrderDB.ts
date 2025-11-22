// src/utils/OrderDB.ts
import Supabase from "./Database";
import { AddressInterface, UserInterface, OnlinePaymentInterface, OrderInterface } from "./Interfaces";

/* ----------------------------------------------------------
   1. Initiate Stripe Checkout (Calls your Node.js Server)
-----------------------------------------------------------*/
export async function initiateStripeCheckout(amount: number, orderId: number) {
    try {
        const amountInPaise = Math.round(amount * 100); 

        const response = await fetch("http://localhost:5000/create-checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                amount: amountInPaise,
                orderId: orderId 
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Failed to connect to payment server");
        }

        const data = await response.json();
        return { url: data.url, error: null };

    } catch (error: any) {
        console.error("Stripe connection error:", error);
        return { url: null, error: error.message || "Network Error" };
    }
}

/* ----------------------------------------------------------
   2. Create Order (Returns { data, error })
-----------------------------------------------------------*/
export async function createOrder(buyer: UserInterface, payment: OnlinePaymentInterface, address: AddressInterface) {
    const { data, error } = await Supabase.rpc("checkout_json", {
        data: {
            uid: buyer.id,
            ...payment,
            ...address
        }
    })
    .select()
    .maybeSingle();

    if (error) {
        console.error("Error creating order:", error);
        return { data: null, error }; 
    }
    
    return { data, error: null };
}

/* ----------------------------------------------------------
   3. Complete Payment Object Helper
-----------------------------------------------------------*/
export const completePayment = async (total: number, method: 'cod' | 'online', ref: string | null = null): Promise<OnlinePaymentInterface> => {
    return {
        payment_ref: ref,
        payment_mode: method === 'cod' ? 'offline' : 'online'
    };
}

/* ----------------------------------------------------------
   4. Get Seller Orders
-----------------------------------------------------------*/
export async function getSellerOrders(sellerId: string) {
    const { data: myLi, error: liError } = await Supabase
        .from('product_listings')
        .select('product_listings_id')
        .eq('seller_id', sellerId);

    if (liError || !myLi || myLi.length === 0) return [];

    const myListingIds = myLi.map(l => l.product_listings_id);

    const { data, error } = await Supabase
        .from('order_items')
        .select(`*, order:orders!order_items_order_id_fkey (order_id, ordered_at, shipping_address:saved_addresses!orders_address_id_fkey (*), buyer:users!orders_buyer_id_fkey (name))`)
        .in('listing_id', myListingIds)
        .order('order_item_id', { ascending: false });

    if (error) return [];
    return data;
}

/* ----------------------------------------------------------
   5. Update Item Status
-----------------------------------------------------------*/
export async function updateOrderItemStatus(itemId: number, newStatus: string) {
    const { error } = await Supabase.from('order_items').update({ order_status: "pending"}).eq('order_item_id', itemId);
    return { error };
}

/* ----------------------------------------------------------
   6. Update Payment Reference (Stripe Session ID)
-----------------------------------------------------------*/
export async function updateOrderPaymentRef(orderId: number, paymentRef: string) {
    // 1. Find the payment_id associated with this order
    const { data: order, error: fetchError } = await Supabase
        .from('orders')
        .select('payment_id')
        .eq('order_id', orderId)
        .single();

    if (fetchError || !order) {
        console.error("Error finding order for payment update:", fetchError);
        return { error: fetchError };
    }

    // 2. Update the payments table
    const { error: updateError } = await Supabase
        .from('payments')
        .update({ ref: paymentRef })
        .eq('payment_id', order.payment_id);

    if (updateError) {
        console.error("Error updating payment ref:", updateError);
    }

    return { error: updateError };
}

/* ----------------------------------------------------------
   7. Get Customer Orders
-----------------------------------------------------------*/
export const getOrders = async (user: UserInterface, limit: number = 10) => {
    const { data, error } = await Supabase
        .from('orders')
        .select(`order_id, ordered_at, order_items (order_item_id, listing_id, name, price, quantity, order_status, rating, feedback)`)
        .eq("buyer_id", user.id)
        .order('ordered_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data as OrderInterface[] ?? [];
}