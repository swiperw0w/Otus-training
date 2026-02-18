# Trustless Marketplace (Escrow dApp)

Децентрализованный маркетплейс с escrow-механизмом, построенный на Ethereum.

Смарт-контракт блокирует средства до выполнения условий сделки:
Клиент создаёт заказ => Фрилансер принимает => Клиент вносит депозит => 
После подтверждения выполнения средства автоматически переводятся исполнителю.

Контракт задеплоен в тестовой сети Sepolia.

Демо:
https://trustless-marketplace-eight.vercel.app/

---

##  Функциональность

- Создание заказа (клиент)
- Принятие заказа (фрилансер)
- Финансирование заказа (депозит ETH)
- Подтверждение выполнения (разблокировка средств)
- Отмена заказа (в зависимости от статуса)
- Комиссия платформы (1%)
- Вывод накопленной комиссии владельцем

---

## Архитектура проекта

Frontend (Vanilla JS + Viem)  
Viem Client (RPC-вызовы)  
Smart Contract (Solidity)  
Сеть Sepolia
Vercel (Хостинг)

Контракт содержит всю бизнес-логику и реализует escrow-модель через state machine.

---

## Смарт-контракт

Контракт: `TrustlessMarketplace.sol`

Основная логика:

- Escrow-механизм
- Машина состояний (enum Status):
  - 0 — Open (Открыт)
  - 1 — Accepted (Принят)
  - 2 — Funded (Оплачен)
  - 3 — Completed (Завершён)
  - 4 — Cancelled (Отменён)
- Защита от повторного входа (ReentrancyGuard)
- Кастомные ошибки
- Логика расчёта комиссии платформы

---

## Используемые технологии

### Смарт-контракт
- Solidity 0.8.28
- OpenZeppelin (Ownable, ReentrancyGuard)
- Hardhat 3.1.8 + Viem
- Hardhat Ignition (деплой)
- Sepolia Testnet

### Фронтенд
- Vanilla JavaScript
- Viem
- HTML + CSS
- Хостинг: Vercel

---

## Установка (локально, если требуется)

Клонировать репозиторий:
git clone https://github.com/swiperw0w/trustless-marketplace.git
cd trustless-marketplace

Установить зависимости:
npx install

Компиляция:
npx hardhat compile

Запуск тестов:
npx hardhat test

Деплой:
npx hardhat ignition deploy ignition/modules/TrustlessMarketplace.js --network sepolia

Деплой фронтенда:
Фронтенд автоматически деплоится через Vercel при push в ветку main.

---

## Тестирование

Юнит-тесты покрывают:

- createOrder
- acceptOrder
- fundOrder
- confirmCompletion
- withdrawFees
- cancelOrder

Все тесты успешно проходят.

---

## Безопасность

- Защита от reentrancy-атак
- Строгая проверка статусов
- Только владелец может выводить комиссию
- Проверка точной суммы депозита
- Использование кастомных ошибок для экономии газа

---

## Возможные улучшения (V2)

- Фронтенд на React + Wagmi
- Поддержка WalletConnect
- Фильтрация заказов
- Улучшенный UI/UX
- Поддержка ERC20-токенов
- Система разрешения споров
- Индексация через The Graph
