#! /usr/bin/env python
# -*- coding: utf-8 -*-
import csv
import pickle
import numpy
import scipy.ndimage
import scipy.special
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Dataset
class neuralNetwork:
    #инициализация
    def __init__(self, inputnodes, hiddennodes, outputnodes, learningrate):
        #узлы входного,скрытого и выходного слоя
        self.inodes = inputnodes
        self.hnodes = hiddennodes
        self.onodes = outputnodes
        #коэффициент обучения
        self.lr = learningrate
        #Матрица весовых коэффициентов между входным и скрытым слоями
        self.wih = (numpy.random.rand(self.hnodes, self.inodes) - 0.5)
        #Матрица весовых коэффициентов между скрытым и выходным слоями
        self.who = (numpy.random.rand(self.onodes, self.hnodes) - 0.5)
        # использование сигмоиды в качестве функции активации
        self.activation_function = lambda x: scipy.special.expit(x)
        pass
    #обучение
    def train(self, inputs_list, targets_list):
        # преобразовать список входных значений в двухмерный массив
        inputs = numpy.array(inputs_list, ndmin=2).T
        targets = numpy.array(targets_list, ndmin=2).T
        # рассчитать входящие сигналы для скрытого слоя
        hidden_inputs = numpy.dot(self.wih, inputs)
        # рассчитать исходящие сигналы для скрытого слоя
        hidden_outputs = self.activation_function(hidden_inputs)
        # рассчитать входящие сигналы для выходного слоя
        final_inputs = numpy.dot(self.who, hidden_outputs)
        # рассчитать исходящие сигналы для выходного слоя
        final_outputs = self.activation_function(final_inputs)
        # ошибки выходного слоя =
        # (целевое значение - фактическое значение)
        output_errors = targets - final_outputs
        # ошибки скрытого слоя - это ошибки output_errors,
        # распределенные пропорционально весовым коэффициентам связей
        # и рекомбинированные на скрытых узлах
        hidden_errors = numpy.dot(self.who.T, output_errors)
        # обновить весовые коэффициенты для связей между скрытым и выходным слоями
        self.who += self.lr * numpy.dot((output_errors * final_outputs * (1.0 - final_outputs)),numpy.transpose (hidden_outputs))
        # обновить весовые коэффициенты для связей между
        # входным и скрытым слоями
        self.wih += self.lr * numpy.dot((hidden_errors * hidden_outputs * (1.0 - hidden_outputs)), numpy.transpose(inputs))
        pass
    #опрос нейронной сети
    def query(self, inputs_list):
        # преобразовать список входных значений
        # в двухмерный массив
        inputs = numpy.array(inputs_list, ndmin=2).T
        # рассчитать входящие сигналы для скрытого слоя
        hidden_inputs = numpy.dot(self.wih, inputs)
        # рассчитать исходящие сигналы для скрытого слоя
        hidden_outputs = self.activation_function(hidden_inputs)
        # рассчитать входящие сигналы для выходного слоя
        final_inputs = numpy.dot(self.who, hidden_outputs)
        # рассчитать исходящие сигналы для выходного слоя
        final_outputs = self.activation_function(final_inputs)
        return final_outputs
#создаем нейронную сеть
input_nodes = 784
hidden_nodes = 620
output_nodes = 31
learning_rate = 0.01
f = open(r'neyro.txt', 'rb')
neural_net = neuralNetwork(input_nodes, hidden_nodes, output_nodes, learning_rate)
neural_net.wih = pickle.load(f)
neural_net.who = pickle.load(f)
f.close()


# Create your views here.
def index(request):
    # Отрисовка HTML-шаблона index.html с данными внутри
    # переменной контекста context
    return render(
        request,
        'index.html',
        context={},
    )
@csrf_exempt
def write(request):
    FILENAME = "dataset.csv"
    if request.method == "POST":
        input_arr = str(request.body,'utf-8').split(",")
        target = input_arr[len(input_arr)-1]
        data_arr = ""
        i = 0
        for item in input_arr[0:-1]:
            data_arr += item
            i += 1
            if i < len(input_arr[0:-1]):
                data_arr += ","
        data = Dataset(target_letter = target, data_array = data_arr)
        data.save()
        data_list = Dataset.objects.all()
        with open(FILENAME, "w", newline="") as file:
            for data_item in data_list:
                writer = csv.writer(file)
                writer.writerow([data_item.target_letter, data_item.data_array])
        return HttpResponse('Данные записаны!', content_type='text/html')
    else:
        return HttpResponse('Неудача', content_type='text/html')
@csrf_exempt
def read(request):
    input_arr = str(request.body,'utf-8').split(",")
    int_input = []
    for item in input_arr:
        if item != '':
            int_input.append(int(item.replace('"','')))
    out = neural_net.query(numpy.asfarray(int_input))
    alphabet ={'А':1,'Б':2,'В':3,'Г':4,'Д':5,'Е':6,'Ж':7,'З':8,'И':9,'К':10,'Л':11,'М':12,'Н':13,'О':14,'П':15,
          'Р':16,'С':17,'Т':18,'У':19,'Ф':20,'Х':21,'Ц':22,'Ч':23,'Ш':24,'Щ':25,'Ъ':26,'Ы':27,'Ь':28,'Э':29,'Ю':30,'Я':31}
    target_letter = ""
    target_value = 0
    i=0
    for letter in alphabet.keys():
        if out[i] > target_value:
            target_letter = letter
            target_value = out[i]
        i+=1
    return HttpResponse("Результат распознавания - " + target_letter, content_type='text/html')
