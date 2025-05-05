# sunset_fest/admin.py
from django.contrib import admin
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
    BookingTicket,
    BookingRoom,
    BookingAddOn,
    PackageFeature,
)


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ("package_name", "is_active", "description")
    search_fields = ("package_name", "description")
    list_filter = ("is_active",)
    ordering = ("package_name",)


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = (
        "ticket_name",
        "package_name",
        "price",
        "total_inventory",
        "remaining_inventory",
    )
    search_fields = ("ticket_name", "description")
    list_filter = ("package",)
    list_select_related = ("package",)
    ordering = ("package__package_name", "ticket_name")

    def package_name(self, obj):
        return obj.package.package_name

    package_name.short_description = "Package"


@admin.register(EventDay)
class EventDayAdmin(admin.ModelAdmin):
    list_display = ("day_name", "event_date")
    search_fields = ("day_name", "event_date")
    ordering = ("event_date",)
    date_hierarchy = "event_date"


@admin.register(TicketInventory)
class TicketInventoryAdmin(admin.ModelAdmin):
    list_display = (
        "ticket_type_name",
        "event_day_name",
        "total_inventory",
        "remaining_inventory",
    )
    search_fields = ("ticket_type__ticket_name",)
    list_filter = ("ticket_type", "event_day")
    list_select_related = ("ticket_type", "event_day")
    ordering = ("ticket_type__ticket_name", "event_day__event_date")

    def ticket_type_name(self, obj):
        return obj.ticket_type.ticket_name

    ticket_type_name.short_description = "Ticket Type"

    def event_day_name(self, obj):
        return obj.event_day.day_name if obj.event_day else "Multi-Day"

    event_day_name.short_description = "Event Day"


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ("hotel_name", "address")
    search_fields = ("hotel_name", "address", "description")
    ordering = ("hotel_name",)


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("room_type_name", "capacity", "description")
    search_fields = ("room_type_name", "description")
    ordering = ("room_type_name",)


@admin.register(RoomInventory)
class RoomInventoryAdmin(admin.ModelAdmin):
    list_display = (
        "room_type_name",
        "stay_date",
        "total_rooms",
        "remaining_rooms",
        "price_per_night",
    )
    search_fields = ("room_type__room_type_name",)
    list_filter = ("room_type", "stay_date")
    list_select_related = ("room_type",)
    ordering = ("room_type__room_type_name", "stay_date")
    date_hierarchy = "stay_date"

    def room_type_name(self, obj):
        return obj.room_type.room_type_name

    room_type_name.short_description = "Room Type"


@admin.register(AddOn)
class AddOnAdmin(admin.ModelAdmin):
    list_display = (
        "add_on_name",
        "price_per_person",
        "total_inventory",
        "remaining_inventory",
        "is_per_person",
    )
    search_fields = ("add_on_name", "description")
    list_filter = ("is_per_person",)
    readonly_fields = ("remaining_inventory",)
    ordering = ("add_on_name",)


# Inline classes for Booking-related models
class BookingTicketInline(admin.TabularInline):
    model = BookingTicket
    extra = 1
    readonly_fields = ("quantity",)
    fields = ("ticket_type", "event_day", "quantity")
    autocomplete_fields = ("ticket_type", "event_day")


class BookingRoomInline(admin.TabularInline):
    model = BookingRoom
    extra = 1
    readonly_fields = ("quantity",)
    fields = ("room_type", "stay_date", "quantity")
    autocomplete_fields = ("room_type",)


class BookingAddOnInline(admin.TabularInline):
    model = BookingAddOn
    extra = 1
    readonly_fields = ("quantity",)
    fields = ("add_on", "quantity")
    autocomplete_fields = ("add_on",)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "customer_email",
        "package_name",
        "ticket_type_name",
        "party_size",
        "total_amount",
        "payment_status",
        "booking_date",
    )
    search_fields = ("customer_name", "customer_email", "id")
    list_filter = ("package", "ticket_type", "payment_status", "booking_date")
    readonly_fields = ("total_amount", "booking_date")
    list_select_related = ("package", "ticket_type")
    ordering = ("-booking_date",)
    date_hierarchy = "booking_date"
    inlines = [BookingTicketInline, BookingRoomInline, BookingAddOnInline]

    def package_name(self, obj):
        return obj.package.package_name

    package_name.short_description = "Package"

    def ticket_type_name(self, obj):
        return obj.ticket_type.ticket_name

    ticket_type_name.short_description = "Ticket Type"


# Register BookingTicket, BookingRoom, BookingAddOn for standalone management if needed
@admin.register(BookingTicket)
class BookingTicketAdmin(admin.ModelAdmin):
    list_display = ("booking_id", "ticket_type_name", "event_day_name", "quantity")
    search_fields = ("booking__id", "ticket_type__ticket_name")
    list_filter = ("ticket_type", "event_day")
    readonly_fields = ("quantity",)
    list_select_related = ("booking", "ticket_type", "event_day")
    ordering = ("booking__id",)

    def booking_id(self, obj):
        return obj.booking.id

    booking_id.short_description = "Booking ID"

    def ticket_type_name(self, obj):
        return obj.ticket_type.ticket_name

    ticket_type_name.short_description = "Ticket Type"

    def event_day_name(self, obj):
        return obj.event_day.day_name if obj.event_day else "Multi-Day"

    event_day_name.short_description = "Event Day"


@admin.register(BookingRoom)
class BookingRoomAdmin(admin.ModelAdmin):
    list_display = (
        "booking_id",
        "room_type_name",
        "stay_date",
        "quantity",
    )
    search_fields = ("booking__id", "room_type__room_type_name")
    list_filter = ("room_type", "stay_date")
    readonly_fields = ("quantity",)
    list_select_related = ("booking", "room_type")
    ordering = ("booking__id", "stay_date")
    date_hierarchy = "stay_date"

    def booking_id(self, obj):
        return obj.booking.id

    booking_id.short_description = "Booking ID"

    def room_type_name(self, obj):
        return obj.room_type.room_type_name

    room_type_name.short_description = "Room Type"


@admin.register(BookingAddOn)
class BookingAddOnAdmin(admin.ModelAdmin):
    list_display = ("booking_id", "add_on_name", "quantity")
    search_fields = ("booking__id", "add_on__add_on_name")
    list_filter = ("add_on",)
    readonly_fields = ("quantity",)
    list_select_related = ("booking", "add_on")
    ordering = ("booking__id",)

    def booking_id(self, obj):
        return obj.booking.id

    booking_id.short_description = "Booking ID"

    def add_on_name(self, obj):
        return obj.add_on.add_on_name

    add_on_name.short_description = "Add-On"


@admin.register(PackageFeature)
class PackageFeatureAdmin(admin.ModelAdmin):
    list_display = ("package__package_name", "feature_text")
    search_fields = ("package__package_name", "feature_text")
    list_filter = ("package",)
