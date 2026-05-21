This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.




For my deployment reminders during development:
Prisma:
After making a change to schema.prisma:
`npx prisma migrate dev --name describe-your-change`
`npx prisma generate`
`npx prisma studio` --> opens a browser UI to browse/edit tables directly


Vercel:
Everytime code gets pushed to GitHub main branch, Vercel detects push, automatically rebuilds and redeploys, live site updates