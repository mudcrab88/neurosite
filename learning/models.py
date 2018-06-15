from django.db import models

# Create your models here.
class Dataset(models.Model):
    target_letter = models.CharField(max_length=1)
    data_array = models.CharField(max_length=500)