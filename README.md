# 🌍 GeoGuard Pro  
**Реальний моніторинг катастроф із силою IoT**

> _"Коли стихія наближається — краще знати першим."_

**GeoGuard Pro** — це передова система моніторингу природних катастроф, яка поєднує потужність IoT-сенсорів, зовнішніх API (USGS, EONET) і сучасних технологій для збору, обробки та візуалізації даних у реальному часі. Від землетрусів до лісових пожеж — ми допомагаємо залишатися на крок попереду.

---

## 🚀 Можливості

- 🔴 **Моніторинг у реальному часі**  
  Відстеження землетрусів, повеней, вулканів і пожеж через IoT-сенсори та глобальні API (USGS, EONET).

- 📈 **Розумне прогнозування**  
  Виявлення критичних подій (наприклад, землетрусів > 4.0 балів) за допомогою алгоритмів аналізу.

- 🗺️ **Інтерактивна панель управління**  
  Живі карти на Leaflet.js та графіки з Chart.js для аналізу даних і трендів.

- 🔔 **Система сповіщень**  
  Миттєві сповіщення при досягненні критичних порогів (через UI або сторонні сервіси).

- 📍 **Геолокація користувача**  
  Визначення найближчої події та відображення її на карті з розрахунком відстані.

---

## 🛠 Технології

| Шар           | Технології                                     |
|---------------|-------------------------------------------------|
| **IoT**       | Спеціалізовані сенсори, API USGS, EONET         |
| **Backend**   | Node.js, PostgreSQL, REST API                   |
| **Frontend**  | React, Leaflet.js, Chart.js, Tailwind CSS       |
| **Протоколи** | MQTT, HTTPS                                     |

---

## 📡 IoT-Сенсори

GeoGuard Pro використовує спеціалізовані сенсори для моніторингу довкілля:

- 🏔️ **Сейсмічні сенсори**  
  Вимірюють коливання ґрунту, інтегровані з USGS API для відстеження землетрусів.

- 🌊 **Сенсори рівня води**  
  Моніторинг річок і озер для прогнозування повеней.

- 🌋🔥 **Сенсори вулканічної активності та пожеж**  
  Збирають дані через API EONET щодо активних пожеж і вивержень.

---

## ⚙️ Архітектура системи

```mermaid
graph LR
    A[IoT Сенсори] --> B[Backend: API & DB]
    B --> C[Frontend: UI/UX]
    B --> D[Зовнішні API: USGS, EONET]
    C --> E[Користувачі: Сповіщення]

- IoT-шар: Збирає дані з довкілля.

- Backend: Обробляє потоки даних, виконує прогнозування та керує сповіщеннями.

- Frontend: Інтерактивна візуалізація, аналітика та користувацькі налаштування.


## 🎯 Основні компоненти

 🔗 **Backend:**

- Збір даних: Інтеграція з IoT-сенсорами та зовнішніми API (USGS, EONET), з фільтрами по датах (3 дні, тиждень, місяць).

- Аналіз та прогнозування: Виявлення критичних подій за заданими порогами.

- Сповіщення: Автоматичне інформування через UI


🎨 **Frontend**
Жива карта: Відображення подій у реальному часі (Leaflet.js).

Аналітика подій: Побудова графіків та статистики (Chart.js).

Панель подій: Інтерфейс критичних інцидентів з деталями (магнітуда, місце, час).

Налаштування користувача: Локальне збереження порогових значень і фільтрів.
