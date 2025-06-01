1  class Product:
2      def operation(self):
3          pass
4  
5  class ConcreteProductA(Product):
6      def operation(self):
7          return "Результат продукту A"
8  
9  class ConcreteProductB(Product):
10     def operation(self):
11         return "Результат продукту B"
12 
13 class Creator:
14     def factory_method(self):
15         pass
16 
17     def some_operation(self):
18         product = self.factory_method()
19         return f"Creator: {product.operation()}"
20 
21 class ConcreteCreatorA(Creator):
22     def factory_method(self):
23         return ConcreteProductA()
24 
25 class ConcreteCreatorB(Creator):
26     def factory_method(self):
27         return ConcreteProductB()
28 
29 # Використання
30 creator_a = ConcreteCreatorA()
31 print(creator_a.some_operation())  # Виведе: Creator: Результат продукту A
32 creator_b = ConcreteCreatorB()
33 print(creator_b.some_operation())  # Виведе: Creator: Результат продукту B




class Subject:
    def __init__(self):
        self._observers = []
    def attach(self, observer):
        self._observers.append(observer)
    def notify(self):
        for observer in self._observers:
            observer.update()

class Observer:
    def update(self):
        pass



        class Product:
    def operation(self):
        pass

class ConcreteProductA(Product):
    def operation(self):
        return "Результат продукту A"

class Creator:
    def factory_method(self):
        pass

class ConcreteCreatorA(Creator):
    def factory_method(self):
        return ConcreteProductA()