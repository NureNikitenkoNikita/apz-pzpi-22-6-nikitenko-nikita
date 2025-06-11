// Абстракція Реалізації (Implementor)
class DrawingAPI {
    draw(shape, details) { /* ... */ }
}

// Конкретні Реалізації
class ConsoleDrawingAPI extends DrawingAPI {
    draw(shape, details) { console.log(`Малюємо в консолі: ${shape} ${JSON.stringify(details)}`); }
}
class CanvasDrawingAPI extends DrawingAPI {
    draw(shape, details) { console.log(`Малюємо на полі: ${shape} ${JSON.stringify(details)}`); }
}

// Абстракція
class Shape {
    constructor(api) { this.drawingAPI = api; }
    draw() { /* ... */ }
}

// Уточнена Абстракція
class Circle extends Shape {
    constructor(api) { super(api); this.details = { radius: 50 }; }
    draw() { return this.drawingAPI.draw('Коло', this.details); }
}

// Використання
const circleOnConsole = new Circle(new ConsoleDrawingAPI());
circleOnConsole.draw(); // Малюємо в консолі: Коло {"radius":50}
const circleOnCanvas = new Circle(new CanvasDrawingAPI());
circleOnCanvas.draw();   // Малюємо на полі: Коло {"radius":50}



// Абстракція Реалізації (Implementor)
class Device {
    enable() { /* ... */ }
    disable() { /* ... */ }
}

// Конкретні Реалізації
class Tv extends Device {
    enable() { console.log("TV: Увімкнено."); }
    disable() { console.log("TV: Вимкнено."); }
}
class Radio extends Device {
    enable() { console.log("Радіо: Увімкнено."); }
    disable() { console.log("Радіо: Вимкнено."); }
}

// Абстракція
class RemoteControl {
    constructor(device) { this.device = device; }
    togglePower() { /* ... */ }
}

// Уточнена Абстракція
class BasicRemote extends RemoteControl {
    togglePower() { console.log("Базовий пульт: Перемикання живлення."); this.device.enable(); } // Спрощено
}

// Використання
const tv = new Tv();
const radio = new Radio();
const tvRemote = new BasicRemote(tv);
tvRemote.togglePower(); // Базовий пульт: Перемикання живлення. TV: Увімкнено.
const radioRemote = new BasicRemote(radio);
radioRemote.togglePower(); // Базовий пульт: Перемикання живлення. Радіо: Увімкнено.



// Абстракція Реалізації (Implementor)
class MessageSender {
    send(message) { /* ... */ }
}

// Конкретні Реалізації
class EmailSender extends MessageSender {
    send(message) { console.log(`Відправлено Email: "${message}"`); }
}
class SmsSender extends MessageSender {
    send(message) { console.log(`Відправлено SMS: "${message}"`); }
}

// Абстракція
class Notification {
    constructor(sender) { this.sender = sender; }
    send(text) { /* ... */ }
}

// Уточнена Абстракція (в даному випадку просто Notification, що є і Абстракцією, і Уточненою)
class SimpleNotification extends Notification {
    send(text) { console.log("Сповіщення:"); this.sender.send(text); }
}

// Використання
const emailNotif = new SimpleNotification(new EmailSender());
emailNotif.send("Привіт, це тестове повідомлення."); // Сповіщення: Відправлено Email: "Привіт, це тестове повідомлення."
const smsNotif = new SimpleNotification(new SmsSender());
smsNotif.send("Нове оновлення!"); // Сповіщення: Відправлено SMS: "Нове оновлення!"