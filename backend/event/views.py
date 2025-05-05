# sunset_fest/api/views.py
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from event.models import (
    Package,
    TicketType,
    EventDay,
    TicketInventory,
    Hotel,
    RoomType,
    RoomInventory,
    AddOn,
    Booking,
)
from event.serializers import (
    PackageSerializer,
    TicketTypeSerializer,
    EventDaySerializer,
    TicketInventorySerializer,
    HotelSerializer,
    RoomTypeSerializer,
    RoomInventorySerializer,
    AddOnSerializer,
    BookingSerializer,
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


class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["is_premium"]


class RoomTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer


class RoomInventoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RoomInventory.objects.all()
    serializer_class = RoomInventorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["hotel", "room_type", "stay_date"]


class AddOnViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AddOn.objects.all()
    serializer_class = AddOnSerializer
    filter_backends = [SearchFilter]
    search_fields = ["add_on_name"]


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    http_method_names = [
        "post",
        "get",
    ]  # Only allow POST for creation and GET for retrieval

    def get_queryset(self):
        # Filter bookings by customer_email for authenticated users
        user_email = (
            self.request.user.email if self.request.user.is_authenticated else None
        )
        if user_email:
            return Booking.objects.filter(customer_email=user_email)
        return Booking.objects.none()
