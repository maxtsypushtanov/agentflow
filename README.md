# AgentFlow — Visual Multi-Agent System Builder

<p align="center">
  <strong>The fastest way to prototype multi-agent AI systems</strong>
</p>

AgentFlow is a visual, canvas-based builder for designing multi-agent AI pipelines. Drag, connect, and configure AI agents on an infinite canvas — like n8n, but purpose-built for multi-agent orchestration.

## Features

- **Visual Canvas Editor** — Drag-and-drop nodes onto an infinite, zoomable canvas powered by React Flow
- **9 Node Types** — LLM agents, tools, routers, human-in-the-loop checkpoints, transformers, memory stores, sub-agent groups, inputs, and outputs
- **Properties Panel** — Click any node to configure it: model selection, temperature, system prompts, API endpoints, routing rules, and more
- **Workflow Management** — Save, load, create, and delete workflows. Import/export as JSON files for sharing
- **Execution Simulation** — Simulate pipeline execution with visual feedback (running, success, error states)
- **Dark Theme** — Professional dark UI optimized for extended work sessions
- **Keyboard Shortcuts** — Delete/Backspace to remove selected nodes, snap-to-grid for precise layouts

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/agentflow.git
cd agentflow
npm install
npm run dev
```

The app starts at `http://localhost:5000`.

---

## User Guide

### 1. Canvas Basics

The main workspace is an infinite canvas where you build agent pipelines.

| Action | How |
|---|---|
| **Pan** | Click and drag on empty canvas space |
| **Zoom** | Scroll wheel, or use +/- buttons in the bottom-left controls |
| **Fit to view** | Click the expand icon in the toolbar or bottom-left controls |
| **Select node** | Click on any node |
| **Delete node** | Select it, then press Delete or Backspace |
| **Multi-select** | Hold Shift and click multiple nodes |

### 2. Adding Nodes

The left sidebar contains a **Node Palette** with 9 node types. To add a node:

1. **Drag** any node type from the palette
2. **Drop** it onto the canvas at your desired position

#### Available Node Types

| Node | Icon | Purpose | Configurable Properties |
|---|---|---|---|
| **Input** | Arrow In | Entry point for the pipeline — where data enters | Label, description |
| **LLM Agent** | Bot | An AI language model agent | Model (GPT-4o, Claude, Gemini, etc.), temperature, system prompt |
| **Tool** | Wrench | External API or function call | Endpoint URL, HTTP method |
| **Router** | Git Fork | Conditional routing based on rules | Route labels (comma-separated) |
| **Human Review** | User Check | Human-in-the-loop checkpoint | Label, description |
| **Transformer** | Shuffle | Data transformation between steps | Transform template |
| **Memory** | Database | Shared context store | Memory type (short-term, long-term, vector store) |
| **Sub-Agent Group** | Layers | Nested agent pipeline | Label, description |
| **Output** | Arrow Out | Exit point — where results leave the pipeline | Label, description |

### 3. Connecting Nodes

Connections define data flow between agents:

1. **Hover** over a node's right edge to see the **source handle** (small circle)
2. **Click and drag** from the source handle to another node's **target handle** (left edge)
3. Release to create a connection
4. Connections are visualized as smooth curves with directional flow

**Rules:**
- Input nodes only have source handles (data flows out)
- Output nodes only have target handles (data flows in)
- All other nodes have both source and target handles
- You can create multiple connections from a single output (fan-out)
- You can connect multiple inputs to a single node (fan-in)

### 4. Editing Node Properties

Click any node on the canvas to open the **Properties Panel** in the sidebar:

- **Name** — The display label shown on the node
- **Description** — A short description of what this node does
- **Type-specific settings** — Each node type has its own configuration options:

**LLM Agent Configuration:**
- Model: GPT-4o, GPT-4o Mini, Claude 3.5 Sonnet, Claude 3 Opus, Gemini Pro, Llama 3.1 70B, Mistral Large
- Temperature: 0.0 (deterministic) to 2.0 (creative) via slider
- System Prompt: Define the agent's role and instructions

**Tool Configuration:**
- Endpoint URL: The API endpoint to call
- HTTP Method: GET, POST, PUT, DELETE

**Router Configuration:**
- Routes: Comma-separated list of route labels (e.g., "billing, technical, general")

**Transformer Configuration:**
- Transform Template: Define data transformation logic

**Memory Configuration:**
- Memory Type: Short-term, Long-term, or Vector Store

### 5. Node Actions

Each node supports quick actions:

- **Duplicate** — Hover over a node and click the copy icon, or use the "Duplicate" button in Properties
- **Delete** — Hover and click the trash icon, press Delete/Backspace, or use the "Delete" button in Properties
- Node ID and type are shown at the bottom of the Properties panel

### 6. Workflow Management

#### Saving Workflows
Click **"Save Current"** in the sidebar to save the current canvas state. The workflow name can be edited in the toolbar at the top.

#### Loading Workflows
Click any workflow name in the **Workflows** section of the sidebar to load it onto the canvas.

#### Creating New Workflows
Click the **+** button next to "Workflows" to create a new blank workflow.

#### Deleting Workflows
Click the trash icon next to a workflow name to delete it.

#### Export / Import
- **Export JSON** — Downloads the current workflow as a `.json` file
- **Import JSON** — Upload a `.json` file to load a workflow from disk

JSON format allows you to share workflows with teammates or version-control them in Git.

### 7. Simulation

The simulation feature lets you visualize execution flow through your pipeline:

1. Click the green **"Simulate"** button in the toolbar
2. Watch as nodes transition through states:
   - **Idle** (gray) — Not yet reached
   - **Running** (blue, animated) — Currently executing
   - **Success** (green) — Completed successfully
   - **Error** (red) — Execution failed (5% random chance for realism)
3. Data flows from Input nodes through the pipeline following connections
4. Click **"Stop"** to halt the simulation and reset all states

### 8. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Delete` / `Backspace` | Delete selected nodes |
| `Ctrl+Z` (via React Flow) | Undo last action |
| Scroll wheel | Zoom in/out |
| Click + drag (canvas) | Pan |

---

## Architecture

```
agentflow/
├── client/                    # Frontend (React + Vite)
│   └── src/
│       ├── components/
│       │   ├── nodes/         # Custom node renderers
│       │   │   └── BaseNode.tsx
│       │   ├── panels/        # Sidebar panels
│       │   │   ├── NodePalette.tsx
│       │   │   ├── PropertiesPanel.tsx
│       │   │   └── WorkflowList.tsx
│       │   ├── app-sidebar.tsx
│       │   └── Toolbar.tsx
│       ├── lib/
│       │   ├── store.ts       # Zustand state management
│       │   └── queryClient.ts # TanStack Query config
│       ├── pages/
│       │   └── canvas.tsx     # Main canvas page
│       └── App.tsx
├── server/                    # Backend (Express)
│   ├── routes.ts              # REST API endpoints
│   └── storage.ts             # In-memory storage with demo data
├── shared/
│   └── schema.ts              # Shared types (Drizzle + Zod)
└── README.md
```

### Tech Stack

| Layer | Technology |
|---|---|
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| UI | Tailwind CSS + shadcn/ui |
| Data fetching | TanStack Query |
| Routing | Wouter (hash-based) |
| Backend | Express.js |
| Validation | Zod + Drizzle-Zod |
| Build | Vite |

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workflows` | List all workflows |
| `GET` | `/api/workflows/:id` | Get a single workflow |
| `POST` | `/api/workflows` | Create a new workflow |
| `PATCH` | `/api/workflows/:id` | Update a workflow |
| `DELETE` | `/api/workflows/:id` | Delete a workflow |

---

## Example Workflows

### Customer Support Pipeline (pre-loaded demo)

```
Input → Intent Router ──→ Billing Agent → Stripe API → Output
                     ├──→ Tech Support Agent → Human Review → Output
                     └──→ General Agent → Output
```

### Research Pipeline (build it yourself)

```
Input → Query Transformer → Web Search Tool → LLM Summarizer → Memory Store → Output
```

### Multi-Model Consensus

```
Input → Router ──→ GPT-4o Agent ──→ Consensus Merger → Output
              ├──→ Claude Agent ──┘
              └──→ Gemini Agent ──┘
```

---

## Extending AgentFlow

### Adding a Custom Node Type

1. Add the type to `NodeTypeEnum` in `shared/schema.ts`
2. Add default config in `NODE_DEFAULTS` in `client/src/lib/store.ts`
3. Add icon/color mapping in `BaseNode.tsx`
4. Add to `NodePalette.tsx`
5. Add properties panel fields in `PropertiesPanel.tsx`
6. Register the node type in `canvas.tsx`

---

## License

MIT

---

Built with [Perplexity Computer](https://www.perplexity.ai/computer)
