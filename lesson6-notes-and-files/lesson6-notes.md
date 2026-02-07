# Lesson 6/Intro To Prisma Notes

## Workflow for adding Prisma support to your app

`1. Define Schema → 2. Generate Client → 3. Use in Code → 4. Database Operations`

- Step 1: Schema Definition
  - Define your database structure in schema.prisma
  - Specify models, fields, relationships, and database connection

- Step 2: Client Generation
  - Prisma reads your schema and generates a TypeScript client
  - Provides type-safe methods for all database operations

- Step 3: Code Integration
  - Import and use the generated client in your application
  - Enjoy autocomplete and type checking

- Step 4: Database Operations
  - Prisma translates your method calls to optimized SQL
  - Handles connections, transactions, and error handling

## Lesson Status

Completed up through 3h.

Commands run up until now.
npm install prisma @prisma/client
npx prisma init
npx prisma generate
npx prisma db pull
npx prisma migrate reset
npx prisma migrate dev --name firstMigration
DATABASE_URL=postgresql://node_homework_owner@localhost/testtasklist?host=/tmp npx prisma migrate reset

Output

```
node-homework % git status
On branch assignment6
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   .gitignore
        modified:   package-lock.json
        modified:   package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        database-status.txt
        prisma/

no changes added to commit (use "git add" and/or "git commit -a")
zeus@MacBook-Air-de-Jamie node-homework % mv lesson6-notes.txt lesson6-notes.md
zeus@MacBook-Air-de-Jamie node-homework % brew services list
✔︎ JSON API formula_tap_migrations.jws.json                                                                                                                                              [Downloaded    1.9KB/  1.9KB]
✔︎ JSON API cask_tap_migrations.jws.json                                                                                                                                                 [Downloaded    2.4KB/  2.4KB]
✔︎ JSON API cask.jws.json                                                                                                                                                                [Downloaded   15.3MB/ 15.3MB]
✔︎ JSON API formula.jws.json                                                                                                                                                             [Downloaded   32.0MB/ 32.0MB]
Name          Status  User File
postgresql@14 started zeus ~/Library/LaunchAgents/homebrew.mxcl.postgresql@14.plist
zeus@MacBook-Air-de-Jamie node-homework % npx prisma migrate reset
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "tasklist", schema "public" at "localhost"

✔ Are you sure you want to reset your database? All data will be lost. … yes

Database reset successful


✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 88ms

npm notice
npm notice New major version of npm available! 10.8.2 -> 11.9.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.9.0
npm notice To update run: npm install -g npm@11.9.0
npm notice
zeus@MacBook-Air-de-Jamie node-homework % npx prisma migrate dev --name firstMigration
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "tasklist", schema "public" at "localhost"

Applying migration `20260206214630_first_migration`

The following migration(s) have been created and applied from new schema changes:

prisma/migrations/
  └─ 20260206214630_first_migration/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 90ms

┌─────────────────────────────────────────────────────────┐
│  Update available 6.19.2 -> 7.3.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘

zeus@MacBook-Air-de-Jamie node-homework % DATABASE_URL=postgresql://node_homework_owner@localhost/testtasklist?host=/tmp npx prisma migrate reset
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "testtasklist", schema "public" at "localhost"

✔ Are you sure you want to reset your database? All data will be lost. … yes

Applying migration `20260206214630_first_migration`

Database reset successful

The following migration(s) have been applied:

migrations/
  └─ 20260206214630_first_migration/
    └─ migration.sql

✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 80ms

zeus@MacBook-Air-de-Jamie node-homework %
```

## Proposed text changes

Original
From this point on, if you make a schema change, you change the model, do an npx prisma migrate dev, and then, for the test database, do the corresponding npx prisma migrate deploy.

Proposed
From this point on, if you make a schema change, first change the model, next do an npx prisma migrate dev, last, do the corresponding npx prisma migrate deploy for the test database.

Original

You do not change the schema with ordinary SQL. You'll use the deploy also with the production database you create for Internet deployment of your app in lesson 10. You never use a schema reset with the production database, for the obvious reason that it deletes all the data.

TODO: make these suggestions in the node-homework repo.

TODO: Use commands rather than "You" all the time.

```
..., it also does the following:

await prisma.$disconnect();
    console.log("Prisma disconnected");
```

It does what??? These are commands, not an explanation.

---

For the register method in usercontroller: "b. Fix Register"

Your schema: model users → Prisma client: prisma.users

Current code: prisma.user → undefined → TypeError

Fix: replace all prisma.user references with prisma.users

and

replace
res
.status(201)
.json({ name: result.rows[0].name, email: result.rows[0].email });

with
res.status(201).json({ name: user.name, email: user.email, id: user.id });

---

for "Fix the Task Index Method"

`const tasks = await prisma.task.findMany({` should be `const tasks = await prisma.tasks.findMany({` instead

---

for "Fix Task Update"

rather than

```
try {
  const task = await prisma.task.update({
    data: value,
    where: {
      id,
      userId: global.user_id,
    },
    select: { title: true, isCompleted: true, id: true }
  });
} catch (err) {
  if (err.code === "P2025" ) {
    return res.status(404).json({ message: "The task was not found."})
  } else {
    return next(err); // pass other errors to the global error handler
  }
}
```

---

For "Update the Show Method"

prisma.task.findUnique() does not throw a P2025 error when no record is found. It simply returns null. The P2025 error only occurs with operations that modify data (update, delete, updateMany, etc.) when no matching record exists.

Per https://www.prisma.io/docs/orm/reference/prisma-client-reference#findunique, "By default, both operations return null if the record is not found."
