from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PackageViewSet,
    TicketTypeViewSet,
    EventDayViewSet,
    TicketInventoryViewSet,
    HotelViewSet,
    RoomTypeViewSet,
    RoomInventoryViewSet,
    AddOnViewSet,
    BookingViewSet,
    AfterPartyViewSet,
)

router = DefaultRouter()
router.register(r"packages", PackageViewSet, basename="package")
router.register(r"ticket-types", TicketTypeViewSet, basename="ticket-type")
router.register(r"event-days", EventDayViewSet, basename="event-day")
router.register(
    r"ticket-inventory", TicketInventoryViewSet, basename="ticket-inventory"
)
router.register(r"hotels", HotelViewSet, basename="hotel")
router.register(r"room-types", RoomTypeViewSet, basename="room-type")
router.register(r"room-inventory", RoomInventoryViewSet, basename="room-inventory")
router.register(r"add-ons", AddOnViewSet, basename="add-on")
router.register(r"bookings", BookingViewSet, basename="booking")
router.register(r"after-parties", AfterPartyViewSet, basename="after-party")

urlpatterns = [
    path("", include(router.urls)),
]
