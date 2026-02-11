import { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck, AlertCircle, Crown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StripeCheckoutForm({ amount, currency, paymentId, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}/profile?payment=success&paymentId=${paymentId}`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
            toast.error(error.message);
        } else {
            setMessage("An unexpected error occurred.");
            toast.error("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs",
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-3">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3 px-1">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#06b5cc]/10 flex items-center justify-center border border-[#06b5cc]/20 shrink-0">
                            <ShieldCheck className="w-5 h-5 text-[#06b5cc]" />
                        </div>
                        <h3 className="text-white font-black text-[13px] sm:text-xs uppercase tracking-[0.1em]">Secure Checkout</h3>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#06b5cc]/20 border border-[#06b5cc]/40 shadow-[0_0_20px_rgba(6,181,204,0.3)] animate-pulse-subtle">
                        <Crown className="w-4 h-4 text-[#06b5cc]" />
                        <span className="text-[11px] text-[#06b5cc] font-black uppercase tracking-widest">Premium Access</span>
                    </div>
                </div>

                <div className="bg-black/20 rounded-lg p-1.5 min-h-[220px]">
                    <PaymentElement id="payment-element" options={paymentElementOptions} />
                </div>
            </div>

            {/* Price Summary */}
            <div className="px-1 py-1">
                <div className="flex items-center justify-between p-3 sm:p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-[12px] sm:text-[11px] text-[#94A3B8] font-bold uppercase py-2 tracking-wider">Total Amount</span>
                    <div className="text-right">
                        <span className="text-[11px] sm:text-[10px] text-[#06b5cc] font-black mr-1">{currency?.toUpperCase()}</span>
                        <span className="text-[12px] sm:text-[10px] font-black text-white leading-none">{amount}</span>
                    </div>
                </div>
            </div>

            {message && (
                <div className="flex items-center gap-2.5 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold animate-shake">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <p>{message}</p>
                </div>
            )}

            {/* Action Buttons - Separated to Corners */}
            {/* Action Buttons - Stacked on Mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center pt-6 sm:pt-8 gap-3 sm:gap-4 px-1">
                <button
                    disabled={isLoading || !stripe || !elements}
                    id="submit"
                    className="w-full sm:flex-1 py-3.5 sm:py-4 btn-orange rounded-xl sm:rounded-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-2xl shadow-orange-500/30 text-[15px] sm:text-[12px] uppercase tracking-[0.05em] sm:tracking-[0.15em] relative overflow-hidden group order-1 sm:order-2"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                                <span className="text-white">Processing...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-white">Confirm & Pay {currency?.toUpperCase()} {amount}</span>
                                <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
                  </div>
                  <div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="w-full flex sm:w-auto px-6 py-3 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl sm:rounded-full text-[#94A3B8] transition-all font-bold text-[14px] sm:text-[11px] hover:text-red-500 hover:border-red-500/30 flex items-center justify-center gap-2 order-2 sm:order-1"
                >
                    <span>Cancel Payment</span>
                </button>
            </div>

            <div className="text-center pt-1.5">
                <p className="text-[9px] text-[#94A3B8] font-bold tracking-tight opacity-30 uppercase">
                    PCI DSS Compliant Checkout
                </p>
            </div>
        </form>
    );
}
