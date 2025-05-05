# sunset_fest/management/commands/populate_data.py
from django.core.management.base import BaseCommand
from django.db import transaction
from event.models import (
    Package,
    TicketType,
    EventDay,
    TicketInventory,
    Hotel,
    RoomType,
    RoomInventory,
    AddOn,
)
from datetime import date
import uuid


class Command(BaseCommand):
    help = "Populates the Sunset Fest Cabo database with sample data"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            self.stdout.write(self.style.SUCCESS("Starting data population..."))

            # Create Packages
            packages_data = [
                {
                    "package_name": "Single Day Ticket",
                    "description": "Single day access to Sunset Fest Cabo",
                },
                {
                    "package_name": "Three Day Ticket",
                    "description": "Three day access to Sunset Fest Cabo",
                },
                {
                    "package_name": "Room + Ticket Package",
                    "description": "Includes 3-day ticket and hotel",
                },
                {
                    "package_name": "VIP Observation Deck",
                    "description": "All-inclusive VIP experience",
                },
            ]
            packages = {}
            for pkg in packages_data:
                package, created = Package.objects.get_or_create(
                    package_name=pkg["package_name"],
                    defaults={
                        "id": uuid.uuid4(),
                        "description": pkg["description"],
                        "is_active": True,
                    },
                )
                packages[pkg["package_name"]] = package
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} package: {pkg['package_name']}"
                    )
                )

            # Create Ticket Types
            ticket_types_data = [
                {
                    "package": "Single Day Ticket",
                    "ticket_name": "GA",
                    "price": 1300.00,
                    "description": "General Admission",
                    "total_inventory": 1300,
                    "remaining_inventory": 1300,
                },
                {
                    "package": "Single Day Ticket",
                    "ticket_name": "VIP",
                    "price": 200.00,
                    "description": "Includes open bar, light food, seating, VIP restrooms",
                    "total_inventory": 200,
                    "remaining_inventory": 200,
                },
                {
                    "package": "Three Day Ticket",
                    "ticket_name": "GA",
                    "price": 4500.00,
                    "description": "General Admission for 3 days",
                    "total_inventory": 4500,
                    "remaining_inventory": 4500,
                },
                {
                    "package": "Three Day Ticket",
                    "ticket_name": "VIP",
                    "price": 1500.00,
                    "description": "VIP for 3 days",
                    "total_inventory": 1500,
                    "remaining_inventory": 1500,
                },
                {
                    "package": "Room + Ticket Package",
                    "ticket_name": "GA",
                    "price": 200.00,
                    "description": "3-day GA with hotel",
                    "total_inventory": 200,
                    "remaining_inventory": 200,
                },
                {
                    "package": "Room + Ticket Package",
                    "ticket_name": "VIP",
                    "price": 300.00,
                    "description": "3-day VIP with hotel",
                    "total_inventory": 300,
                    "remaining_inventory": 300,
                },
                {
                    "package": "VIP Observation Deck",
                    "ticket_name": "Captain",
                    "price": 500.00,
                    "description": "VIP 3-day with hotel and after parties",
                    "total_inventory": 500,
                    "remaining_inventory": 500,
                },
                {
                    "package": "VIP Observation Deck",
                    "ticket_name": "Admiral",
                    "price": 50.00,
                    "description": "Premium VIP with observation deck",
                    "total_inventory": 50,
                    "remaining_inventory": 50,
                },
            ]
            ticket_types = {}
            for tt in ticket_types_data:
                ticket_type, created = TicketType.objects.get_or_create(
                    package=packages[tt["package"]],
                    ticket_name=tt["ticket_name"],
                    defaults={
                        "id": uuid.uuid4(),
                        "price": tt["price"],
                        "description": tt["description"],
                        "total_inventory": tt["total_inventory"],
                        "remaining_inventory": tt["remaining_inventory"],
                    },
                )
                ticket_types[f"{tt['package']}_{tt['ticket_name']}"] = ticket_type
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} ticket type: {tt['ticket_name']} for {tt['package']}"
                    )
                )

            # Create Event Days
            event_days_data = [
                {"event_date": date(2025, 5, 2), "day_name": "Friday"},
                {"event_date": date(2025, 5, 3), "day_name": "Saturday"},
                {"event_date": date(2025, 5, 4), "day_name": "Sunday"},
            ]
            event_days = {}
            for ed in event_days_data:
                event_day, created = EventDay.objects.get_or_create(
                    event_date=ed["event_date"],
                    defaults={"id": uuid.uuid4(), "day_name": ed["day_name"]},
                )
                event_days[ed["day_name"]] = event_day
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} event day: {ed['day_name']}"
                    )
                )

            # Create Ticket Inventory (for Single Day Tickets)
            ticket_inventory_data = [
                {
                    "ticket_type": "Single Day Ticket_GA",
                    "event_day": "Friday",
                    "total_inventory": 1300,
                    "remaining_inventory": 1300,
                },
                {
                    "ticket_type": "Single Day Ticket_GA",
                    "event_day": "Saturday",
                    "total_inventory": 1300,
                    "remaining_inventory": 1300,
                },
                {
                    "ticket_type": "Single Day Ticket_GA",
                    "event_day": "Sunday",
                    "total_inventory": 1300,
                    "remaining_inventory": 1300,
                },
                {
                    "ticket_type": "Single Day Ticket_VIP",
                    "event_day": "Friday",
                    "total_inventory": 200,
                    "remaining_inventory": 200,
                },
                {
                    "ticket_type": "Single Day Ticket_VIP",
                    "event_day": "Saturday",
                    "total_inventory": 200,
                    "remaining_inventory": 200,
                },
                {
                    "ticket_type": "Single Day Ticket_VIP",
                    "event_day": "Sunday",
                    "total_inventory": 200,
                    "remaining_inventory": 200,
                },
            ]
            for ti in ticket_inventory_data:
                ticket_inventory, created = TicketInventory.objects.get_or_create(
                    ticket_type=ticket_types[ti["ticket_type"]],
                    event_day=event_days[ti["event_day"]],
                    defaults={
                        "id": uuid.uuid4(),
                        "total_inventory": ti["total_inventory"],
                        "remaining_inventory": ti["remaining_inventory"],
                    },
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} ticket inventory: {ti['ticket_type']} for {ti['event_day']}"
                    )
                )

            # Create Hotels
            hotels_data = [
                {"hotel_name": "ME Cabo", "is_premium": False},
                {"hotel_name": "Paradisus", "is_premium": True},
                {"hotel_name": "Corazón", "is_premium": True},
                {"hotel_name": "Casa Dorada", "is_premium": True},
            ]
            hotels = {}
            for h in hotels_data:
                hotel, created = Hotel.objects.get_or_create(
                    hotel_name=h["hotel_name"],
                    defaults={
                        "id": uuid.uuid4(),
                        "is_premium": h["is_premium"],
                        "address": "Cabo San Lucas, Mexico",
                        "description": f'{h["hotel_name"]} in Cabo',
                    },
                )
                hotels[h["hotel_name"]] = hotel
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} hotel: {h['hotel_name']}"
                    )
                )

            # Create Room Types
            room_types_data = [
                {
                    "room_type_name": "Standard",
                    "description": "Double occupancy room",
                    "capacity": 2,
                },
                {
                    "room_type_name": "Suite",
                    "description": "Premium suite",
                    "capacity": 2,
                },
            ]
            room_types = {}
            for rt in room_types_data:
                room_type, created = RoomType.objects.get_or_create(
                    room_type_name=rt["room_type_name"],
                    defaults={
                        "id": uuid.uuid4(),
                        "description": rt["description"],
                        "capacity": rt["capacity"],
                    },
                )
                room_types[rt["room_type_name"]] = room_type
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} room type: {rt['room_type_name']}"
                    )
                )

            # Create Room Inventory
            room_inventory_data = [
                {
                    "hotel": "ME Cabo",
                    "room_type": "Standard",
                    "stay_date": date(2025, 5, 2),
                    "total_rooms": 100,
                    "remaining_rooms": 100,
                    "price_per_night": 200.00,
                },
                {
                    "hotel": "ME Cabo",
                    "room_type": "Standard",
                    "stay_date": date(2025, 5, 3),
                    "total_rooms": 100,
                    "remaining_rooms": 100,
                    "price_per_night": 200.00,
                },
                {
                    "hotel": "ME Cabo",
                    "room_type": "Standard",
                    "stay_date": date(2025, 5, 4),
                    "total_rooms": 100,
                    "remaining_rooms": 100,
                    "price_per_night": 200.00,
                },
                {
                    "hotel": "Paradisus",
                    "room_type": "Suite",
                    "stay_date": date(2025, 5, 2),
                    "total_rooms": 50,
                    "remaining_rooms": 50,
                    "price_per_night": 400.00,
                },
                {
                    "hotel": "Paradisus",
                    "room_type": "Suite",
                    "stay_date": date(2025, 5, 3),
                    "total_rooms": 50,
                    "remaining_rooms": 50,
                    "price_per_night": 400.00,
                },
                {
                    "hotel": "Paradisus",
                    "room_type": "Suite",
                    "stay_date": date(2025, 5, 4),
                    "total_rooms": 50,
                    "remaining_rooms": 50,
                    "price_per_night": 400.00,
                },
            ]
            for ri in room_inventory_data:
                room_inventory, created = RoomInventory.objects.get_or_create(
                    hotel=hotels[ri["hotel"]],
                    room_type=room_types[ri["room_type"]],
                    stay_date=ri["stay_date"],
                    defaults={
                        "id": uuid.uuid4(),
                        "total_rooms": ri["total_rooms"],
                        "remaining_rooms": ri["remaining_rooms"],
                        "price_per_night": ri["price_per_night"],
                    },
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} room inventory: {ri['hotel']} - {ri['room_type']} for {ri['stay_date']}"
                    )
                )

            # Create Add-Ons
            add_ons_data = [
                {
                    "add_on_name": "After Party",
                    "price_per_person": 50.00,
                    "total_inventory": 1000,
                    "remaining_inventory": 1000,
                    "is_per_person": True,
                },
                {
                    "add_on_name": "Excursions",
                    "price_per_person": 100.00,
                    "total_inventory": None,
                    "remaining_inventory": None,
                    "is_per_person": True,
                },
                {
                    "add_on_name": "Airport Transportation",
                    "price_per_person": 200.00,
                    "total_inventory": None,
                    "remaining_inventory": None,
                    "is_per_person": False,
                },
                {
                    "add_on_name": "Yacht Party",
                    "price_per_person": 300.00,
                    "total_inventory": 50,
                    "remaining_inventory": 50,
                    "is_per_person": True,
                },
            ]
            for ao in add_ons_data:
                add_on, created = AddOn.objects.get_or_create(
                    add_on_name=ao["add_on_name"],
                    defaults={
                        "id": uuid.uuid4(),
                        "price_per_person": ao["price_per_person"],
                        "total_inventory": ao["total_inventory"],
                        "remaining_inventory": ao["remaining_inventory"],
                        "is_per_person": ao["is_per_person"],
                        "description": f'{ao["add_on_name"]} for Sunset Fest Cabo',
                    },
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} add-on: {ao['add_on_name']}"
                    )
                )

            self.stdout.write(
                self.style.SUCCESS("Data population completed successfully!")
            )
