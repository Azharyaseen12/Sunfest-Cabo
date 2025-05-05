# sunset_fest/api/serializers.py
from rest_framework import serializers
from event.models import (
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
        fields = [
            "id",
            "package",
            "ticket_name",
            "price",
            "description",
            "total_inventory",
            "remaining_inventory",
        ]


class EventDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDay
        fields = ["id", "event_date", "day_name"]


class TicketInventorySerializer(serializers.ModelSerializer):
    ticket_type = TicketTypeSerializer(read_only=True)
    event_day = EventDaySerializer(read_only=True)

    class Meta:
        model = TicketInventory
        fields = [
            "id",
            "ticket_type",
            "event_day",
            "total_inventory",
            "remaining_inventory",
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
        # Validate party_size against booking_tickets quantity
        total_tickets = sum(ticket["quantity"] for ticket in data["booking_tickets"])
        if total_tickets != data["party_size"]:
            raise serializers.ValidationError(
                "Total ticket quantity must equal party size."
            )

        # Validate inventory availability
        for ticket in data["booking_tickets"]:
            ticket_type = TicketType.objects.get(id=ticket["ticket_type"].id)
            if ticket_type.remaining_inventory < ticket["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient ticket inventory for {ticket_type.ticket_name}."
                )
            if ticket["event_day"]:
                inventory = TicketInventory.objects.get(
                    ticket_type=ticket["ticket_type"], event_day=ticket["event_day"]
                )
                if inventory.remaining_inventory < ticket["quantity"]:
                    raise serializers.ValidationError(
                        f"Insufficient inventory for {ticket_type.ticket_name} on {ticket['event_day'].day_name}."
                    )

        for room in data.get("booking_rooms", []):
            inventory = RoomInventory.objects.get(
                room_type=room["room_type"],
                stay_date=room["stay_date"],
            )
            if inventory.remaining_rooms < room["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient room inventory for {room['hotel'].hotel_name} on {room['stay_date']}."
                )

        for add_on in data.get("booking_add_ons", []):
            add_on_obj = add_on["add_on"]
            if (
                add_on_obj.total_inventory is not None
                and add_on_obj.remaining_inventory < add_on["quantity"]
            ):
                raise serializers.ValidationError(
                    f"Insufficient inventory for {add_on_obj.add_on_name}."
                )

        for after_party in data.get("booking_after_parties", []):  # NEW
            after_party_obj = after_party["after_party"]
            if after_party_obj.remaining_capacity < after_party["quantity"]:
                raise serializers.ValidationError(
                    f"Insufficient capacity for {after_party_obj.after_party_type} on {after_party_obj.event_date} at {after_party_obj.location}."
                )

        return data

    def create(self, validated_data):
        booking_tickets_data = validated_data.pop("booking_tickets")
        booking_rooms_data = validated_data.pop("booking_rooms", [])
        booking_add_ons_data = validated_data.pop("booking_add_ons", [])
        booking_after_parties_data = validated_data.pop("booking_after_parties", [])

        # Calculate total_amount (simplified, assumes price from ticket_type and add-ons)
        total_amount = 0
        for ticket in booking_tickets_data:
            ticket_type = TicketType.objects.get(id=ticket["ticket_type"].id)
            total_amount += ticket_type.price * ticket["quantity"]

        for room in booking_rooms_data:
            inventory = RoomInventory.objects.get(
                room_type=room["room_type"],
                stay_date=room["stay_date"],
            )
            total_amount += inventory.price_per_night * room["quantity"]

        for add_on in booking_add_ons_data:
            add_on_obj = AddOn.objects.get(id=add_on["add_on"].id)
            total_amount += (add_on_obj.price_per_person or 0) * add_on["quantity"]

        for after_party in booking_after_parties_data:
            after_party_obj = AfterParty.objects.get(id=after_party["after_party"].id)
            total_amount += after_party_obj.price_per_person * after_party["quantity"]

        validated_data["total_amount"] = total_amount
        booking = Booking.objects.create(**validated_data)

        # Create related objects
        for ticket_data in booking_tickets_data:
            BookingTicket.objects.create(booking=booking, **ticket_data)
        for room_data in booking_rooms_data:
            BookingRoom.objects.create(booking=booking, **room_data)
        for add_on_data in booking_add_ons_data:
            BookingAddOn.objects.create(booking=booking, **add_on_data)
        for after_party_data in booking_after_parties_data:
            BookingAfterParty.objects.create(booking=booking, **after_party_data)

        return booking
