# AgentFlow — Визуальный конструктор мультиагентных систем

<p align="center">
  <strong>Быстрое прототипирование и продакшн мультиагентных систем на визуальном канвасе</strong>
</p>

AgentFlow — визуальный редактор для построения мультиагентных систем (по аналогии с n8n/LangGraph Studio). Проектируйте сложные архитектуры агентов — от простых pipeline до Blackboard-паттернов — перетаскивая узлы на канвас и соединяя их.

## Возможности

### Визуальный канвас
- **14 типов узлов**: Input, Output, Router, Loop, LLM Agent, Human Review, Sub-Agents, API Tool, Code Executor, Transformer, Blackboard, Memory, Validator, Aggregator
- **Drag & Drop**: палитра узлов с группировкой (Flow, Agents, Tools, Data)
- **Панель свойств**: настройка каждого узла — system prompt, модель, температура, маршруты, код, JSON-схемы
- **React Flow**: зум, панорама, мини-карта, привязка к сетке

### Интеграция с Cloud.ru Foundation Models
- OpenAI-совместимый API (`/v1/chat/completions`, `/v1/models`)
- Настройка API-ключа, Base URL, модели по умолчанию в **Settings**
- Кнопка **Test Connection** для проверки подключения
- Прокси через бэкенд — ключи не утекают на клиент

### Паттерны архитектуры
Встроенные шаблоны демо-воркфлоу:

| Паттерн | Описание | Демо |
|---------|----------|------|
| **Pipeline** | Последовательная обработка запросов | Customer Support Pipeline |
| **Blackboard** | Общее пространство знаний, доступное всем агентам | Blackboard: Research Synthesis |
| **ReAct** | Цикл Reasoning → Action → Observation | Code Generation & Review |
| **Hierarchical** | Супервизор управляет подчинёнными агентами | Определён в типах |
| **Voting / Map-Reduce** | Параллельное голосование / агрегация | Определён в типах |

### Валидация структурного вывода
- Узел **Validator**: JSON Schema, regex, custom function
- API эндпоинт `POST /api/validate` для программной валидации
- Поддержка `guided_json` / `response_format` при вызове Cloud.ru

### Песочница исполнения кода
- Узел **Code Executor**: написание и запуск JavaScript/Python прямо в редакторе
- Кнопка **Run** в панели свойств с отображением результата
- Бэкенд `POST /api/sandbox/execute` — изолированное исполнение с таймаутом
- Настройка таймаута и включение/отключение в Settings

### Продакшн-бэкенд (REST API)
Используйте AgentFlow как бэкенд для продакшн-приложений:

```bash
# Запуск воркфлоу
POST /api/execute/:workflowId
Body: { "input": { "query": "..." } }

# Статус выполнения
GET /api/execute/status/:executionId

# Валидация данных
POST /api/validate
Body: { "data": ..., "schema": "...", "schemaType": "json-schema" }

# Список моделей Cloud.ru
GET /api/cloudru/models

# CRUD воркфлоу
GET    /api/workflows
POST   /api/workflows
GET    /api/workflows/:id
PATCH  /api/workflows/:id
DELETE /api/workflows/:id
```

### Экспорт / Импорт
- **Export JSON** — сохранение воркфлоу в файл
- **Import JSON** — загрузка ранее сохранённого воркфлоу
- **Save Current** — сохранение текущего состояния на сервере

## Быстрый старт

### Установка

```bash
git clone https://github.com/maxtsypushtanov/agentflow.git
cd agentflow
npm install
```

### Запуск (разработка)

```bash
npm run dev
```

Сервер стартует на `http://localhost:5000`. Фронтенд (Vite) и бэкенд (Express) на одном порту.

### Сборка и продакшн

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

### Настройка Cloud.ru

1. Откройте **Settings** (иконка шестерёнки в сайдбаре)
2. Введите **API Key** (Bearer Token) от Cloud.ru Foundation Models
3. Укажите **Base URL** (по умолчанию `https://api.cloud.ru/v1`)
4. Выберите **Default Model** из доступных в `/v1/models`
5. Нажмите **Test Connection** для проверки
6. Нажмите **Save Settings**

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Фронтенд | React, TypeScript, Tailwind CSS, shadcn/ui |
| Канвас | React Flow (@xyflow/react) |
| Состояние | Zustand |
| Бэкенд | Express.js, TypeScript |
| Сборка | Vite + esbuild |
| Маршрутизация | wouter (hash-based) |

## Структура проекта

```
agentflow/
├── client/
│   └── src/
│       ├── components/
│       │   ├── nodes/         # BaseNode — рендеринг 14 типов узлов
│       │   ├── panels/        # NodePalette, PropertiesPanel, WorkflowList
│       │   ├── app-sidebar.tsx # Боковая панель
│       │   └── Toolbar.tsx    # Панель инструментов канваса
│       ├── pages/
│       │   ├── canvas.tsx     # Главная страница — канвас
│       │   └── settings.tsx   # Страница настроек
│       └── lib/
│           └── store.ts       # Zustand store
├── server/
│   ├── routes.ts              # API маршруты + движок исполнения
│   └── storage.ts             # In-memory хранилище + демо-воркфлоу
└── shared/
    └── schema.ts              # Типы данных, 14 типов узлов
```

## Лицензия

MIT
