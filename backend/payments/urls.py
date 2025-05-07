from django.urls import path ,include
from . import views
from .views import PaymentCallbackView,StripeCheckoutView, StripeCallbackView
app_name = "payments"

urlpatterns = [
    path('api/payment/callback/', PaymentCallbackView.as_view(), name='payment_callback'),
    path('paypal/', include("paypal.standard.ipn.urls")),
    path('api/stripe/checkout/', StripeCheckoutView.as_view(), name='stripe_checkout'),
    path('api/stripe/callback/', StripeCallbackView.as_view(), name='stripe_callback'),
    path(
        "checkout-session/<uuid:booking_id>/",
        views.create_checkout_session,
        name="create-checkout-session",
    ),
    path("webhook/", views.stripe_webhook, name="stripe-webhook"),
    path(
        "session/<str:session_id>/",
        views.get_booking_by_session,
        name="get-booking-by-session",
    ),
]
