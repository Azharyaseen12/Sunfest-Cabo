from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import Sum
from django.utils import timezone
import uuid
from django.contrib.auth import get_user_model

USER = get_user_model()


# Package model
class Package(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    starting_price = models.DecimalField(max_digits=10, decimal_places=2, default=4000)
    is_hotel_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "packages"
        verbose_name = "Package"
        verbose_name_plural = "Packages"

    def __str__(self):
        return self.package_name


# PackageFeature model
class PackageFeature(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(
        Package, on_delete=models.CASCADE, related_name="features"
    )
    feature_text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(
        default=0, help_text="Order in which features are displayed"
    )

    class Meta:
        db_table = "package_features"
        verbose_name = "Package Feature"
        verbose_name_plural = "Package Features"
        ordering = ["package", "order"]
        indexes = [models.Index(fields=["package", "order"])]

    def __str__(self):
        return f"{self.package.package_name} - Feature: {self.feature_text[:50]}"


# TicketType model
class TicketType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(
        Package, on_delete=models.CASCADE, related_name="ticket_types"
    )
    ticket_name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    is_standard_hotel_included = models.BooleanField(default=False)
    is_transportation_included = models.BooleanField(default=False)
    is_vip_after_party_included = models.BooleanField(default=False)

    class Meta:
        db_table = "ticket_types"
        verbose_name = "Ticket Type"
        verbose_name_plural = "Ticket Types"

    def __str__(self):
        return f"{self.ticket_name} ({self.package.package_name})"


# EventDay model
class EventDay(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_date = models.DateField(unique=True)
    day_name = models.CharField(max_length=20)

    class Meta:
        db_table = "event_days"
        verbose_name = "Event Day"
        verbose_name_plural = "Event Days"

    def __str__(self):
        return f"{self.day_name} ({self.event_date})"


# TicketInventory model
class TicketInventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.CASCADE, related_name="inventories"
    )
    event_day = models.ForeignKey(
        EventDay,
        on_delete=models.CASCADE,
        related_name="ticket_inventories",
        null=True,
        blank=True,
    )
    total_inventory = models.PositiveIntegerField()
    # CHANGE: Removed remaining_inventory field
    # CHANGE: Removed constraints for remaining_inventory

    class Meta:
        db_table = "ticket_inventory"
        verbose_name = "Ticket Inventory"
        verbose_name_plural = "Ticket Inventories"
        indexes = [models.Index(fields=["ticket_type", "event_day"])]

    def __str__(self):
        return f"{self.ticket_type.ticket_name} - {self.event_day.day_name if self.event_day else 'Multi-Day'}"

    # CHANGE: Added property to compute remaining_inventory at runtime
    @property
    def remaining_inventory(self):
        # Sum booked tickets
        booked = (
            BookingTicket.objects.filter(
                ticket_type=self.ticket_type, event_day=self.event_day
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        # Sum active cart items
        carted = (
            CartItem.objects.filter(
                item_type="ticket", item_id=self.id, cart__expires_at__gt=timezone.now()
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        return self.total_inventory - booked - carted


# AfterParty model
class AfterParty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    after_party_type = models.CharField(
        max_length=10,
        choices=[("GA", "General Admission"), ("VIP", "VIP")],
        default="GA",
    )
    event_date = models.DateField()
    location = models.CharField(max_length=100)
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    total_capacity = models.PositiveIntegerField()
    # CHANGE: Removed remaining_capacity field
    # CHANGE: Removed constraints for remaining_capacity

    class Meta:
        db_table = "after_parties"
        verbose_name = "After Party"
        verbose_name_plural = "After Parties"
        unique_together = [["after_party_type", "event_date", "location"]]
        indexes = [models.Index(fields=["event_date", "after_party_type"])]

    def __str__(self):
        return f"{self.after_party_type} - {self.location} - {self.event_date}"

    # CHANGE: Added property to compute remaining_capacity at runtime
    @property
    def remaining_capacity(self):
        # Sum booked afterparties
        booked = (
            BookingAfterParty.objects.filter(after_party=self).aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )
        # Sum active cart items
        carted = (
            CartItem.objects.filter(
                item_type="afterparty",
                item_id=self.id,
                cart__expires_at__gt=timezone.now(),
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        return self.total_capacity - booked - carted


# Hotel model
class Hotel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hotel_name = models.CharField(max_length=100)
    address = models.CharField(max_length=255, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=5)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "hotels"
        verbose_name = "Hotel"
        verbose_name_plural = "Hotels"

    def __str__(self):
        return self.hotel_name


# Hotel Images
class HotelImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="hotels/")

    class Meta:
        db_table = "hotel_images"
        verbose_name = "Hotel Image"
        verbose_name_plural = "Hotel Images"

    def __str__(self):
        return f"{self.hotel.hotel_name} - {self.image.name}"


# RoomType model
class RoomType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_type_name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    capacity = models.PositiveIntegerField(default=2)
    image = models.ImageField(upload_to="room_types/", null=True, blank=True)

    class Meta:
        db_table = "room_types"
        verbose_name = "Room Type"
        verbose_name_plural = "Room Types"

    def __str__(self):
        return self.room_type_name


# RoomInventory model
class RoomInventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_type = models.ForeignKey(
        RoomType, on_delete=models.CASCADE, related_name="room_inventories"
    )
    stay_date = models.DateField()
    total_rooms = models.PositiveIntegerField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    resort_fee_percentage = models.IntegerField(default=4)
    vat_percentage = models.DecimalField(max_digits=10, decimal_places=2, default=0.16)
    logging_price_percentage = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.04
    )

    # CHANGE: Removed remaining_rooms field
    # CHANGE: Removed constraints for remaining_rooms

    class Meta:
        db_table = "room_inventory"
        verbose_name = "Room Inventory"
        verbose_name_plural = "Room Inventories"
        unique_together = [["room_type", "stay_date"]]
        indexes = [models.Index(fields=["stay_date"])]

    def __str__(self):
        return f"{self.room_type.room_type_name} - {self.stay_date}"

    # CHANGE: Added property to compute remaining_rooms at runtime
    @property
    def remaining_rooms(self):
        # Sum booked rooms
        booked = (
            BookingRoom.objects.filter(
                room_type=self.room_type, stay_date=self.stay_date
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        # Sum active cart items
        carted = (
            CartItem.objects.filter(
                item_type="room", item_id=self.id, cart__expires_at__gt=timezone.now()
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        return self.total_rooms - booked - carted


# AddOn model
class AddOn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    add_on_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price_per_person = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    total_inventory = models.PositiveIntegerField(null=True, blank=True)
    is_per_person = models.BooleanField(default=True)
    image = models.ImageField(upload_to="add_ons/", null=True, blank=True)
    # CHANGE: Removed remaining_inventory field
    # CHANGE: Removed constraints for remaining_inventory

    class Meta:
        db_table = "add_ons"
        verbose_name = "Add-On"
        verbose_name_plural = "Add-Ons"

    def __str__(self):
        return self.add_on_name

    # CHANGE: Added property to compute remaining_inventory at runtime
    @property
    def remaining_inventory(self):
        if self.total_inventory is None:
            return None
        # Sum booked add-ons
        booked = (
            BookingAddOn.objects.filter(add_on=self).aggregate(total=Sum("quantity"))[
                "total"
            ]
            or 0
        )
        # Sum active cart items
        carted = (
            CartItem.objects.filter(
                item_type="addon", item_id=self.id, cart__expires_at__gt=timezone.now()
            ).aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        return self.total_inventory - booked - carted


# Booking model
class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    package = models.ForeignKey(
        Package, on_delete=models.CASCADE, related_name="bookings"
    )
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.CASCADE, related_name="bookings"
    )
    after_party = models.ForeignKey(
        AfterParty,
        on_delete=models.CASCADE,
        related_name="bookings",
        null=True,
        blank=True,
    )
    party_size = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    booking_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ("Pending", "Pending"),
            ("Completed", "Completed"),
            ("Failed", "Failed"),
        ],
        default="Pending",
    )
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=100)

    class Meta:
        db_table = "bookings"
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        indexes = [
            models.Index(fields=["package"]),
            models.Index(fields=["ticket_type"]),
        ]

    def __str__(self):
        return f"Booking {self.id} - {self.customer_name}"


# BookingTicket model
class BookingTicket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_tickets"
    )
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.CASCADE, related_name="booking_tickets"
    )
    event_day = models.ForeignKey(
        EventDay,
        on_delete=models.CASCADE,
        related_name="booking_tickets",
        null=True,
        blank=True,
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = "booking_tickets"
        verbose_name = "Booking Ticket"
        verbose_name_plural = "Booking Tickets"
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.ticket_type.ticket_name}"

    # CHANGE: Removed save method that updated ticket inventory


# BookingRoom model
class BookingRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_rooms"
    )
    room_type = models.ForeignKey(
        RoomType, on_delete=models.CASCADE, related_name="booking_rooms"
    )
    stay_date = models.DateField()
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)], default=1)

    class Meta:
        db_table = "booking_rooms"
        verbose_name = "Booking Room"
        verbose_name_plural = "Booking Rooms"
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.room_type.room_type_name} - {self.stay_date}"

    # CHANGE: Removed save method that updated room inventory


# BookingAddOn model
class BookingAddOn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_add_ons"
    )
    add_on = models.ForeignKey(
        AddOn, on_delete=models.CASCADE, related_name="booking_add_ons"
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = "booking_add_ons"
        verbose_name = "Booking Add-On"
        verbose_name_plural = "Booking Add-Ons"
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.add_on.add_on_name}"

    # CHANGE: Removed save method that updated add-on inventory


# BookingAfterParty model
class BookingAfterParty(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_after_parties"
    )
    after_party = models.ForeignKey(
        AfterParty, on_delete=models.CASCADE, related_name="booking_after_parties"
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = "booking_after_parties"
        verbose_name = "Booking After Party"
        verbose_name_plural = "Booking After Parties"
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.after_party.after_party_type} - {self.after_party.event_date}"

    # CHANGE: Removed save method that updated afterparty capacity


# Cart model
class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(USER, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=32, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "carts"
        verbose_name = "Cart"
        verbose_name_plural = "Carts"
        indexes = [models.Index(fields=["user", "session_key", "expires_at"])]

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=10)
        super().save(*args, **kwargs)


# CartItem model
class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    item_type = models.CharField(
        max_length=20,
        choices=[
            ("ticket", "Ticket"),
            ("room", "Room"),
            ("afterparty", "AfterParty"),
            ("addon", "AddOn"),
        ],
    )
    item_id = models.UUIDField()
    room_type = models.ForeignKey(
        RoomType, on_delete=models.CASCADE, null=True, blank=True
    )
    stay_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = "cart_items"
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"
        indexes = [models.Index(fields=["cart", "item_type", "item_id"])]

    def __str__(self):
        return f"Cart {self.cart.id} - {self.item_type} {self.item_id} x{self.quantity}"
