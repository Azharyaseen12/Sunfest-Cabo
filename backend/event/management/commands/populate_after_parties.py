from django.core.management.base import BaseCommand
from django.db import transaction
from event.models import (
    AfterParty,
)
from datetime import date
import uuid


class Command(BaseCommand):
    help = "Populates the Sunset Fest Cabo database with after parties"

    def handle(self, *args, **kwargs):
        with transaction.atomic():
            self.stdout.write(
                self.style.SUCCESS("Starting after parties population...")
            )
            after_parties_data = [
                {
                    "after_party_type": "Type 1",
                    "event_date": date(2025, 10, 24),
                    "location": "ME Cabo, Pool Deck",
                    "price_per_person": 50.00,
                    "total_capacity": 2000,
                    "remaining_capacity": 2000,
                },
                {
                    "after_party_type": "Type 1",
                    "event_date": date(2025, 10, 25),
                    "location": "ME Cabo, Pool Deck",
                    "price_per_person": 50.00,
                    "total_capacity": 2000,
                    "remaining_capacity": 2000,
                },
                {
                    "after_party_type": "Type 2",
                    "event_date": date(2025, 10, 24),
                    "location": "Rooftop 360, Corazón Resort",
                    "price_per_person": 75.00,
                    "total_capacity": 500,
                    "remaining_capacity": 500,
                },
                {
                    "after_party_type": "Type 2",
                    "event_date": date(2025, 10, 25),
                    "location": "Private Beach, Paradisus Los Cabos",
                    "price_per_person": 75.00,
                    "total_capacity": 500,
                    "remaining_capacity": 500,
                },
            ]
            after_parties = {}
            for ap in after_parties_data:
                after_party, created = AfterParty.objects.get_or_create(
                    after_party_type=ap["after_party_type"],
                    event_date=ap["event_date"],
                    location=ap["location"],
                    defaults={
                        "id": uuid.uuid4(),
                        "price_per_person": ap["price_per_person"],
                        "total_capacity": ap["total_capacity"],
                        "remaining_capacity": ap["remaining_capacity"],
                    },
                )
                after_parties[
                    f"{ap['after_party_type']}_{ap['event_date']}_{ap['location']}"
                ] = after_party
                self.stdout.write(
                    self.style.SUCCESS(
                        f"{'Created' if created else 'Found'} after party: {ap['after_party_type']} at {ap['location']} on {ap['event_date']}"
                    )
                )

            self.stdout.write(
                self.style.SUCCESS("Data population completed successfully!")
            )
