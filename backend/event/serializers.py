from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from .models import (
    Package,
    TicketType,
    EventDay,
    TicketInventory,
    AfterParty,
    Hotel,
    RoomType,
    RoomInventory,
    AddOn,
    Booking,
    BookingTicket,
    BookingRoom,
    BookingAddOn,
    PackageFeature,
    BookingAfterParty,
    Cart,
    CartItem,
)


class PackageFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackageFeature
        fields = ["id", "feature_text", "order"]


class PackageSerializer(serializers.ModelSerializer):
    features = PackageFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = Package
        fields = [
            "id",
            "package_name",
            "description",
            "is_active",
            "features",
            "starting_price",
            "is_hotel_required",
        ]


class TicketTypeSerializer(serializers.ModelSerializer):
    package = serializers.StringRelatedField()

    class Meta:
        model = TicketType
        fields = ["id", "package", "ticket_name", "price", "description"]


class EventDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDay
        fields = ["id", "event_date", "day_name"]


class TicketInventorySerializer(serializers.ModelSerializer):
    ticket_type = TicketTypeSerializer(read_only=True)
    event_day = EventDaySerializer(read_only=True)
    ticket_type_day = serializers.SerializerMethodField()

    def get_ticket_type_day(self, obj):
        return "ONE_DAY" if obj.event_day else "MULTI_DAY"

    class Meta:
        model = TicketInventory
        fields = [
            "id",
            "ticket_type",
            "event_day",
            "total_inventory",
            "remaining_inventory",
            "ticket_type_day",
        ]


class AfterPartySerializer(serializers.ModelSerializer):
    class Meta:
        model = AfterParty
        fields = [
            "id",
            "after_party_type",
            "event_date",
            "location",
            "price_per_person",
            "total_capacity",
            "remaining_capacity",
        ]


class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ["id", "hotel_name", "address", "rating", "description"]


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ["id", "room_type_name", "description", "capacity"]


class RoomInventorySerializer(serializers.ModelSerializer):
    room_type = RoomTypeSerializer(read_only=True)

    class Meta:
        model = RoomInventory
        fields = [
            "id",
            "room_type",
            "stay_date",
            "total_rooms",
            "remaining_rooms",
            "price_per_night",
        ]


class AddOnSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddOn
        fields = [
            "id",
            "add_on_name",
            "description",
            "price_per_person",
            "total_inventory",
            "remaining_inventory",
            "is_per_person",
        ]


class BookingTicketSerializer(serializers.ModelSerializer):
    ticket_type = serializers.PrimaryKeyRelatedField(queryset=TicketType.objects.all())
    event_day = serializers.PrimaryKeyRelatedField(
        queryset=EventDay.objects.all(), allow_null=True
    )

    class Meta:
        model = BookingTicket
        fields = ["ticket_type", "event_day", "quantity"]


class BookingRoomSerializer(serializers.ModelSerializer):
    room_type = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all())

    class Meta:
        model = BookingRoom
        fields = ["room_type", "stay_date", "quantity"]


class BookingAddOnSerializer(serializers.ModelSerializer):
    add_on = serializers.PrimaryKeyRelatedField(queryset=AddOn.objects.all())

    class Meta:
        model = BookingAddOn
        fields = ["add_on", "quantity"]


class BookingAfterPartySerializer(serializers.ModelSerializer):
    after_party = serializers.PrimaryKeyRelatedField(queryset=AfterParty.objects.all())

    class Meta:
        model = BookingAfterParty
        fields = ["after_party", "quantity"]


class CartItemSerializer(serializers.ModelSerializer):
    item_type = serializers.ChoiceField(
        choices=["ticket", "room", "afterparty", "addon"]
    )
    item_id = serializers.UUIDField(required=False)
    room_type = serializers.PrimaryKeyRelatedField(
        queryset=RoomType.objects.all(), required=False
    )
    stay_date = serializers.DateField(required=False)
    quantity = serializers.IntegerField(min_value=1)

    class Meta:
        model = CartItem
        fields = ["item_type", "item_id", "room_type", "stay_date", "quantity"]

    def validate(self, data):
        item_type = data["item_type"]
        quantity = data["quantity"]

        if item_type == "room":
            if not (data.get("room_type") and data.get("stay_date")):
                raise serializers.ValidationError(
                    "room_type and stay_date are required for item_type 'room'."
                )
            try:
                inventory = RoomInventory.objects.get(
                    room_type=data["room_type"], stay_date=data["stay_date"]
                )
                data["item_id"] = inventory.id
                # CHANGE: Use computed remaining_rooms property
                if inventory.remaining_rooms < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient rooms for {data['room_type'].room_type_name} on {data['stay_date']}: {inventory.remaining_rooms} available."
                    )
            except RoomInventory.DoesNotExist:
                raise serializers.ValidationError(
                    f"No room inventory found for {data['room_type'].room_type_name} on {data['stay_date']}."
                )
        else:
            if not data.get("item_id"):
                raise serializers.ValidationError(
                    "item_id is required for non-room items."
                )
            if data.get("room_type") or data.get("stay_date"):
                raise serializers.ValidationError(
                    "room_type and stay_date are only valid for item_type 'room'."
                )
            try:
                if item_type == "ticket":
                    item = TicketInventory.objects.get(id=data["item_id"])
                    # CHANGE: Use computed remaining_inventory property
                    remaining = item.remaining_inventory
                elif item_type == "afterparty":
                    item = AfterParty.objects.get(id=data["item_id"])
                    # CHANGE: Use computed remaining_capacity property
                    remaining = item.remaining_capacity
                elif item_type == "addon":
                    item = AddOn.objects.get(id=data["item_id"])
                    # CHANGE: Use computed remaining_inventory property
                    remaining = (
                        item.remaining_inventory
                        if item.total_inventory is not None
                        else float("inf")
                    )
                if remaining < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient inventory for {item_type} {data['item_id']}: {remaining} available."
                    )
            except (
                TicketInventory.DoesNotExist,
                AfterParty.DoesNotExist,
                AddOn.DoesNotExist,
            ):
                raise serializers.ValidationError(
                    f"{item_type} with id {data['item_id']} does not exist."
                )

        return data


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True)

    class Meta:
        model = Cart
        fields = ["id", "created_at", "expires_at", "items"]
        read_only_fields = ["id", "created_at", "expires_at"]

    def validate(self, data):
        if not data.get("items"):
            raise serializers.ValidationError("Cart must contain at least one item.")
        if not any(item["item_type"] == "ticket" for item in data["items"]):
            raise serializers.ValidationError("Cart must contain at least one ticket.")
        return data

    def create(self, validated_data):
        with transaction.atomic():
            # Clean expired carts
            Cart.objects.filter(expires_at__lte=timezone.now()).delete()

            items_data = validated_data.pop("items")
            user = (
                self.context["request"].user
                if self.context["request"].user.is_authenticated
                else None
            )
            session_key = self.context["request"].session.session_key
            if not session_key:
                self.context["request"].session.create()
                session_key = self.context["request"].session.session_key

            # Clear existing active cart
            Cart.objects.filter(
                user=user, session_key=session_key, expires_at__gt=timezone.now()
            ).delete()

            # Create new cart
            cart = Cart.objects.create(
                user=user, session_key=session_key, **validated_data
            )

            # Process items (no inventory deduction since computed at runtime)
            for item_data in items_data:
                CartItem.objects.create(
                    cart=cart,
                    item_type=item_data["item_type"],
                    item_id=item_data["item_id"],
                    room_type=item_data.get("room_type"),
                    stay_date=item_data.get("stay_date"),
                    quantity=item_data["quantity"],
                )

            return cart


class BookingSerializer(serializers.ModelSerializer):
    booking_tickets = BookingTicketSerializer(many=True)
    booking_rooms = BookingRoomSerializer(many=True, required=False)
    booking_add_ons = BookingAddOnSerializer(many=True, required=False)
    booking_after_parties = BookingAfterPartySerializer(many=True, required=False)
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all())
    ticket_type = serializers.PrimaryKeyRelatedField(queryset=TicketType.objects.all())

    class Meta:
        model = Booking
        fields = [
            "id",
            "package",
            "ticket_type",
            "party_size",
            "booking_date",
            "total_amount",
            "payment_status",
            "customer_email",
            "customer_name",
            "booking_tickets",
            "booking_rooms",
            "booking_add_ons",
            "booking_after_parties",
        ]

    def validate(self, data):
        user = (
            self.context["request"].user
            if self.context["request"].user.is_authenticated
            else None
        )
        session_key = self.context["request"].session.session_key if not user else None
        if not session_key and not user:
            raise serializers.ValidationError(
                "Session or user authentication required."
            )

        total_tickets = sum(ticket["quantity"] for ticket in data["booking_tickets"])
        if total_tickets != data["party_size"]:
            raise serializers.ValidationError(
                "Total ticket quantity must equal party size."
            )

        package = Package.objects.get(id=data["package"].id)
        if package.is_hotel_required and not data.get("booking_rooms"):
            raise serializers.ValidationError(
                "Package requires at least one hotel room."
            )

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
                raise serializers.ValidationError("No active cart found.")

            cart_items = {}
            for item in cart.items.all():
                if item.item_type == "room":
                    inventory = RoomInventory.objects.get(id=item.item_id)
                    key = f"room:{inventory.room_type.id}:{inventory.stay_date}"
                else:
                    key = f"{item.item_type}:{item.item_id}"
                cart_items[key] = item.quantity

            # CHANGE: Updated ticket validation to use computed remaining_inventory
            for ticket in data["booking_tickets"]:
                ticket_type = ticket["ticket_type"]
                event_day = ticket["event_day"]
                quantity = ticket["quantity"]
                try:
                    inventory = TicketInventory.objects.get(
                        ticket_type=ticket_type, event_day=event_day
                    )
                    if inventory.remaining_inventory < quantity:
                        raise serializers.ValidationError(
                            f"Insufficient ticket inventory for {ticket_type.ticket_name}: {inventory.remaining_inventory} available."
                        )
                    key = f"ticket:{inventory.id}"
                    if key not in cart_items or cart_items[key] != quantity:
                        raise serializers.ValidationError(
                            f"Ticket {ticket_type.ticket_name} for {event_day.day_name if event_day else 'Multi-Day'} not in cart or quantity mismatch."
                        )
                except TicketInventory.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Ticket inventory not found for {ticket_type.ticket_name}."
                    )

            # CHANGE: Updated room validation to use computed remaining_rooms
            for room in data.get("booking_rooms", []):
                room_type = room["room_type"]
                stay_date = room["stay_date"]
                quantity = room["quantity"]
                try:
                    inventory = RoomInventory.objects.get(
                        room_type=room_type, stay_date=stay_date
                    )
                    if inventory.remaining_rooms < quantity:
                        raise serializers.ValidationError(
                            f"Insufficient rooms for {room_type.room_type_name} on {stay_date}: {inventory.remaining_rooms} available."
                        )
                    key = f"room:{room_type.id}:{stay_date}"
                    if key not in cart_items or cart_items[key] != quantity:
                        raise serializers.ValidationError(
                            f"Room {room_type.room_type_name} for {stay_date} not in cart or quantity mismatch."
                        )
                except RoomInventory.DoesNotExist:
                    raise serializers.ValidationError(
                        f"Room inventory not found for {room_type.room_type_name} on {stay_date}."
                    )

            # CHANGE: Updated afterparty validation to use computed remaining_capacity
            for after_party in data.get("booking_after_parties", []):
                after_party_obj = after_party["after_party"]
                quantity = after_party["quantity"]
                if after_party_obj.remaining_capacity < quantity:
                    raise serializers.ValidationError(
                        f"Insufficient capacity for {after_party_obj.after_party_type} on {after_party_obj.event_date}: {after_party_obj.remaining_capacity} available."
                    )
                key = f"afterparty:{after_party_obj.id}"
                if key not in cart_items or cart_items[key] != quantity:
                    raise serializers.ValidationError(
                        f"Afterparty {after_party_obj.after_party_type} for {after_party_obj.event_date} not in cart or quantity mismatch."
                    )

            # CHANGE: Updated add-on validation to use computed remaining_inventory
            for add_on in data.get("booking_add_ons", []):
                add_on_obj = add_on["add_on"]
                quantity = add_on["quantity"]
                if (
                    add_on_obj.total_inventory is not None
                    and add_on_obj.remaining_inventory < quantity
                ):
                    raise serializers.ValidationError(
                        f"Insufficient inventory for {add_on_obj.add_on_name}: {add_on_obj.remaining_inventory} available."
                    )
                key = f"addon:{add_on_obj.id}"
                if key not in cart_items or cart_items[key] != quantity:
                    raise serializers.ValidationError(
                        f"Add-on {add_on_obj.add_on_name} not in cart or quantity mismatch."
                    )

        return data

    def create(self, validated_data):
        with transaction.atomic():
            booking_tickets_data = validated_data.pop("booking_tickets")
            booking_rooms_data = validated_data.pop("booking_rooms", [])
            booking_add_ons_data = validated_data.pop("booking_add_ons", [])
            booking_after_parties_data = validated_data.pop("booking_after_parties", [])

            user = (
                self.context["request"].user
                if self.context["request"].user.is_authenticated
                else None
            )
            session_key = (
                self.context["request"].session.session_key if not user else None
            )

            # Calculate total_amount
            total_amount = 0
            for ticket in booking_tickets_data:
                ticket_type = TicketType.objects.get(id=ticket["ticket_type"].id)
                total_amount += ticket_type.price * ticket["quantity"]
            for room in booking_rooms_data:
                inventory = RoomInventory.objects.get(
                    room_type=room["room_type"], stay_date=room["stay_date"]
                )
                total_amount += inventory.price_per_night * room["quantity"]
            for add_on in booking_add_ons_data:
                add_on_obj = AddOn.objects.get(id=add_on["add_on"].id)
                total_amount += (add_on_obj.price_per_person or 0) * add_on["quantity"]
            for after_party in booking_after_parties_data:
                after_party_obj = AfterParty.objects.get(
                    id=after_party["after_party"].id
                )
                total_amount += (
                    after_party_obj.price_per_person * after_party["quantity"]
                )

            validated_data["total_amount"] = total_amount
            validated_data.pop("after_party", None)  # Ignore redundant field
            booking = Booking.objects.create(**validated_data)

            # Create booking items
            for ticket_data in booking_tickets_data:
                BookingTicket.objects.create(booking=booking, **ticket_data)
            for room_data in booking_rooms_data:
                BookingRoom.objects.create(booking=booking, **room_data)
            for add_on_data in booking_add_ons_data:
                BookingAddOn.objects.create(booking=booking, **add_on_data)
            for after_party_data in booking_after_parties_data:
                BookingAfterParty.objects.create(booking=booking, **after_party_data)

            # Clear cart
            Cart.objects.filter(user=user, session_key=session_key).delete()

            return booking
