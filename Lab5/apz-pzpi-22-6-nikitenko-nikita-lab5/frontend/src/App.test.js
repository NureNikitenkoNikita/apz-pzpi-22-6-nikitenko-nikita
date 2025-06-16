import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Мокуємо localStorage, оскільки він недоступний у тестовому середовищі за замовчуванням
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    removeItem: function (key) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

test('renders login page by default if no token', () => {
  localStorage.clear(); // Переконаємось, що токену немає
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Перевіряємо, чи відображається текст, що вказує на сторінку входу
  // Залежить від тексту, який відображається у вашому компоненті Login
  const loginElement = screen.getByText(/Login/i); // Пошук по тексту "Login"
  expect(loginElement).toBeInTheDocument();
});

test('renders dashboard page if token exists', () => {
  localStorage.setItem('token', 'fake-token'); // Встановлюємо фейковий токен
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Перевіряємо, чи відображається текст, що вказує на сторінку дашборда
  // Залежить від тексту, який відображається у вашому компоненті DashboardPage
  // Наприклад, якщо DashboardPage містить h1 з текстом "Dashboard", можна перевірити так:
  const dashboardElement = screen.getByText(/Dashboard/i); // Змініть на реальний текст з DashboardPage
  expect(dashboardElement).toBeInTheDocument();
});