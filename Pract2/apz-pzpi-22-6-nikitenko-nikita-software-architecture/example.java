// Приклад 1: Системні Виклики (концептуальний JavaScript)

class KernelService {
    constructor() {
        this.logBuffer = [];
    }

    // Системний виклик: запис даних
    write(fd, data) {
        if (fd === 1) { // Умовно, файловий дескриптор 1 для stdout (консолі)
            this.logBuffer.push(`KERNEL: Записано в stdout: "${data}"`);
            return data.length; // Повертаємо кількість записаних байтів
        }
        // ... інші файлові дескриптори або перевірки
        this.logBuffer.push(`KERNEL: Помилка запису в fd ${fd}.`);
        return -1;
    }

    // Системний виклик: створення нового процесу (спрощено)
    fork() {
        this.logBuffer.push("KERNEL: Створено новий процес (імітація fork).");
        return Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 1000) + 1; // 0 для дочірнього, PID для батьківського
    }

    // Системний виклик: завершення процесу (спрощено)
    exit(statusCode) {
        this.logBuffer.push(`KERNEL: Процес завершено зі статусом ${statusCode}.`);
    }
}

// Імітація взаємодії з ядром
const kernel = new KernelService();

// Програма в просторі користувача викликає системні виклики
function userProgram() {
    console.log("USER: Програма запущена.");

    // Запис у консоль через системний виклик write
    let bytesWritten = kernel.write(1, "Привіт з простору користувача!");
    console.log(`USER: Записано ${bytesWritten} байтів.`);

    // Створення дочірнього процесу
    let pid = kernel.fork();
    if (pid === 0) {
        // Це дочірній процес
        console.log("USER (Дочірній): Я - дочірній процес.");
        kernel.write(1, "Дочірній процес виконує роботу.");
        kernel.exit(0);
    } else if (pid > 0) {
        // Це батьківський процес
        console.log(`USER (Батьківський): Я - батьківський процес. Мій дочірній PID: ${pid}`);
        kernel.write(1, "Батьківський процес чекає.");
        // В реальності тут був би wait() системний виклик
        kernel.exit(0);
    } else {
        console.log("USER: Помилка fork().");
        kernel.exit(1);
    }

    console.log("USER: Програма завершила роботу.");
}

userProgram();
console.log("\n--- Логи ядра ---");
kernel.logBuffer.forEach(log => console.log(log));



// Приклад 2: Керування Пам'яттю та VFS (концептуальний JavaScript)

// --- Керування Пам'яттю (спрощена модель) ---
class MemoryManager {
    constructor(totalMemory) {
        this.totalMemory = totalMemory;
        this.allocatedMemory = 0;
        this.memoryMap = new Map(); // Map<processId, size>
        console.log(`Менеджер пам'яті: Всього ${totalMemory}MB.`);
    }

    // Імітація виділення пам'яті для процесу
    allocate(processId, size) {
        if (this.allocatedMemory + size > this.totalMemory) {
            console.log(`Пам'ять: Недостатньо пам'яті для процесу ${processId} (${size}MB). Доступно: ${this.totalMemory - this.allocatedMemory}MB.`);
            return false;
        }
        this.memoryMap.set(processId, size);
        this.allocatedMemory += size;
        console.log(`Пам'ять: Виділено ${size}MB для процесу ${processId}. Зайнято: ${this.allocatedMemory}MB.`);
        return true;
    }

    // Імітація звільнення пам'яті процесом
    deallocate(processId) {
        if (this.memoryMap.has(processId)) {
            const size = this.memoryMap.get(processId);
            this.allocatedMemory -= size;
            this.memoryMap.delete(processId);
            console.log(`Пам'ять: Звільнено ${size}MB від процесу ${processId}. Зайнято: ${this.allocatedMemory}MB.`);
            return true;
        }
        console.log(`Пам'ять: Процес ${processId} не мав виділеної пам'яті.`);
        return false;
    }
}

const memManager = new MemoryManager(256); // Умовно 256MB пам'яті
memManager.allocate("PID1", 64);
memManager.allocate("PID2", 128);
memManager.allocate("PID3", 100); // Спроба виділити більше, ніж є
memManager.deallocate("PID1");
memManager.allocate("PID3", 40); // Тепер є місце


console.log("\n--- Віртуальна Файлова Система (VFS) ---");
// --- Віртуальна Файлова Система (VFS) ---
// VFS абстрагує взаємодію з різними типами файлових систем.

class FileSystemInterface {
    // Базовий інтерфейс для файлових систем
    read(path) { throw new Error("Method 'read' not implemented."); }
    write(path, data) { throw new Error("Method 'write' not implemented."); }
    list(path) { throw new Error("Method 'list' not implemented."); }
}

// Конкретна файлова система (імітація)
class Ext4FileSystem extends FileSystemInterface {
    constructor() {
        this.files = { "/home/user/doc.txt": "Вміст файлу Ext4", "/var/log/syslog": "Логи системи" };
        console.log("VFS: Ext4 файлова система змонтована.");
    }
    read(path) { return this.files[path] || "Файл не знайдено (Ext4)."; }
    write(path, data) { this.files[path] = data; console.log(`Ext4: Записано в ${path}`); }
    list(path = "/") { return Object.keys(this.files).filter(f => f.startsWith(path)); }
}

class NTFSFileSystem extends FileSystemInterface {
    constructor() {
        this.files = { "/media/drive/data.docx": "Документ NTFS", "/media/drive/photo.jpg": "Фото" };
        console.log("VFS: NTFS файлова система змонтована.");
    }
    read(path) { return this.files[path] || "Файл не знайдено (NTFS)."; }
    write(path, data) { this.files[path] = data; console.log(`NTFS: Записано в ${path}`); }
    list(path = "/") { return Object.keys(this.files).filter(f => f.startsWith(path)); }
}

// VFS Core - точка входу для користувача
class VFS {
    constructor() {
        this.mountedFS = {}; // Map<mountPoint, FileSystemInterface>
    }

    mount(path, fsInstance) {
        this.mountedFS[path] = fsInstance;
        console.log(`VFS: Файлова система змонтована в ${path}.`);
    }

    // Операції, які викликає користувач/програма
    readFile(path) {
        for (const mountPoint in this.mountedFS) {
            if (path.startsWith(mountPoint)) {
                const relativePath = path;
                return this.mountedFS[mountPoint].read(relativePath);
            }
        }
        return "Помилка: Файлова система для шляху не знайдена.";
    }
}

const vfs = new VFS();
vfs.mount("/", new Ext4FileSystem()); // Монтуємо Ext4 як кореневу
vfs.mount("/media/external", new NTFSFileSystem()); // Монтуємо NTFS в /media/external

console.log(vfs.readFile("/home/user/doc.txt"));
console.log(vfs.readFile("/media/external/data.docx"));
console.log(vfs.readFile("/nonexistent/file.txt"));



// Приклад 3: Драйвери Пристроїв та Модулі Ядра (концептуальний JavaScript)

console.log("--- Драйвери Пристроїв (спрощено) ---");
// --- Драйвери Пристроїв (спрощено) ---
// Драйвери надають стандартизований інтерфейс для взаємодії ядра з обладнанням.

class DeviceDriver {
    constructor(deviceName) {
        this.deviceName = deviceName;
        console.log(`Драйвер: Ініціалізація драйвера для ${this.deviceName}.`);
    }
    
    // Операція читання з пристрою
    readData() {
        throw new Error("Method 'readData' not implemented.");
    }

    // Операція запису на пристрій
    writeData(data) {
        throw new Error("Method 'writeData' not implemented.");
    }
}

class KeyboardDriver extends DeviceDriver {
    constructor() {
        super("Клавіатура");
    }
    readData() {
        const input = Math.random() < 0.5 ? "Натиснуто 'A'" : "Натиснуто 'Enter'";
        console.log(`Драйвер Клавіатури: Читаємо дані - "${input}"`);
        return input;
    }
    writeData(data) {
        console.log(`Драйвер Клавіатури: Неможливо записати на клавіатуру: ${data}`);
    }
}

class NetworkCardDriver extends DeviceDriver {
    constructor() {
        super("Мережева Карта");
    }
    readData() {
        const packet = Math.random() < 0.7 ? "Отримано пакет HTTP" : "Отримано пакет DNS";
        console.log(`Драйвер Мережевої Карти: Отримано дані - "${packet}"`);
        return packet;
    }
    writeData(data) {
        console.log(`Драйвер Мережевої Карти: Відправлено пакет: ${data}`);
    }
}

// Ядро взаємодіє через загальний інтерфейс драйвера
const keyboard = new KeyboardDriver();
const networkCard = new NetworkCardDriver();

keyboard.readData();
networkCard.writeData("Привіт, Інтернет!");
keyboard.writeData("Текст для клавіатури"); // Показує неможливість запису


console.log("\n--- Модулі Ядра (спрощено) ---");
// --- Модулі Ядра (спрощено) ---
// Модулі ядра дозволяють динамічно додавати/видаляти функціональність без перезавантаження.

class KernelModule {
    constructor(name) {
        this.name = name;
        this.loaded = false;
    }

    // Функція, що виконується при завантаженні модуля
    init() {
        if (!this.loaded) {
            this.loaded = true;
            console.log(`Модуль Ядра: Модуль '${this.name}' завантажено.`);
        } else {
            console.log(`Модуль Ядра: Модуль '${this.name}' вже завантажений.`);
        }
    }

    // Функція, що виконується при вивантаженні модуля
    exit() {
        if (this.loaded) {
            this.loaded = false;
            console.log(`Модуль Ядра: Модуль '${this.name}' вивантажено.`);
        } else {
            console.log(`Модуль Ядра: Модуль '${this.name}' не завантажений.`);
        }
    }

    // Додаткова функціональність модуля
    performAction() {
        if (this.loaded) {
            console.log(`Модуль Ядра: Модуль '${this.name}' виконує дію.`);
        } else {
            console.log(`Модуль Ядра: Модуль '${this.name}' неактивний, неможливо виконати дію.`);
        }
    }
}

// Імітація ядра, що керує модулями
class KernelModuleManager {
    constructor() {
        this.activeModules = new Map();
    }

    // Команда 'insmod' (insert module)
    loadModule(moduleInstance) {
        if (!this.activeModules.has(moduleInstance.name)) {
            moduleInstance.init();
            this.activeModules.set(moduleInstance.name, moduleInstance);
        } else {
            console.log(`Менеджер Модулів: Модуль '${moduleInstance.name}' вже завантажений.`);
        }
    }

    // Команда 'rmmod' (remove module)
    unloadModule(moduleName) {
        if (this.activeModules.has(moduleName)) {
            const moduleInstance = this.activeModules.get(moduleName);
            moduleInstance.exit();
            this.activeModules.delete(moduleName);
        } else {
            console.log(`Менеджер Модулів: Модуль '${moduleName}' не знайдено.`);
        }
    }
}

const kernelModuleManager = new KernelModuleManager();
const usbModule = new KernelModule("usb_storage");
const firewallModule = new KernelModule("netfilter");

kernelModuleManager.loadModule(usbModule);
usbModule.performAction();
kernelModuleManager.loadModule(firewallModule);
firewallModule.performAction();

console.log("\nВивантажуємо модулі:");
kernelModuleManager.unloadModule("usb_storage");
usbModule.performAction(); // Спроба виконати дію на вивантаженому модулі
kernelModuleManager.unloadModule("nonexistent_module");