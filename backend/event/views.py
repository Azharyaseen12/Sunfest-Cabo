# event/views.py
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import (
    Package,
    TicketType,
    EventDay,
    TicketInventory,
    Hotel,
    RoomType,
    RoomInventory,
    AddOn,
    Booking,
    AfterParty,
    Cart,
)
from .serializers import (
    PackageSerializer,
    TicketTypeSerializer,
    EventDaySerializer,
    TicketInventorySerializer,
    HotelSerializer,
    RoomTypeSerializer,
    RoomInventorySerializer,
    AddOnSerializer,
    BookingSerializer,
    AfterPartySerializer,
    CartSerializer,
)


class PackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Package.objects.filter(is_active=True)
    serializer_class = PackageSerializer
    filter_backends = [SearchFilter]
    search_fields = ["package_name"]


class TicketTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TicketType.objects.all()
    serializer_class = TicketTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["package"]


class EventDayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EventDay.objects.all()
    serializer_class = EventDaySerializer


class TicketInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TicketInventory.objects.all()
    serializer_class = TicketInventorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["ticket_type", "event_day"]


class AfterPartyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AfterParty.objects.all()
    serializer_class = AfterPartySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["after_party_type", "event_date"]


class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer


class RoomTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer


class RoomInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomInventory.objects.all()
    serializer_class = RoomInventorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["room_type", "stay_date"]


class AddOnViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AddOn.objects.all()
    serializer_class = AddOnSerializer
    filter_backends = [SearchFilter]
    search_fields = ["add_on_name"]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    http_method_names = ["post", "get"]

    def get_queryset(self):
        user_email = (
            self.request.user.email if self.request.user.is_authenticated else None
        )
        if user_email:
            return Booking.objects.filter(customer_email=user_email)
        return Booking.objects.none()


class CartView(APIView):
    def get(self, request):
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key
        if not session_key:
            request.session.create()
            session_key = request.session.session_key

        with transaction.atomic():
            Cart.objects.filter(expires_at__lte=timezone.now()).delete()
            cart = (
                Cart.objects.filter(
                    user=user, session_key=session_key, expires_at__gt=timezone.now()
                )
                .prefetch_related("items")
                .first()
            )

        if not cart:
            return Response(
                {"detail": "No active cart found."}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def post(self, request):
        serializer = CartSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            with transaction.atomic():
                cart = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key
        if not session_key:
            return Response(
                {"detail": "No session found."}, status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            cart = (
                Cart.objects.filter(
                    user=user, session_key=session_key, expires_at__gt=timezone.now()
                )
                .prefetch_related("items")
                .first()
            )
            if not cart:
                return Response(
                    {"detail": "No active cart found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # CHANGE: Removed inventory restoration logic since remaining_* are computed at runtime
            cart.delete()
            return Response(
                {"detail": "Cart cleared."}, status=status.HTTP_204_NO_CONTENT
            )
