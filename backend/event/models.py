from django.db import models
from django.core.validators import MinValueValidator
from django.db.models import CheckConstraint, Q, F
import uuid


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
        ordering = [
            "package",
            "order",
        ]  # Order features by package and then by the order field
        indexes = [
            models.Index(fields=["package", "order"]),
        ]

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
    remaining_inventory = models.PositiveIntegerField()

    class Meta:
        db_table = "ticket_inventory"
        verbose_name = "Ticket Inventory"
        verbose_name_plural = "Ticket Inventories"
        constraints = [
            CheckConstraint(
                check=Q(remaining_inventory__lte=F("total_inventory")),
                name="ticket_inventory_remaining_lte_total",
            ),
            CheckConstraint(
                check=Q(remaining_inventory__gte=0),
                name="ticket_inventory_remaining_gte_zero",
            ),
        ]
        indexes = [
            models.Index(fields=["ticket_type", "event_day"]),
        ]

    def __str__(self):
        return f"{self.ticket_type.ticket_name} - {self.event_day.day_name if self.event_day else 'Multi-Day'}"


# After Party Model
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
    remaining_capacity = models.PositiveIntegerField()

    class Meta:
        db_table = "after_parties"
        verbose_name = "After Party"
        verbose_name_plural = "After Parties"
        unique_together = [["after_party_type", "event_date", "location"]]
        constraints = [
            CheckConstraint(
                check=Q(remaining_capacity__lte=models.F("total_capacity")),
                name="after_party_remaining_capacity_lte_total",
            ),
            CheckConstraint(
                check=Q(remaining_capacity__gte=0),
                name="after_party_remaining_capacity_gte_zero",
            ),
        ]
        indexes = [
            models.Index(fields=["event_date", "after_party_type"]),
        ]

    def __str__(self):
        return f"{self.after_party_type} - {self.location} - {self.event_date}"


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


# RoomType model
class RoomType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_type_name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    capacity = models.PositiveIntegerField(default=2)

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
    remaining_rooms = models.PositiveIntegerField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "room_inventory"
        verbose_name = "Room Inventory"
        verbose_name_plural = "Room Inventories"
        unique_together = [["room_type", "stay_date"]]
        constraints = [
            CheckConstraint(
                check=Q(remaining_rooms__lte=F("total_rooms")),
                name="room_inventory_remaining_lte_total",
            ),
            CheckConstraint(
                check=Q(remaining_rooms__gte=0),
                name="room_inventory_remaining_gte_zero",
            ),
        ]
        indexes = [
            models.Index(fields=["stay_date"]),
        ]

    def __str__(self):
        return f"{self.room_type.room_type_name} - {self.stay_date}"


# AddOn model
class AddOn(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    add_on_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price_per_person = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    total_inventory = models.PositiveIntegerField(null=True, blank=True)
    remaining_inventory = models.PositiveIntegerField(null=True, blank=True)
    is_per_person = models.BooleanField(default=True)

    class Meta:
        db_table = "add_ons"
        verbose_name = "Add-On"
        verbose_name_plural = "Add-Ons"
        constraints = [
            CheckConstraint(
                check=Q(total_inventory__isnull=True)
                | Q(remaining_inventory__lte=F("total_inventory")),
                name="add_on_remaining_inventory_lte_total",
            ),
            CheckConstraint(
                check=Q(remaining_inventory__isnull=True)
                | Q(remaining_inventory__gte=0),
                name="add_on_remaining_inventory_gte_zero",
            ),
        ]

    def __str__(self):
        return self.add_on_name


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
        indexes = [
            models.Index(fields=["booking"]),
        ]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.ticket_type.ticket_name}"

    def save(self, *args, **kwargs):
        # Update ticket inventory
        self.ticket_type.remaining_inventory -= self.quantity
        self.ticket_type.save()
        if self.event_day:
            inventory = TicketInventory.objects.get(
                ticket_type=self.ticket_type, event_day=self.event_day
            )
            inventory.remaining_inventory -= self.quantity
            inventory.save()
        super().save(*args, **kwargs)


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
        indexes = [
            models.Index(fields=["booking"]),
        ]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.room_type.room_type_name} - {self.stay_date}"

    def save(self, *args, **kwargs):
        # Update room inventory
        inventory = RoomInventory.objects.get(
            room_type=self.room_type, stay_date=self.stay_date
        )
        inventory.remaining_rooms -= self.quantity
        inventory.save()
        super().save(*args, **kwargs)


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
        indexes = [
            models.Index(fields=["booking"]),
        ]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.add_on.add_on_name}"

    def save(self, *args, **kwargs):
        # Update add-on inventory if applicable
        if self.add_on.total_inventory is not None:
            self.add_on.remaining_inventory -= self.quantity
            self.add_on.save()
        super().save(*args, **kwargs)


# NEW: BookingAfterParty model
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
        indexes = [
            models.Index(fields=["booking"]),
        ]

    def __str__(self):
        return f"Booking {self.booking.id} - {self.after_party.after_party_type} - {self.after_party.event_date}"

    def save(self, *args, **kwargs):
        self.after_party.remaining_capacity -= self.quantity
        self.after_party.save()
        super().save(*args, **kwargs)
