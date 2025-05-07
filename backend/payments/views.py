from django.shortcuts import render

# Create your views here.
import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from events.models import Booking
from .models import Payment
from .serializers import PaymentSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY


@api_view(["POST"])
def create_checkout_session(request, booking_id):
    try:
        booking = get_object_or_404(Booking, id=booking_id)
        # # Get email from booking user or booking email field
        # customer_email = booking.user.email if booking.user else booking.email

        # # Check if customer already exists in Stripe
        # existing_customers = stripe.Customer.list(email=customer_email, limit=1)

        # if existing_customers.data:
        #     # Use existing customer
        #     customer = existing_customers.data[0]
        # else:
        #     # Create new customer
        #     customer = stripe.Customer.create(
        #         email=customer_email,
        #     )

        # Create Stripe checkout session
        session = stripe.checkout.Session.create(
            # customer=customer.id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Booking for {booking.event_date.event.title}",
                        },
                        "unit_amount": int(
                            booking.total_price * 100
                        ),  # Convert to cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=settings.FRONTEND_URL + "/booking/success/",
            cancel_url=settings.FRONTEND_URL + "/booking/cancel/",
            metadata={"booking_id": str(booking.id)},
        )

        # Create payment record
        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            currency="USD",
            stripe_session_id=session.id,
            status="pending",
        )

        return Response({"session_id": session.id, "payment_id": payment.id})

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META["HTTP_STRIPE_SIGNATURE"]
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return Response(status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response(status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        try:
            payment = Payment.objects.get(stripe_session_id=session.id)
            payment.status = "completed"
            payment.save()

            # Update booking status
            booking = payment.booking
            booking.status = "confirmed"
            booking.is_paid = True
            booking.save()
        except Payment.DoesNotExist:
            return Response(status=404)

    return Response(status=200)


@api_view(["GET"])
def get_booking_by_session(request, session_id):
    try:
        payment = Payment.objects.get(stripe_session_id=session_id)
        booking = payment.booking

        # Serialize the booking with related data
        from events.serializers import BookingSerializer

        serializer = BookingSerializer(booking)

        return Response({"booking": serializer.data})
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)

# payments/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import PaypalPayment,StripPayment
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class PaymentCallbackView(APIView):
    def post(self, request):
        try:
            data = request.data
            payment = PaypalPayment.objects.create(
                transaction_id=data['transaction_id'],
                payer_email=data['payer_email'],
                payer_name=data['payer_name'],
                amount=data['amount'],
                currency=data.get('currency', 'USD'),
                status=data['status']
            )
            return Response({
                'message': 'Payment recorded successfully',
                'payment_id': payment.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Set Stripe API key
stripe.api_key = "sk_test_51MbFiSHy6xVLM3X4JHptpubaBglmQwf2EbqJsDQ06M6p91XuLXrH1HXYN0dTnI8AB5Wgi1vTx9AsFkkVwH04jlAn00EXmI7xdA"
class StripeCheckoutView(APIView):
    def get(self, request):
        return Response({"message": "Stripe Checkout View"})
    def post(self, request):

        print("StripeCheckoutView POST request received")  # Log for debugging
        try:
            # Create a Stripe checkout session
            amount = request.data.get('amount', 1000)  # Use amount from request, default to 1000 cents ($10) if not provided
            if not amount or amount <= 0:
                raise ValueError("Invalid amount provided")
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': amount,  # $10.00 in cents
                        'product_data': {
                            'name': 'One-Time Payment',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url='http://localhost:5173/?success=true&session_id={CHECKOUT_SESSION_ID}',
                cancel_url='http://localhost:5173/?canceled=true',
            )
            return Response({'sessionId': session.id}, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"StripeCheckoutView Error: {str(e)}")  # Log error for debugging
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class StripeCallbackView(APIView):
    def get(self, request):
        return Response({"message": "Stripe Callback View"})
    def post(self, request):
        print("StripeCallbackView POST request received")
        try:
            data = request.data
            payment = Payment.objects.create(
                transaction_id=data['transaction_id'],
                payer_email=data['payer_email'],
                payer_name=data['payer_name'],
                amount=data['amount'],
                currency=data.get('currency', 'USD'),
                status=data['status']
            )
            return Response({
                'message': 'Payment recorded successfully',
                'payment_id': payment.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"StripeCallbackView Error: {str(e)}")  # Log error for debugging
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)