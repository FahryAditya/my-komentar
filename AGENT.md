AI Coding Agent — Kerangka Inti

1. Gambaran Project

AI Coding Agent adalah aplikasi yang membantu developer membaca, menganalisis, membuat, mengubah, dan menjalankan project secara langsung.

Agent memiliki sistem Permission & Approval agar tindakan sensitif membutuhkan persetujuan pengguna.

Contoh tindakan sensitif:

Membaca .env

Mengakses API key / token / secret

Menghapus file penting

Menghapus database

Menjalankan command berbahaya

Mengubah konfigurasi production

Deploy ke production

Mengirim data ke layanan eksternal

Prinsip utama:

Default Safe — Sensitive Action Requires Approval

2. Tech Stack

Frontend

TypeScript

Next.js

Framer Motion

React Spring

TSParticles

AOS

GSAP (GreenSock Animation Platform)

Fungsi utama Frontend

Dashboard

Project Manager

File Explorer

Code Editor

AI Chat

Terminal

Diff Viewer

Approval Dialog

Agent Activity

Settings

Permission Manager

3. Backend

NestJS

Backend menggunakan NestJS sebagai server utama.

Alasan

Modular architecture

Dependency Injection

Cocok untuk aplikasi kompleks

Mudah membuat sistem permission

Mudah memisahkan AI Agent dan tools

Cocok untuk REST/WebSocket

Mudah dikembangkan menjadi sistem multi-agent

4. Database

PostgreSQL

PostgreSQL digunakan untuk menyimpan data aplikasi.

Data utama

users
projects
project_members
agent_sessions
messages
tool_calls
permissions
approvals
file_changes
audit_logs
settings

5. Arsitektur Utama

                         AI CODING AGENT
                               │
                ┌──────────────┴──────────────┐
                │                             │
             FRONTEND                      BACKEND
                │                             │
             Next.js                       NestJS
                │                             │
        ┌───────┼────────┐          ┌─────────┼─────────┐
        │       │        │          │         │         │
       UI    Editor   Terminal    Agent     Tools    Security
        │                          │
        │                     ┌────┴────┐
        │                     │         │
        │                  Planner   Executor
        │
        └────────────── API / WebSocket
                               │
                         PostgreSQL

6. Backend Module

Struktur utama NestJS:

backend/
│
├── src/
│   │
│   ├── agent/
│   │   ├── agent.controller.ts
│   │   ├── agent.service.ts
│   │   ├── agent.module.ts
│   │   ├── planner/
│   │   └── executor/
│   │
│   ├── ai/
│   │   ├── ai.service.ts
│   │   ├── providers/
│   │   └── ai.module.ts
│   │
│   ├── tools/
│   │   ├── file.tool.ts
│   │   ├── terminal.tool.ts
│   │   ├── search.tool.ts
│   │   └── tools.module.ts
│   │
│   ├── files/
│   │   ├── file.service.ts
│   │   ├── file.controller.ts
│   │   └── files.module.ts
│   │
│   ├── terminal/
│   │   ├── terminal.service.ts
│   │   └── terminal.module.ts
│   │
│   ├── permissions/
│   │   ├── permission.service.ts
│   │   ├── permission.guard.ts
│   │   └── permissions.module.ts
│   │
│   ├── approvals/
│   │   ├── approval.service.ts
│   │   └── approvals.module.ts
│   │
│   ├── projects/
│   │   ├── project.service.ts
│   │   └── projects.module.ts
│   │
│   ├── security/
│   │   ├── secret-scanner.ts
│   │   ├── sandbox.ts
│   │   └── security.module.ts
│   │
│   ├── audit/
│   │   ├── audit.service.ts
│   │   └── audit.module.ts
│   │
│   └── database/
│       └── prisma/
│
└── package.json

7. AI Agent Core

AI Agent memiliki dua bagian utama:

Agent
│
├── Planner
│   └── Menentukan langkah yang diperlukan
│
└── Executor
    └── Menjalankan tool yang diperlukan

Contoh:

User:
"Tambahkan dark mode ke project"

        ↓

Agent Planner

        ↓

1. Scan project
2. Cari konfigurasi Tailwind
3. Baca layout
4. Baca global CSS
5. Tentukan file yang perlu diubah

        ↓

Agent Executor

        ↓

Edit files

        ↓

Run test / build

        ↓

Report hasil

8. File System Permission

Allowed Automatically

Agent dapat membaca:

.ts
.tsx
.js
.jsx
.json
.css
.scss
.html
.md
.yaml
.yml

Agent dapat:

READ
CREATE
EDIT
SEARCH
ANALYZE

9. Sensitive Files

File berikut dianggap sensitif:

.env
.env.local
.env.production
*.pem
*.key
credentials.json
service-account.json

Default:

ACCESS = DENIED

Jika Agent membutuhkan akses:

┌─────────────────────────────────────┐
│ 🔐 Permission Required              │
│                                     │
│ AI Agent ingin membaca:             │
│ .env.local                          │
│                                     │
│ Alasan:                             │
│ Memeriksa konfigurasi database.     │
│                                     │
│ [ Deny ] [ Allow Once ]             │
└─────────────────────────────────────┘

10. File Editing

Agent dapat:

Create File
Edit File
Rename File
Move File
Format File
Refactor Code

Untuk perubahan besar, tampilkan Diff:

- const oldCode = true;
+ const newCode = false;

User dapat:

[ Accept ]
[ Reject ]
[ Review ]

11. File Delete

Delete memiliki tingkat keamanan lebih tinggi.

AI → Delete File
       │
       ↓
Permission Check
       │
       ↓
Approval Required
       │
       ├── Reject
       │
       └── Approve
              │
              ↓
           Delete

12. Terminal Tool

Agent dapat menjalankan command yang aman.

Contoh

npm install
npm run dev
npm run build
npm run test
npm run lint
git status
git diff

Command berbahaya harus diblokir atau membutuhkan approval.

Contoh:

rm -rf
format disk
DROP DATABASE
TRUNCATE
shutdown

13. Tool Manager

Semua kemampuan Agent melewati Tool Manager.

Agent
  │
  ↓
Tool Manager
  │
  ├── File Tool
  ├── Search Tool
  ├── Terminal Tool
  ├── Git Tool
  ├── Test Tool
  └── Build Tool

Tool Manager bertugas:

Validasi tool

Validasi permission

Memeriksa risiko

Meminta approval jika diperlukan

Menjalankan tool

Mencatat hasil

14. Permission Levels

LEVEL 0 — SAFE
│
├── Read normal files
├── Search files
├── Analyze code
└── Generate code

LEVEL 1 — WRITE
│
├── Create files
├── Edit files
└── Refactor

LEVEL 2 — RESTRICTED
│
├── Delete files
├── Install packages
├── Git commit
└── Run special commands

LEVEL 3 — SENSITIVE
│
├── Read .env
├── Read secrets
├── Access credentials
└── External data transfer

LEVEL 4 — CRITICAL
│
├── Delete database
├── Production deployment
├── Financial action
└── Destructive system command

15. Approval System

Approval digunakan ketika Agent ingin melakukan tindakan sensitif.

Flow:

Agent
  ↓
Request Tool
  ↓
Permission Manager
  ↓
Risk Check
  ↓
Is Approval Required?
  │
  ├── No → Execute
  │
  └── Yes
        ↓
   Approval Request
        ↓
   User Decision
        │
     ┌──┴──┐
     ↓     ↓
  Approve Reject
     │
     ↓
  Execute

16. Audit Log

Setiap tindakan penting dicatat.

Contoh:

timestamp
user_id
project_id
agent_id
tool
action
target
permission
approval
result
error

Contoh log:

[06:20:10]
Agent: CodingAgent

Action:
READ

Target:
src/app/page.tsx

Permission:
SAFE

Result:
SUCCESS

17. Security Layer

Security Layer bertugas melindungi:

Secrets
Files
Database
Terminal
Network
User Permission
Project

Fitur:

Secret detection

Path validation

Command validation

Permission validation

Sandbox

Rate limit

Audit log

Approval system

Access control

18. Frontend Flow

Login
  ↓
Dashboard
  ↓
Select Project
  ↓
Project Workspace
  │
  ├── File Explorer
  ├── Code Editor
  ├── AI Chat
  ├── Terminal
  ├── Diff
  └── Activity

19. AI Workspace

Konsep UI:

┌──────────────┬──────────────────────┬──────────────┐
│              │                      │              │
│ File         │ Code Editor          │ AI Agent     │
│ Explorer     │                      │ Chat         │
│              │                      │              │
│ src/         │ page.tsx             │ User:        │
│ ├─ app       │                      │ "Fix error"  │
│ ├─ components│                      │              │
│ └─ lib       │                      │ Agent:       │
│              │                      │ Analyzing... │
│              │                      │              │
├──────────────┴──────────────────────┴──────────────┤
│ Terminal / Agent Activity                           │
└─────────────────────────────────────────────────────┘

20. Database Relationship

User
 │
 ├── Projects
 │      │
 │      ├── Agent Sessions
 │      │       │
 │      │       ├── Messages
 │      │       └── Tool Calls
 │      │
 │      ├── File Changes
 │      │
 │      └── Audit Logs
 │
 └── Permissions

21. Core Database Tables

users

id
name
email
password_hash
created_at
updated_at

projects

id
user_id
name
path
created_at
updated_at

agent_sessions

id
project_id
status
created_at
updated_at

messages

id
session_id
role
content
created_at

tool_calls

id
session_id
tool
action
target
status
created_at

permissions

id
user_id
project_id
resource
action
level
created_at

approvals

id
tool_call_id
status
approved_by
created_at

audit_logs

id
user_id
project_id
action
target
result
created_at

22. Prinsip AI Agent

1. User tetap memiliki kontrol.
2. Agent tidak memiliki akses penuh secara default.
3. Sensitive resource menggunakan approval.
4. Destructive action menggunakan approval.
5. Semua tool call harus divalidasi.
6. Semua tindakan penting dicatat.
7. Agent tidak boleh melakukan privilege escalation.
8. Agent tidak boleh membaca secret tanpa izin.
9. Agent tidak boleh mengirim secret ke external service.
10. Jika permission tidak jelas → STOP.
11. Jika target file tidak jelas → STOP.
12. Jika tindakan berisiko tinggi → ASK USER.
13. Gunakan sandbox untuk eksekusi yang diperlukan.
14. Batasi retry agar Agent tidak masuk infinite loop.
15. Fail closed jika validasi keamanan gagal.

23. MVP

Versi pertama tidak perlu langsung memiliki semua fitur.

MVP 1

✓ Login
✓ Project
✓ File Explorer
✓ File Reader
✓ File Editor
✓ AI Chat
✓ Permission System
✓ Approval Dialog
✓ Basic Terminal
✓ Audit Log

MVP 2

✓ Git integration
✓ Diff viewer
✓ Automatic test
✓ Build checker
✓ Code analysis
✓ Better sandbox

MVP 3

✓ Multi-agent
✓ Agent memory
✓ Advanced terminal
✓ Deployment assistant
✓ Plugin/tool system
✓ Team collaboration

24. Prinsip Arsitektur

AI
 ↓
Planner
 ↓
Tool Manager
 ↓
Permission Manager
 ↓
Approval System
 ↓
Security Layer
 ↓
Tool Execution
 ↓
Audit Log

Agent tidak boleh langsung melakukan aksi.

Semua aksi harus melewati:

Tool → Permission → Security → Approval (jika perlu) → Execute → Audit

25. Target Akhir

Project ini ditujukan sebagai:

AI-powered development workspace yang dapat memahami project, membaca dan mengubah source code, menjalankan development tools, serta tetap memberikan kontrol penuh kepada developer melalui permission, approval, sandbox, dan audit system.