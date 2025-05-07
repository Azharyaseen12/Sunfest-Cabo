from django.contrib import admin
from .models import  PaypalPayment, StripPayment , Payment
# Register your models here.
admin.site.register(PaypalPayment)
admin.site.register(StripPayment)
admin.site.register(Payment)